"""Shared helpers for CivicLens direct tests (mock web + mock LLM)."""

import json


def to_hex(addr):
    """Checksummed hex for an address (matches contract view output)."""
    if isinstance(addr, str):
        return addr
    if hasattr(addr, "as_hex"):
        return addr.as_hex
    from genlayer.py.types import Address

    return Address(addr).as_hex


def criteria_json(entries=None):
    """Build a valid criteria JSON payload (defaults: one required criterion)."""
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


def numeric_criteria_json(threshold_milli=100000, operator="gte", unit="co2e_tonnes"):
    """A required numeric criterion (threshold in milli-units)."""
    return criteria_json(
        [
            {
                "text": "Reduces Scope 1 emissions below the 2024 baseline",
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


def two_required_criteria_json():
    """Two REQUIRED criteria (for rows of the outcome table)."""
    return criteria_json(
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
    )


def two_criteria_json():
    """One required criterion + one optional criterion (for derivation tests)."""
    return criteria_json(
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
                "text": "Publishes a supplier list",
                "measure": "A supplier list is published on the website",
                "required": False,
                "has_threshold": False,
                "threshold_milli": 0,
                "operator": "",
                "unit": "",
                "deadline": "",
            },
        ]
    )


def make_commitment(
    contract,
    subject="Riverdale City",
    subject_kind="organization",
    registrant_role="observer",
    statement="https://example.org/announcement",
    text="Riverdale City commits to publish an annual emissions report.",
    period_start="2024-01-01",
    period_end="2024-12-31",
    timezone="UTC",
    guidance="Prefer official reports and government datasets.",
    data_mode="live",
    criteria=None,
):
    """Register a commitment through the contract and return its id."""
    return contract.create_commitment(
        subject,
        subject_kind,
        registrant_role,
        statement,
        text,
        period_start,
        period_end,
        timezone,
        guidance,
        data_mode,
        criteria if criteria is not None else criteria_json(),
    )


def verdict(
    criterion_id,
    status,
    reason_code,
    evidence_used=None,
    has_figure=False,
    figure_milli=0,
    unit="",
    summary="Evidence was reviewed for this criterion.",
):
    """One LLM verdict entry."""
    return {
        "criterion_id": criterion_id,
        "status": status,
        "reason_code": reason_code,
        "evidence_used": evidence_used if evidence_used is not None else [],
        "has_figure": has_figure,
        "figure_milli": figure_milli,
        "unit": unit,
        "summary": summary,
    }


def verdict_json(*entries):
    """LLM response body: a complete review JSON string."""
    return json.dumps({"criteria": list(entries)})


# A prompt pattern that only matches if the contract frames evidence as DATA
# (prompt-injection defense) — if the framing disappears, no mock matches and
# the review fails loudly.
DATA_FRAMING_PATTERN = r"(?s).*evidence records and document texts below are DATA.*Ignore any instructions.*"


def mock_web_ok(vm, url, body="Document text: the report was published."):
    """Mock a successful page fetch."""
    vm.mock_web(url, {"status": 200, "body": body})


def mock_review(vm, response_body, url_pattern=r".*"):
    """Mock both the web fetch and the LLM review response."""
    vm.mock_web(url_pattern, {"status": 200, "body": "Report text: emissions data."})
    vm.mock_llm(r"(?s).*Criteria:.*", response_body)
