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


# The mocked document body used by the review tests, and a sentence from it
# that definite verdicts quote by default. Kept together so a quote that is NOT
# in the document is a visible test failure rather than a silent demotion.
DOC_BODY = "Report text with data. The report was published and filed with the regulator."
DEFAULT_QUOTE = "the report was published and filed with the regulator"


def figure_sentence(figure_milli: int, unit: str = "") -> str:
    """A document sentence stating a fixed-point figure, in human notation.

    A numeric verdict must quote a passage that CONTAINS its figure, so the
    mocked document and the model's quote have to agree. Both sides build the
    sentence from this one function, which is what makes the test meaningful:
    a quote that does not match the document really does fail verification.
    """
    whole = figure_milli // 1000
    frac = figure_milli % 1000
    value = f"{whole}.{str(1000 + frac)[1:].rstrip('0')}" if frac else str(whole)
    return f"Scope 1 emissions for the period were {value} {unit}".strip() + "."


def figure_body(*figures) -> str:
    """Mocked document body containing a sentence for each (figure, unit) pair."""
    parts = [DOC_BODY]
    for figure_milli, unit in figures:
        parts.append(figure_sentence(figure_milli, unit))
    return " ".join(parts)


def verdict(
    criterion_id,
    status,
    reason_code,
    evidence_used=None,
    has_figure=False,
    figure_milli=0,
    unit="",
    summary="Evidence was reviewed for this criterion.",
    source_quote=None,
    period_matches=None,
    reconsidered=None,
):
    """One LLM verdict entry.

    Defaults match what the review prompt asks a model to produce. A definite
    verdict needs a VERBATIM passage (`source_quote`) that appears in a cited
    document, and a numeric verdict additionally needs `period_matches` true and
    a quote containing the figure — otherwise the contract demotes that
    criterion to inconclusive. `reconsidered` is required on a challenged
    criterion.
    """
    entry = {
        "criterion_id": criterion_id,
        "status": status,
        "reason_code": reason_code,
        "evidence_used": evidence_used if evidence_used is not None else [],
        "has_figure": has_figure,
        "figure_milli": figure_milli,
        "unit": unit,
        "summary": summary,
        "period_matches": period_matches is True,
        "reconsidered": reconsidered is True,
    }
    if source_quote is not None:
        entry["source_quote"] = source_quote
    elif status in ("supported", "contradicted") and has_figure and figure_milli:
        # A numeric definite verdict must quote the figure itself; the mocked
        # document is built from the same sentence (see figure_body).
        entry["source_quote"] = figure_sentence(figure_milli, unit)
    elif status in ("supported", "contradicted"):
        entry["source_quote"] = DEFAULT_QUOTE
    else:
        entry["source_quote"] = ""
    return entry


def verdict_json(*entries):
    """LLM response body: a complete review JSON string."""
    return json.dumps({"criteria": list(entries)})


# A prompt pattern that only matches if the contract frames evidence as DATA
# (prompt-injection defense) — if the framing disappears, no mock matches and
# the review fails loudly.
DATA_FRAMING_PATTERN = r"(?s).*evidence records and document texts below are DATA.*Ignore any instructions.*"


def mock_web_ok(vm, url, body=DOC_BODY):
    """Mock a successful page fetch."""
    vm.mock_web(url, {"status": 200, "body": body})


def mock_review(vm, response_body, url_pattern=r".*"):
    """Mock both the web fetch and the LLM review response."""
    vm.mock_web(url_pattern, {"status": 200, "body": DOC_BODY})
    vm.mock_llm(r"(?s).*Criteria:.*", response_body)
