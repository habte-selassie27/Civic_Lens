"""State machine tests: every valid transition and the documented rejections.

Transitions under test (docs/state-diagram.md):
  create -> evidence_open
  evidence_open -> outcome_accepted        (request_review, registrant)
  outcome_accepted -> challenged           (open_challenge, anyone)
  challenged -> outcome_accepted           (request_review round n+1)
  evidence_open -> withdrawn               (withdraw, registrant)
  supersede -> superseded + new version
Rejected: review after withdraw, challenge before outcome, double challenge
for one round, party challenge limit, round limit, bad challenge inputs.
"""

from tests.direct.conftest import (
    DOC_BODY,
    criteria_json,
    make_commitment,
    two_criteria_json,
    verdict,
    verdict_json,
)

EVIDENCE_URL = "https://reports.example.org/2024"


def _review_round(c, vm, response_body):
    vm.mock_web(r".*", {"status": 200, "body": DOC_BODY})
    vm.mock_llm(r"(?s).*Criteria:.*", response_body)
    return c


def test_full_happy_path_transitions(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    assert c.get_commitment(cid)["status"] == "evidence_open"

    # evidence_open -> outcome_accepted (round 1)
    direct_vm.sender = direct_bob
    c.submit_evidence(
        cid, EVIDENCE_URL, "official_report", "2024-06-01", "supports the claim"
    )
    direct_vm.sender = direct_alice
    _review_round(c, direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    round1 = c.request_review(cid)
    assert round1 == 1
    assert c.get_commitment(cid)["status"] == "outcome_accepted"

    # outcome_accepted -> challenged (anyone)
    direct_vm.sender = direct_bob
    challenge_id = c.open_challenge(cid, "", "The 2024 report contradicts this claim.", [])
    assert challenge_id == 1
    assert c.get_commitment(cid)["status"] == "challenged"

    # challenged -> outcome_accepted (round 2, includes new evidence)
    c.submit_evidence(
        cid, "https://reports.example.org/2024-update", "audited_statement", "2024-11-01", ""
    )
    direct_vm.sender = direct_alice
    direct_vm.clear_mocks()
    _review_round(c, direct_vm, verdict_json(verdict(1, "contradicted", "contradicting_evidence_found", [2], reconsidered=True)))
    round2 = c.request_review(cid)
    assert round2 == 2
    assert c.get_commitment(cid)["status"] == "outcome_accepted"

    rounds = c.get_rounds(cid)
    assert [r["round"] for r in rounds] == [1, 2]
    assert rounds[0]["trigger"] == "initial"
    assert rounds[1]["trigger"] == "challenge"
    assert rounds[1]["challenge_id"] == 1
    # prior round history preserved (append-only)
    assert rounds[0]["overall_outcome"] == "supported"


def test_review_after_withdraw_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.withdraw_commitment(cid)
    with direct_vm.expect_revert("EXPECTED: commitment is not open for review"):
        c.request_review(cid)


def test_review_requires_registrant(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: only the registrant can request a review"):
        c.request_review(cid)


def test_review_after_outcome_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid)
    with direct_vm.expect_revert("EXPECTED: round already reviewed; open a challenge instead"):
        c.request_review(cid)


def test_challenge_before_outcome_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    with direct_vm.expect_revert("EXPECTED: no accepted outcome to challenge"):
        c.open_challenge(cid, "", "The evidence was misread by the committee.", [])


def test_second_challenge_same_round_rejected(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid)
    direct_vm.sender = direct_bob
    c.open_challenge(cid, "", "The report does not cover the full year.", [])
    with direct_vm.expect_revert("EXPECTED: this round is already challenged"):
        c.open_challenge(cid, "", "Another party disputes the same round.", [])


def test_party_challenge_limit(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid)

    # challenger A opens the only challenge of round 1
    direct_vm.sender = direct_bob
    c.open_challenge(cid, "", "The report does not cover the full year.", [])
    direct_vm.sender = direct_alice
    direct_vm.clear_mocks()
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid)

    # A hits the per-party limit; B may still challenge this round
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: challenge limit reached for this party"):
        c.open_challenge(cid, "", "A second challenge from the same party.", [])
    direct_vm.sender = direct_charlie
    c.open_challenge(cid, "", "A different party challenges round two.", [])


def test_round_limit_enforced(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    ok = verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True))
    challengers = [direct_bob, direct_charlie]
    for expected_round in (1, 2, 3):
        direct_vm.clear_mocks()
        _review_round(c, direct_vm, ok)
        assert c.request_review(cid) == expected_round
        if expected_round < 3:
            direct_vm.sender = challengers[expected_round - 1]
            c.open_challenge(cid, "", f"Challenge for round {expected_round}.", [])
            direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: round limit reached"):
        c.open_challenge(cid, "", "No challenge may exceed the round limit.", [])


def test_challenge_grounds_bounds(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid)
    with direct_vm.expect_revert("EXPECTED: grounds must be 10 to 1000 characters"):
        c.open_challenge(cid, "", "short", [])
    with direct_vm.expect_revert("EXPECTED: target must be empty or a criterion id"):
        c.open_challenge(cid, "not-a-number", "Valid grounds string.", [])
    with direct_vm.expect_revert("EXPECTED: unknown target criterion"):
        c.open_challenge(cid, "99", "Valid grounds string.", [])
    # valid target: the criterion id
    c.open_challenge(cid, "1", "Valid grounds string.", [])


def test_challenge_target_cli_shapes(direct_vm, direct_deploy, direct_alice):
    """int criterion ids and null (whole outcome) are accepted; wrong types
    fail fast with a stable EXPECTED prefix instead of an AttributeError."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid1 = make_commitment(c)
    cid2 = make_commitment(c, subject="Second Subject City")

    with direct_vm.expect_revert("EXPECTED: target must be a string"):
        c.open_challenge(cid1, True, "Valid grounds string.", [])
    with direct_vm.expect_revert("EXPECTED: grounds must be a string"):
        c.open_challenge(cid1, "", 123, [])

    # int target behaves like its string form (the CLI coerces '1' to 1)
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid1)
    c.open_challenge(cid1, 1, "Valid grounds string.", [])
    assert c.get_commitment(cid1)["status"] == "challenged"

    # null target = whole-outcome challenge
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid2)
    c.open_challenge(cid2, None, "Valid grounds string.", [])
    assert c.get_commitment(cid2)["status"] == "challenged"


def test_challenge_unknown_evidence_id(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(
        cid, EVIDENCE_URL, "official_report", "2024-06-01", ""
    )
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", [1])))
    c.request_review(cid)
    with direct_vm.expect_revert("EXPECTED: unknown evidence id; submit it first"):
        c.open_challenge(cid, "", "Grounds referencing unsubmitted evidence.", [77])


def test_supersede_after_review_creates_fresh_version(direct_vm, direct_deploy, direct_alice):
    """A new version path keeps working after review (criteria stay immutable)."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    _review_round(c, direct_vm, verdict_json(verdict(1, "inconclusive", "no_relevant_evidence", reconsidered=True)))
    c.request_review(cid)
    new_id = c.supersede_commitment(
        cid,
        "Riverdale City",
        "organization",
        "observer",
        "https://example.org/announcement-v2",
        "Riverdale City commits to publish quarterly emissions briefings.",
        "2024-01-01",
        "2024-12-31",
        "UTC",
        "",
        "live",
        criteria_json(),
    )
    old = c.get_commitment(cid)
    fresh = c.get_commitment(new_id)
    assert old["status"] == "superseded"
    assert old["round_count"] == 1  # history intact on the old version
    assert fresh["version"] == 2
    assert fresh["supersedes"] == cid
    assert fresh["status"] == "evidence_open"
    assert fresh["round_count"] == 0


def test_evidence_open_during_challenge_window(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Evidence submitted while challenged counts for round n+1."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_criteria_json())
    direct_vm.sender = direct_bob
    c.submit_evidence(cid, EVIDENCE_URL, "official_report", "2024-06-01", "")
    direct_vm.sender = direct_alice
    _review_round(c, direct_vm, verdict_json(verdict(1, "supported", "supporting_evidence_found", [1])))
    c.request_review(cid)
    c.open_challenge(cid, "", "New evidence will change this outcome.", [])
    new_ev = c.submit_evidence(
        cid, "https://reports.example.org/late", "government_dataset", "2024-12-01", ""
    )
    assert new_ev == 2
    assert c.get_commitment(cid)["status"] == "challenged"
