"""EvidenceReview consensus tests: leader/validator equivalence behavior.

Covers (docs/equivalence-design.md): happy-path review recording, validator
agreement/disagreement on every decision field, reason-code equivalence
groups, figure tolerance and threshold-side rule, the leader-error
classification path, and failed-review retry with no recorded outcome.
"""

from tests.direct.conftest import (
    DOC_BODY,
    figure_body,
    make_commitment,
    numeric_criteria_json,
    verdict,
    verdict_json,
)

EVIDENCE_URL = "https://reports.example.org/2024"


def _mock_docs(vm, url_pattern=r".*", body=DOC_BODY):
    vm.mock_web(url_pattern, {"status": 200, "body": body})


def _mock_llm(vm, response_body):
    vm.mock_llm(r"(?s).*Criteria:.*", response_body)


def test_supported_review_records_round(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")

    direct_vm.sender = direct_alice
    _mock_docs(direct_vm)
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1], summary="The report documents the commitment.")
        ),
    )
    assert c.request_review(cid) == 1

    outcome = c.get_outcome(cid)
    assert outcome["has_outcome"] is True
    assert outcome["overall_outcome"] == "supported"
    assert outcome["overall_reason"] == "all_required_supported"
    assert outcome["round"] == 1
    assert outcome["status"] == "outcome_accepted"

    rounds = c.get_rounds(cid)
    res = rounds[0]["criteria"][0]
    assert res["status"] == "supported"
    assert res["evidence_used"] == [1]
    assert res["evidence_considered_not_used"] == []
    assert res["summary"].startswith("The report documents")


def test_validator_agrees_with_identical_mocks(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    c.request_review(cid)
    assert direct_vm.run_validator() is True


def test_validator_disagrees_on_status(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    c.request_review(cid)

    # Validator sees contradicting evidence instead.
    direct_vm.clear_mocks()
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "contradicted", "contradicting_evidence_found", [1])))
    assert direct_vm.run_validator() is False


def test_validator_exact_match_on_inconclusive_reason(direct_vm, direct_deploy, direct_alice):
    """Inconclusive-family reasons are NOT interchangeable (drives the copy)."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence")))
    c.request_review(cid)

    direct_vm.clear_mocks()
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "inconclusive", "source_conflict")))
    assert direct_vm.run_validator() is False


def test_validator_reason_equivalence_group_accepted(direct_vm, direct_deploy, direct_alice, direct_bob):
    """threshold_met ≡ supporting_evidence_found for the same figure."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=100000))
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "government_dataset", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _mock_docs(direct_vm)
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=125000, unit="co2e_tonnes")
        ),
    )
    c.request_review(cid)

    direct_vm.clear_mocks()
    _mock_docs(direct_vm)
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(
                1, "supported", "supporting_evidence_found", [1], has_figure=True, figure_milli=125000, unit="co2e_tonnes"
            )
        ),
    )
    assert direct_vm.run_validator() is True


def test_figure_tolerance_within_5_percent(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=100000))
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "government_dataset", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _mock_docs(direct_vm)
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=100000, unit="co2e_tonnes")
        ),
    )
    c.request_review(cid)

    # 4% apart, same side of the threshold -> equivalent
    direct_vm.clear_mocks()
    _mock_docs(direct_vm)
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=104000, unit="co2e_tonnes")
        ),
    )
    assert direct_vm.run_validator() is True


def test_figure_different_side_of_threshold_rejected(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=100000))
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "government_dataset", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _mock_docs(direct_vm, body=figure_body((100000, "co2e_tonnes")))
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=100000, unit="co2e_tonnes", period_matches=True)
        ),
    )
    c.request_review(cid)

    # within tolerance but on the WRONG side of the threshold -> not equivalent
    direct_vm.clear_mocks()
    _mock_docs(direct_vm, body=figure_body((99000, "co2e_tonnes")))
    _mock_llm(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=99000, unit="co2e_tonnes", period_matches=True)
        ),
    )
    assert direct_vm.run_validator() is False


def test_validator_rejects_citation_outside_set(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    c.request_review(cid)

    # The leader claims a verdict citing evidence 99 that was never submitted.
    forged = verdict_json(verdict(1, "supported", "supporting_evidence_found", [99]))
    assert direct_vm.run_validator(leader_result=forged) is False


def test_leader_error_external_agreement(direct_vm, direct_deploy, direct_alice):
    """Both nodes failing identically on an unreachable source agrees (retryable)."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")

    # A successful review captures the validator for later runs.
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    c.request_review(cid)

    # Drop every mock: the validator's re-run fails with the same EXTERNAL
    # error. The harness stringifies the carrier into the leader's message,
    # so pass an exception whose str() is the exact prefix-checked message.
    direct_vm.clear_mocks()
    err = RuntimeError("EXTERNAL: evidence unreachable")
    assert direct_vm.run_validator(leader_error=err) is True


def test_leader_error_disagreement_when_validator_succeeds(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")

    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence")))
    c.request_review(cid)  # captures the validator

    # Leader errored but this node can fetch fine -> disagree.
    err = RuntimeError("EXTERNAL: evidence unreachable")
    assert direct_vm.run_validator(leader_error=err) is False


def test_leader_llm_error_always_disagrees(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")

    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence")))
    c.request_review(cid)  # captures the validator

    # LLM errors always disagree, even when this node would produce the same
    # failure (docs: force retry with a fresh leader).
    err = RuntimeError("LLM_ERROR: invalid review json")
    assert direct_vm.run_validator(leader_error=err) is False


def test_failed_review_records_nothing_then_retry_succeeds(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    direct_vm.sender = direct_alice

    # No web mocks: all evidence unreachable -> review fails, nothing recorded.
    with direct_vm.expect_revert("EXTERNAL: evidence unreachable"):
        c.request_review(cid)
    assert c.get_commitment(cid)["status"] == "evidence_open"
    assert c.get_rounds(cid) == []

    # Retry with sources reachable: the same round is used and recorded once.
    _mock_docs(direct_vm)
    _mock_llm(direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    assert c.request_review(cid) == 1
    assert len(c.get_rounds(cid)) == 1


def test_partial_unreachable_evidence_degrades_to_unavailable(direct_vm, direct_deploy, direct_alice):
    """One dead source does not abort the review; the prompt marks it."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    c.submit_evidence(cid, "https://dead.example.org/report", "news_article", "2024-07-01", "")

    direct_vm.mock_web(EVIDENCE_URL, {"status": 200, "body": "The report documents 90 tonnes."})
    # dead.example.org is intentionally unmocked -> web.get fails -> the prompt
    # marks it UNRETRIEVABLE rather than including text.
    direct_vm.mock_llm(
        r"(?s).*NOT RETRIEVABLE.*",
        verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])),
    )
    assert c.request_review(cid) == 1
    res = c.get_rounds(cid)[0]["criteria"][0]
    assert res["evidence_used"] == [1]
    assert res["evidence_considered_not_used"] == [2]
    # The failed source is visible in the recorded retrieval report, so a
    # reader can tell it was not read rather than judged irrelevant.
    round_rec = c.get_rounds(cid)[0]
    statuses = {r["evidence_id"]: r["status"] for r in round_rec["retrieval"]}
    assert statuses[1] == "fetched"
    assert statuses[2] == "unreachable"
