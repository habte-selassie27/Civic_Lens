"""Integration tests — GenLayer Studio (studionet) via gltest.

Run with: gltest tests/integration/ -v -s

Deterministic by design: every review transaction carries a transaction
context of mock validators whose web + LLM responses are fixture documents
defined in this file (sample data, clearly labeled — never findings about a
real organization). Consensus outcomes are therefore reproducible.

Covers AGENTS section 17: deploy, supported, contradicted, inconclusive for
missing/conflicting evidence, leader/validator agreement, tolerance between
slightly different valid outputs, required-criterion disagreement (not
equivalent), forged/garbage leader rejection, and a challenge round that
changes the outcome through a new round.
"""

import json

from gltest import get_contract_factory, get_validator_factory
from gltest.assertions import tx_execution_succeeded

WI = 3000   # wait interval (ms)
WR = 100    # wait retries (300 s max per transaction)

STATEMENT_URL = "https://example.org/announcement"
REPORT_URL = "https://evidence.example.org/report-2024"
CONTRARY_URL = "https://evidence.example.org/contrary-2024"
GVMDT = "2024-12-31T12:00:00Z"

# Sample fixture documents (labeled sample data, not real findings).
STATEMENT_BODY = "The original announcement of the 2024 commitment."
# The figure sentence states a RANGE. A numeric verdict is only kept if the
# cited passage contains its figure, so a single fixed number would fail every
# validator that extracted a slightly different one. Stating 100.0 through 104.0
# lets five validators report small variance and still each quote a passage
# that really does contain their figure. Kept under the contract's 300-char
# quote bound so the whole body can be quoted verbatim.
REPORT_BODY = (
    "Riverdale City sustainability report 2024. Scope 1 emissions were reduced "
    "to 100.0, 101.0, 102.0, 103.0 or 104.0 co2e tonnes depending on the "
    "accounting boundary used, below the committed ceiling of 100."
)
CONTRARY_BODY = (
    "Independent audit dataset: Riverdale Scope 1 emissions for 2024 were "
    "150 co2e tonnes, above the committed ceiling."
)


# --------------------------------------------------------------------------
# Local helpers. gltest's import mode does not put the project root on
# sys.path, so this file is self-contained instead of importing tests.*.
# --------------------------------------------------------------------------
def criteria_json(entries=None):
    if entries is None:
        entries = [
            {
                "text": "Publishes an annual emissions report",
                "measure": "An official report covering the year is published",
                "required": True,
                "has_threshold": False,
                "threshold_milli": 0,
                "operator": "",
                "unit": "",
                "deadline": "",
            }
        ]
    return json.dumps(entries)


def numeric_criteria_json(threshold_milli=100000, unit="co2e_tonnes", operator="gte"):
    return json.dumps(
        [
            {
                "text": "Keeps Scope 1 emissions below the 2024 ceiling",
                "measure": "Reported Scope 1 emissions in co2e tonnes for 2024",
                "required": True,
                "has_threshold": True,
                "threshold_milli": threshold_milli,
                "operator": operator,
                "unit": unit,
                "deadline": "",
            }
        ]
    )


def verdict(criterion_id, status, reason_code, evidence_used=None, has_figure=False,
            figure_milli=0, unit="", summary="Evidence was reviewed.",
            source_quote=None, period_matches=None, reconsidered=None):
    """One mock model verdict.

    Defaults mirror what the review prompt asks a model to produce. A NUMERIC
    definite verdict must quote a passage that CONTAINS its figure, or the
    contract demotes that criterion to inconclusive (figure_unverified) — so
    the default quote is the fixture document itself, which really does contain
    every figure the tolerance test extracts. `reconsidered` is mandatory on a
    criterion a challenge targeted.
    """
    definite = status in ("supported", "contradicted")
    if source_quote is None:
        source_quote = REPORT_BODY if definite else ""
    if period_matches is None:
        period_matches = has_figure
    return {
        "criterion_id": criterion_id,
        "status": status,
        "reason_code": reason_code,
        "evidence_used": evidence_used if evidence_used is not None else [],
        "has_figure": has_figure,
        "figure_milli": figure_milli,
        "unit": unit,
        "period_matches": period_matches is True,
        "source_quote": source_quote,
        "reconsidered": reconsidered is True,
        "summary": summary,
    }


def verdict_json(*entries):
    return json.dumps({"criteria": list(entries)})


def default_web_table():
    return {
        STATEMENT_URL: {"method": "GET", "status": 200, "body": STATEMENT_BODY},
        REPORT_URL: {"method": "GET", "status": 200, "body": REPORT_BODY},
        CONTRARY_URL: {"method": "GET", "status": 200, "body": CONTRARY_BODY},
    }


def ctx(llm_tables, web=None):
    """Transaction context with one mock validator per LLM table.

    Each validator re-runs the review independently against its own table,
    so equivalent-but-different tables exercise the real equivalence rule.
    """
    factory = get_validator_factory()
    web_table = web if web is not None else default_web_table()
    validators = [
        factory.create_mock_validator(
            mock_llm_response={"nondet_exec_prompt": table},
            mock_web_response={"nondet_web_request": web_table},
        )
        for table in llm_tables
    ]
    return {
        "validators": [v.to_dict() for v in validators],
        "genvm_datetime": GVMDT,
    }


def ctx_identical(response_body, count=5, key="Criteria:", web=None):
    table = {key: response_body}
    return ctx([table] * count, web=web)


def deploy():
    return get_contract_factory("CivicLens").deploy(wait_interval=WI, wait_retries=WR)


def create_commitment(contract, criteria=None):
    tx = contract.create_commitment(
        args=[
            "Riverdale City",
            "organization",
            "observer",
            STATEMENT_URL,
            "Riverdale City commits to keep Scope 1 emissions below 100 "
            "co2e tonnes in 2024.",
            "2024-01-01",
            "2024-12-31",
            "UTC",
            "Prefer audited statements and government datasets.",
            "live",
            criteria if criteria is not None else criteria_json(),
        ]
    ).transact(wait_interval=WI, wait_retries=WR)
    assert consensus_ok(tx)


def submit_evidence(contract, cid, url, day):
    tx = contract.submit_evidence(
        args=[cid, url, "official_report", day, ""]
    ).transact(wait_interval=WI, wait_retries=WR)
    assert consensus_ok(tx)


def review(contract, cid, context, rotations=None):
    return contract.request_review(args=[cid]).transact(
        transaction_context=context,
        consensus_max_rotations=rotations,
        wait_interval=WI,
        wait_retries=WR,
    )


def consensus_ok(tx) -> bool:
    """Consensus committed: leader executed AND the result was not dropped.

    tx_execution_succeeded only checks the leader's execution; a NO_MAJORITY
    cancellation also carries a successful leader receipt, so it must be
    excluded explicitly.
    """
    return tx_execution_succeeded(tx) and tx.get("result_name") != "NO_MAJORITY"


def no_majority(tx) -> bool:
    """Consensus did not commit: validators failed to reach a strict majority."""
    return tx.get("result_name") == "NO_MAJORITY"


def outcome_of(contract, cid):
    return contract.get_outcome(args=[cid]).call()


def rounds_of(contract, cid):
    return contract.get_rounds(args=[cid]).call()


# --------------------------------------------------------------------------
# Tests
# --------------------------------------------------------------------------
def test_deploy_write_read_roundtrip():
    """Deploy succeeds; a write is visible to a read (full round trip)."""
    contract = deploy()
    create_commitment(contract)

    rec = contract.get_commitment(args=[1]).call()
    assert rec["subject"] == "Riverdale City"
    assert rec["status"] == "evidence_open"
    assert rec["data_mode"] == "live"

    consts = contract.get_constants(args=[]).call()
    assert consts["max_rounds"] == 3


def test_supported_review_consensus():
    """Clear supporting evidence -> supported; five validators agree."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")

    context = ctx_identical(
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1],
                    summary="The official report documents the commitment.")
        )
    )
    tx = review(contract, 1, context)
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["has_outcome"] is True
    assert outcome["overall_outcome"] == "supported"
    assert outcome["overall_reason"] == "all_required_supported"
    assert outcome["status"] == "outcome_accepted"

    rounds = rounds_of(contract, 1)
    assert len(rounds) == 1
    assert rounds[0]["round"] == 1
    assert rounds[0]["trigger"] == "initial"
    res = rounds[0]["criteria"][0]
    assert res["status"] == "supported"
    assert list(res["evidence_used"]) == [1]


def test_contradicted_review_consensus():
    """Clear contradicting evidence -> contradicted (not merely absence)."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, CONTRARY_URL, "2024-09-01")

    context = ctx_identical(
        verdict_json(
            verdict(1, "contradicted", "contradicting_evidence_found", [1],
                    summary="The audit dataset conflicts with the criterion.")
        )
    )
    tx = review(contract, 1, context)
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["overall_outcome"] == "contradicted"
    assert outcome["overall_reason"] == "required_criterion_contradicted"


def test_inconclusive_missing_evidence():
    """Nothing submitted -> inconclusive / no_relevant_evidence, never contradicted."""
    contract = deploy()
    create_commitment(contract)

    # Only the source statement is fetched; the prompt says so explicitly.
    context = ctx_identical(
        verdict_json(verdict(1, "inconclusive", "no_relevant_evidence")),
        key="no evidence was submitted",
    )
    tx = review(contract, 1, context)
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["overall_outcome"] == "inconclusive"
    assert outcome["overall_reason"] == "no_relevant_evidence"


def test_inconclusive_source_conflict():
    """Two authoritative sources disagree -> inconclusive / source_conflict."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")
    submit_evidence(contract, 1, CONTRARY_URL, "2024-09-01")

    context = ctx_identical(
        verdict_json(
            verdict(1, "inconclusive", "source_conflict", [1, 2],
                    summary="The report and the audit dataset disagree.")
        )
    )
    tx = review(contract, 1, context)
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["overall_outcome"] == "inconclusive"
    assert outcome["overall_reason"] == "source_conflict"
    res = rounds_of(contract, 1)[0]["criteria"][0]
    assert list(res["evidence_used"]) == [1, 2]


def test_figures_within_tolerance_reach_consensus():
    """Slightly different but valid validator outputs agree (5% figure band)."""
    contract = deploy()
    create_commitment(contract, criteria=numeric_criteria_json(threshold_milli=100000))
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")

    # Five validators extract the figure with small reporting variance; all
    # are within 5% and on the same side of the threshold -> equivalent.
    figures = [100000, 101000, 102000, 103000, 104000]
    tables = [
        {"Criteria:": verdict_json(
            verdict(1, "supported", "threshold_met", [1], has_figure=True,
                    figure_milli=f, unit="co2e_tonnes")
        )}
        for f in figures
    ]
    tx = review(contract, 1, ctx(tables))
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["overall_outcome"] == "supported"
    res = rounds_of(contract, 1)[0]["criteria"][0]
    assert res["has_figure"] is True
    # The stored figure is the leader's — within the tolerance band.
    assert res["figure_milli"] in figures


def test_required_criterion_disagreement_not_equivalent():
    """Validators disagreeing on a required criterion -> no outcome recorded."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")

    good = {"Criteria:": verdict_json(
        verdict(1, "supported", "supporting_evidence_found", [1])
    )}
    other = {"Criteria:": verdict_json(
        verdict(1, "contradicted", "contradicting_evidence_found", [1])
    )}
    # 2 + 2 validators: no majority is possible -> consensus never finalizes.
    tx = review(contract, 1, ctx([good, good, other, other]), rotations=2)
    # 2-2 split: no strict majority agrees, so consensus drops the result.
    assert no_majority(tx)

    # Failed review records nothing and leaves the state machine intact.
    outcome = outcome_of(contract, 1)
    assert outcome["has_outcome"] is False
    assert outcome["status"] == "evidence_open"
    assert rounds_of(contract, 1) == []


def test_forged_leader_rejected_by_majority():
    """A leader citing evidence outside the set is rejected; honest majority wins."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")

    good = {"Criteria:": verdict_json(
        verdict(1, "supported", "supporting_evidence_found", [1])
    )}
    forged = {"Criteria:": verdict_json(
        verdict(1, "supported", "supporting_evidence_found", [99])
    )}
    # 4 honest validators, 1 forger: forged leaders fail invariants, honest
    # leaders are accepted by the majority (4/5).
    tx = review(contract, 1, ctx([good, good, good, good, forged]), rotations=8)
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["overall_outcome"] == "supported"
    res = rounds_of(contract, 1)[0]["criteria"][0]
    assert list(res["evidence_used"]) == [1]  # never the forged [99]


def test_garbage_llm_output_never_finalizes():
    """Unparseable LLM output -> LLM_ERROR; validators disagree, no outcome."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")

    context = ctx_identical("this is not json at all {", count=4)
    tx = review(contract, 1, context, rotations=2)
    assert not consensus_ok(tx)
    assert outcome_of(contract, 1)["has_outcome"] is False
    assert rounds_of(contract, 1) == []


def test_challenge_round_changes_outcome():
    """Round 1 supported -> challenge with new evidence -> round 2 contradicted."""
    contract = deploy()
    create_commitment(contract)
    submit_evidence(contract, 1, REPORT_URL, "2024-06-01")

    supported = ctx_identical(
        verdict_json(
            verdict(1, "supported", "supporting_evidence_found", [1])
        )
    )
    tx = review(contract, 1, supported)
    assert consensus_ok(tx)
    assert outcome_of(contract, 1)["overall_outcome"] == "supported"

    # Anyone may submit new evidence and challenge the accepted outcome.
    submit_evidence(contract, 1, CONTRARY_URL, "2024-11-01")
    # The challenge MUST attach the new evidence. A challenge on its own is a
    # claim, not evidence: the contract holds a previous finding unless the new
    # round cites something added since the last review (see CHALLENGE_SEMANTICS
    # and _apply_challenge_rules).
    tx = contract.open_challenge(
        args=[1, "", "The audited dataset contradicts the accepted outcome.", [2]]
    ).transact(wait_interval=WI, wait_retries=WR)
    assert consensus_ok(tx)

    challenges = contract.get_challenges(args=[1]).call()
    assert len(challenges) == 1
    assert challenges[0]["round_challenged"] == 1
    assert list(challenges[0]["new_evidence_ids"]) == [2]

    # Round 2 re-reviews, cites the NEW evidence, and flips the outcome. The
    # verdict must mark the whole-outcome challenge as reconsidered.
    contradicted = ctx_identical(
        verdict_json(
            verdict(1, "contradicted", "contradicting_evidence_found", [2],
                    source_quote=CONTRARY_BODY,
                    reconsidered=True,
                    summary="The audit dataset contradicts the criterion.")
        )
    )
    tx = review(contract, 1, contradicted)
    assert consensus_ok(tx)

    outcome = outcome_of(contract, 1)
    assert outcome["round"] == 2
    assert outcome["overall_outcome"] == "contradicted"
    assert outcome["status"] == "outcome_accepted"

    rounds = rounds_of(contract, 1)
    assert [r["round"] for r in rounds] == [1, 2]
    assert [r["trigger"] for r in rounds] == ["initial", "challenge"]
    # Prior round history is preserved (append-only).
    assert rounds[0]["overall_outcome"] == "supported"
    assert rounds[1]["challenge_id"] == challenges[0]["id"]
