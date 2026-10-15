"""CommitmentRegistry tests: creation validation, bounds, access control,
subject rule, immutability/supersede, and evidence intake."""

from tests.direct.conftest import (
    criteria_json,
    make_commitment,
    numeric_criteria_json,
    to_hex,
    two_criteria_json,
)


def test_create_and_read_back(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice

    cid = make_commitment(c)
    assert cid == 1

    rec = c.get_commitment(cid)
    assert rec["subject"] == "Riverdale City"
    assert rec["status"] == "evidence_open"
    assert rec["registrant"] == to_hex(direct_alice)
    assert rec["version"] == 1
    assert rec["supersedes"] == 0
    assert rec["round_count"] == 0
    assert rec["data_mode"] == "live"
    assert len(rec["criteria"]) == 1
    assert rec["criteria"][0]["required"] is True
    assert rec["criteria"][0]["text"].startswith("Publishes an annual")


def test_create_requires_source_statement(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: source statement link is required"):
        make_commitment(c, statement="")


def test_create_rejects_non_http_statement(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: source statement link must be an http(s) url"):
        make_commitment(c, statement="ftp://example.org/x")


def test_subject_rule_rejects_private_individuals(direct_vm, direct_deploy, direct_alice):
    """Privacy rule: public organizations and institutions only (tested)."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: private individuals cannot be subjects"):
        make_commitment(c, subject="Jane Q. Citizen", subject_kind="individual")


def test_unknown_subject_kind_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: unknown subject kind"):
        make_commitment(c, subject_kind="dog")


def test_bad_period_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: period start is after period end"):
        make_commitment(c, period_start="2024-12-31", period_end="2024-01-01")


def test_bad_date_format_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: period must be YYYY-MM-DD dates"):
        make_commitment(c, period_start="2024-13-01", period_end="2024-14-01")


def test_no_required_criterion_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    optional_only = criteria_json(
        [
            {
                "text": "Publishes a supplier list",
                "measure": "A supplier list exists on the site",
                "required": False,
                "has_threshold": False,
                "threshold_milli": 0,
                "operator": "",
                "unit": "",
                "deadline": "",
            }
        ]
    )
    with direct_vm.expect_revert("EXPECTED: at least one criterion must be required"):
        make_commitment(c, criteria=optional_only)


def test_too_many_criteria_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    entries = []
    for i in range(6):
        entries.append(
            {
                "text": f"Criterion number {i} text",
                "measure": f"Measure number {i} text",
                "required": i == 0,
                "has_threshold": False,
                "threshold_milli": 0,
                "operator": "",
                "unit": "",
                "deadline": "",
            }
        )
    with direct_vm.expect_revert("EXPECTED: criteria count must be 1 to 5"):
        make_commitment(c, criteria=criteria_json(entries))


def test_criteria_json_type_and_validity(direct_vm, direct_deploy, direct_alice):
    """Bad calldata gets stable EXPECTED prefixes, never a raw traceback.

    The canonical input is a JSON string; the genlayer CLI coerces '[...]'
    tokens into lists before encoding, so lists are accepted too and run
    through the identical validation path. Other types fail fast.
    """
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    # A list is accepted and validated exactly like the JSON-string form.
    with direct_vm.expect_revert("EXPECTED: criterion text and measure are required"):
        make_commitment(c, criteria=[{"text": "missing the measure field"}])
    # A fully valid list registers successfully (the CLI write path).
    cid = make_commitment(
        c,
        criteria=[
            {
                "text": "Publishes an annual emissions report",
                "measure": "An official report covering the year",
                "required": True,
                "has_threshold": False,
                "threshold_milli": 0,
                "operator": "",
                "unit": "",
                "deadline": "",
            }
        ],
    )
    assert cid == 1
    # Anything that is neither a JSON string nor a list fails fast.
    with direct_vm.expect_revert("EXPECTED: criteria must be a json string"):
        make_commitment(c, criteria=42)
    with direct_vm.expect_revert("EXPECTED: criteria is not valid json"):
        make_commitment(c, criteria="{not json")


def test_threshold_requires_unit(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    bad = criteria_json(
        [
            {
                "text": "Reduces Scope 1 emissions",
                "measure": "Reported Scope 1 emissions for 2024",
                "required": True,
                "has_threshold": True,
                "threshold_milli": 1000,
                "operator": "gte",
                "unit": "",
                "deadline": "",
            }
        ]
    )
    with direct_vm.expect_revert("EXPECTED: unit is required with a threshold"):
        make_commitment(c, criteria=bad)


def test_criteria_are_immutable_guard(direct_vm, direct_deploy, direct_alice):
    """Criteria cannot be edited in place, even before review."""
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    with direct_vm.expect_revert(
        "EXPECTED: criteria are immutable; create a new version with supersede_commitment"
    ):
        c.update_criteria(cid, numeric_criteria_json())


def test_supersede_creates_linked_version(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    new_id = c.supersede_commitment(
        cid,
        "Riverdale City",
        "organization",
        "observer",
        "https://example.org/announcement-v2",
        "Riverdale City commits to publish an annual emissions report by March.",
        "2024-01-01",
        "2024-12-31",
        "UTC",
        "",
        "live",
        criteria_json(),
    )
    assert new_id == 2
    fresh = c.get_commitment(new_id)
    assert fresh["version"] == 2
    assert fresh["supersedes"] == cid
    old = c.get_commitment(cid)
    assert old["status"] == "superseded"


def test_supersede_requires_registrant(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: only the registrant can supersede"):
        c.supersede_commitment(
            cid,
            "Riverdale City",
            "organization",
            "observer",
            "https://example.org/announcement",
            "Riverdale City commits to publish an annual emissions report.",
            "2024-01-01",
            "2024-12-31",
            "UTC",
            "",
            "live",
            criteria_json(),
        )


def test_withdraw_only_registrant_and_only_open(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: only the registrant can withdraw"):
        c.withdraw_commitment(cid)
    direct_vm.sender = direct_alice
    c.withdraw_commitment(cid)
    assert c.get_commitment(cid)["status"] == "withdrawn"
    with direct_vm.expect_revert("EXPECTED: only open commitments can be withdrawn"):
        c.withdraw_commitment(cid)


def test_evidence_submission_and_readback(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)

    direct_vm.sender = direct_bob
    ev_id = c.submit_evidence(
        cid, "https://reports.example.org/2024", "official_report", "2024-06-01", "Annual report"
    )
    assert ev_id == 1
    items = c.get_evidence(cid)
    assert len(items) == 1
    assert items[0]["url"] == "https://reports.example.org/2024"
    assert items[0]["evidence_type"] == "official_report"
    assert items[0]["submitter"] == to_hex(direct_bob)
    # stance-like note is stored but advisory
    assert items[0]["note"] == "Annual report"


def test_duplicate_evidence_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.submit_evidence(cid, "https://reports.example.org/2024", "official_report", "2024-06-01", "")
    with direct_vm.expect_revert("EXPECTED: duplicate evidence url"):
        c.submit_evidence(
            cid, "https://reports.example.org/2024#section", "news_article", "2024-07-01", ""
        )


def test_unknown_evidence_type_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    with direct_vm.expect_revert("EXPECTED: unknown evidence type"):
        c.submit_evidence(cid, "https://x.example.org/a", "vibes", "2024-06-01", "")


def test_evidence_url_scheme_enforced(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    with direct_vm.expect_revert("EXPECTED: evidence url must be an http(s) url"):
        c.submit_evidence(cid, "javascript:alert(1)", "other", "", "")


def test_evidence_date_format_enforced(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    with direct_vm.expect_revert("EXPECTED: published_date must be YYYY-MM-DD or empty"):
        c.submit_evidence(cid, "https://x.example.org/a", "other", "June 2024", "")


def test_str_input_type_guards(direct_vm, direct_deploy, direct_alice):
    """CLI-shaped calldata gets stable EXPECTED prefixes, never a traceback.

    The genlayer CLI coerces '' to 0 and numbers stay numbers; hand-built
    calldata can carry anything for a str parameter. Optional fields also
    accept null (JSON null via the CLI) and store it as ''.
    """
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: subject must be a string"):
        make_commitment(c, subject=42)
    with direct_vm.expect_revert("EXPECTED: period_start must be a string"):
        make_commitment(c, period_start=0)
    cid = make_commitment(c)
    with direct_vm.expect_revert("EXPECTED: url must be a string"):
        c.submit_evidence(cid, 0, "official_report", "2024-06-01", "")
    with direct_vm.expect_revert("EXPECTED: published_date must be a string"):
        c.submit_evidence(cid, "https://x.example.org/a", "official_report", 0, "")
    with direct_vm.expect_revert("EXPECTED: note must be a string"):
        c.submit_evidence(cid, "https://x.example.org/a", "official_report", "2024-06-01", 0)
    # null is accepted for optional fields and stored as empty
    c.submit_evidence(cid, "https://x.example.org/b", "official_report", None, None)
    assert c.get_evidence(cid)[0]["note"] == ""
    assert c.get_evidence(cid)[0]["published_date"] == ""


def test_per_submitter_evidence_limit(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    for i in range(8):
        c.submit_evidence(
            cid, f"https://site.example.org/doc-{i}", "news_article", "2024-06-01", ""
        )
    with direct_vm.expect_revert("EXPECTED: per-submitter evidence limit reached"):
        c.submit_evidence(cid, "https://site.example.org/doc-8", "news_article", "2024-06-01", "")


def test_total_evidence_limit(direct_vm, direct_deploy, direct_alice, direct_accounts):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    # 20 items from many submitters
    for i in range(20):
        direct_vm.sender = direct_accounts[i % 10]
        c.submit_evidence(
            cid, f"https://site.example.org/paper-{i}", "news_article", "2024-06-01", ""
        )
    direct_vm.sender = direct_accounts[0]
    with direct_vm.expect_revert("EXPECTED: evidence limit reached for this commitment"):
        c.submit_evidence(cid, "https://site.example.org/paper-21", "news_article", "2024-06-01", "")


def test_evidence_rejected_after_withdraw(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c)
    c.withdraw_commitment(cid)
    with direct_vm.expect_revert("EXPECTED: evidence window is closed for this commitment"):
        c.submit_evidence(cid, "https://x.example.org/a", "other", "", "")


def test_unknown_commitment_id(direct_vm, direct_deploy):
    c = direct_deploy("contracts/civic_lens.py")
    with direct_vm.expect_revert("EXPECTED: commitment not found"):
        c.get_commitment(99)


def test_pagination_newest_first(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    for i in range(5):
        make_commitment(c, subject=f"Org {i + 1}")
    page1 = c.get_commitments(2, 0)
    assert [r["id"] for r in page1] == [5, 4]
    page2 = c.get_commitments(2, page1[-1]["id"])
    assert [r["id"] for r in page2] == [3, 2]
    with direct_vm.expect_revert("EXPECTED: page_size must be 1 to 20"):
        c.get_commitments(0, 0)


def test_get_constants_exposes_bounds_and_enums(direct_vm, direct_deploy):
    c = direct_deploy("contracts/civic_lens.py")
    consts = c.get_constants()
    assert consts["max_criteria"] == 5
    assert consts["max_rounds"] == 3
    assert "individual" in consts["subject_kinds"]
    assert "official_report" in consts["evidence_types"]
    assert "criterion_ambiguous" in consts["reason_codes"]


def test_numeric_criteria_roundtrip(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=numeric_criteria_json(threshold_milli=100000))
    crit = c.get_commitment(cid)["criteria"][0]
    assert crit["has_threshold"] is True
    assert crit["threshold_milli"] == 100000
    assert crit["unit"] == "co2e_tonnes"
    assert crit["operator"] == "gte"


def test_two_criteria_roundtrip(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/civic_lens.py")
    direct_vm.sender = direct_alice
    cid = make_commitment(c, criteria=two_criteria_json())
    crits = c.get_commitment(cid)["criteria"]
    assert len(crits) == 2
    assert crits[0]["required"] is True
    assert crits[1]["required"] is False
