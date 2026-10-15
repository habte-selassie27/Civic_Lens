"""Outcome derivation tests: every row of the AGENTS section 8 table.

The overall outcome is derived in plain code from per-criterion results:
  all required supported          -> supported
  any required contradicted       -> contradicted
  otherwise                       -> inconclusive
Non-required criteria never decide the outcome. Absence of evidence is
inconclusive, never contradicted.
"""

from tests.direct.conftest import (
    criteria_json,
    make_commitment,
    numeric_criteria_json,
    two_criteria_json,
    two_required_criteria_json,
    verdict,
    verdict_json,
)

EVIDENCE_URL = "https://reports.example.org/2024"


def _mock_review(vm, response_body):
    vm.mock_web(r".*", {"status": 200, "body": "Report text with data."})
    vm.mock_llm(r"(?s).*Criteria:.*", response_body)


def test_all_required_supported_overall_supported(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_criteria_json())
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1]),
            verdict(2, "inconclusive", "no_relevant_evidence"),
        ),
    )
    c.request_review(cid)
    outcome = c.get_outcome(cid)
    assert outcome["overall_outcome"] == "supported"
    assert outcome["overall_reason"] == "all_required_supported"
    # optional criterion recorded but did not decide
    crits = c.get_rounds(cid)[0]["criteria"]
    assert crits[1]["status"] == "inconclusive"


def test_any_required_contradicted_overall_contradicted(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_required_criteria_json())
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1]),
            verdict(2, "contradicted", "contradicting_evidence_found", [1]),
        ),
    )
    c.request_review(cid)
    outcome = c.get_outcome(cid)
    assert outcome["overall_outcome"] == "contradicted"
    assert outcome["overall_reason"] == "required_criterion_contradicted"


def test_required_inconclusive_overall_inconclusive(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm, verdict_json(verdict(1, "inconclusive", "evidence_unavailable"))
    )
    c.request_review(cid)
    outcome = c.get_outcome(cid)
    assert outcome["overall_outcome"] == "inconclusive"
    assert outcome["overall_reason"] == "evidence_unavailable"


def test_optional_criterion_never_flips_outcome(direct_vm, direct_deploy, direct_alice):
    """A contradicted OPTIONAL criterion cannot make the overall contradicted."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_criteria_json())
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1]),
            verdict(2, "contradicted", "contradicting_evidence_found", [1]),
        ),
    )
    c.request_review(cid)
    assert c.get_outcome(cid)["overall_outcome"] == "supported"

    # And an optional inconclusive cannot flip it either (second commitment on
    # the same deployment: direct mode allows one deploy per test).
    cid2 = make_commitment(c, criteria=two_criteria_json())
    c.submit_evidence(cid2, EVIDENCE_URL, "official_report", "2024-06-01", "")
    direct_vm.clear_mocks()
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [2]),
            verdict(2, "inconclusive", "source_conflict"),
        ),
    )
    c.request_review(cid2)
    assert c.get_outcome(cid2)["overall_outcome"] == "supported"


def test_absence_of_evidence_is_inconclusive_not_contradicted(
    direct_vm, direct_deploy, direct_alice
):
    """Zero evidence -> review runs against the source statement only."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    # Mock the source statement URL (no evidence exists).
    direct_vm.mock_web(
        r"https://example\.org/announcement", {"status": 200, "body": "The announcement."}
    )
    direct_vm.mock_llm(
        r"(?s).*no evidence was submitted.*", verdict_json(verdict(1, "inconclusive", "no_relevant_evidence"))
    )
    c.request_review(cid)
    outcome = c.get_outcome(cid)
    assert outcome["overall_outcome"] == "inconclusive"
    assert outcome["overall_reason"] == "no_relevant_evidence"


def test_contradicted_beats_inconclusive_per_table(direct_vm, direct_deploy, direct_alice):
    """Any required contradicted -> contradicted, even with another inconclusive."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(
        c,
        criteria=criteria_json(
            [
                {
                    "text": "Publishes an annual emissions report",
                    "measure": "An official report covering the year is published",
                    "required": True,
                    "has_threshold": False,
                    "threshold_milli": 0,
                    "operator": "",
                    "unit": "",
                    "deadline": "",
                },
                {
                    "text": "Reduces Scope 1 emissions below baseline",
                    "measure": "Reported Scope 1 emissions in co2e tonnes",
                    "required": True,
                    "has_threshold": False,
                    "threshold_milli": 0,
                    "operator": "",
                    "unit": "",
                    "deadline": "",
                },
            ]
        ),
    )
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "inconclusive", "no_relevant_evidence"),
            verdict(2, "contradicted", "contradicting_evidence_found", [1]),
        ),
    )
    c.request_review(cid)
    assert c.get_outcome(cid)["overall_outcome"] == "contradicted"


def test_overall_reason_priority(direct_vm, direct_deploy, direct_alice):
    """Two inconclusive required criteria: highest-priority reason wins."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_required_criteria_json())
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "inconclusive", "no_relevant_evidence"),
            verdict(2, "inconclusive", "source_conflict"),
        ),
    )
    c.request_review(cid)
    assert c.get_outcome(cid)["overall_reason"] == "source_conflict"


def test_numeric_threshold_exact_boundary(direct_vm, direct_deploy, direct_alice):
    """Figure exactly at a gte threshold is supported; just below is contradicted."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=100000))
    c.submit_evidence(cid, EVIDENCE_URL, "government_dataset", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=100000, unit="co2e_tonnes")
        ),
    )
    c.request_review(cid)
    outcome = c.get_outcome(cid)
    assert outcome["overall_outcome"] == "supported"
    res = c.get_rounds(cid)[0]["criteria"][0]
    assert res["has_figure"] is True
    assert res["figure_milli"] == 100000
    assert res["unit"] == "co2e_tonnes"

    # Just below: a measured figure on the wrong side is CONTRADICTED (it is
    # contradicting evidence, not absence of evidence). Second commitment on
    # the same deployment (one deploy per test in direct mode).
    cid2 = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=100000))
    c.submit_evidence(cid2, EVIDENCE_URL, "government_dataset", "2024-06-01", "")
    direct_vm.clear_mocks()
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(
                1, "contradicted", "threshold_not_met", [2], has_figure=True, figure_milli=99000, unit="co2e_tonnes"
            )
        ),
    )
    c.request_review(cid2)
    assert c.get_outcome(cid2)["overall_outcome"] == "contradicted"


def test_lte_threshold_direction(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=50000, operator="lte"))
    c.submit_evidence(cid, EVIDENCE_URL, "government_dataset", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True, figure_milli=45000, unit="co2e_tonnes")
        ),
    )
    c.request_review(cid)
    assert c.get_outcome(cid)["overall_outcome"] == "supported"


def test_counts_summary_in_outcome(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_criteria_json())
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    _mock_review(
        direct_vm,
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1]),
            verdict(2, "inconclusive", "no_relevant_evidence"),
        ),
    )
    c.request_review(cid)
    outcome = c.get_outcome(cid)
    assert outcome["required_total"] == 1
    assert outcome["counts"]["supported"] == 1
    assert outcome["counts"]["inconclusive"] == 1


def test_outcome_empty_before_review(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    outcome = c.get_outcome(cid)
    assert outcome["has_outcome"] is False
    assert outcome["status"] == "evidence_open"
