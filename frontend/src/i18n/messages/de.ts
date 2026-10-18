/**
 * German catalog.
 *
 * DRAFT TRANSLATION: written without a native-speaker reviewer (see README).
 *
 * Vocabulary is fixed on purpose so the same words are used everywhere:
 *   evidence -> "Belege"         commitment -> "Zusage"
 *   review   -> "Prüfung"        outcome     -> "Ergebnis"
 *   inconclusive -> "inkonklus"   (never a failure word)
 */

import type { MessageKey } from "./en";

export const de: Partial<Record<MessageKey, string>> = {
  /* -- navigation --------------------------------------------------------- */
  "nav.commitments": "Zusagen",
  "nav.activity": "Aktivität",
  "nav.demo": "Demo",
  "nav.how_it_works": "So funktioniert es",
  "nav.fairness": "Fairness",
  "nav.stats": "Plattform-Statistik",
  "nav.status": "Systemstatus",
  "nav.main": "Hauptnavigation",
  "nav.skip_to_content": "Zum Inhalt springen",

  /* -- appearance + language ---------------------------------------------- */
  "theme.label": "Design",
  "theme.system": "System",
  "theme.light": "Hell",
  "theme.dark": "Dunkel",
  "language.label": "Sprache",
  "language.switch": "Sprache wechseln",
  "language.current": "Sprache: {language}",
  "language.same_as_browser": "Browsersprache",
  "language.draft_note":
    "Die Übersetzungen sind Entwürfe ohne Korrektur durch Muttersprachler. Bitte weisen Sie Formulierungen hin, die Sie ändern würden.",

  /* -- landing ------------------------------------------------------------ */
  "landing.title": "Was die veröffentlichten Belege stützen",
  "landing.lede":
    "CivicLens prüft, ob veröffentlichte Belege das stützen, was eine Organisation öffentlich zugesagt hat — Kriterium für Kriterium, mit sichtbaren Quellen.",
  "landing.cta_demo": "Demo öffnen",
  "landing.cta_register": "Zusage registrieren",
  "landing.does_not_title": "Was CivicLens nicht tut",
  "landing.does_not_body":
    "CivicLens berichtet, was veröffentlichte Belege stützen. Absichten bewertet es nicht. Es behauptet nicht, dass ein Dokument authentisch ist, und es bewertet Organisationen nicht.",
  "landing.sample_build": "Diese Version nutzt Beispieldaten",
  "landing.sample_heading": "Eine Beispielzusage, vollständig gezeigt",
  "landing.sample_hint":
    "Dies ist dieselbe Komponente, die die App mit Live-Belegen verwendet — das Kriterienregister. Das Subjekt „{subject}“ ist für diese Demonstration erfunden.",
  "landing.commitment_as_stated": "Zusage in der angegebenen Form",
  "landing.outcome_replay_heading": "Ergebnis (Nachspiel eines verzeichneten Ergebnisses)",
  "landing.ledger_heading": "Kriterienregister",
  "landing.open_commitment": "Diese Zusage-Seite öffnen",
  "landing.open_commitment_tail": "mit Belegbereich, Audit-Block und Rundenhistorie.",
  "landing.why_heading": "Warum das GenLayer braucht",
  "landing.why_body_1":
    "Eine Zusage sagt in eigenen Worten eines; die Belege sind anders formuliert. Ob ein Bericht ein genanntes Kriterium stützt, ist eine Frage der Bedeutung und nicht der Übereinstimmung von Stichwörtern — und öffentliche Seiten ändern sich zwischen dem Lesen durch einen Validator und seinem Bericht.",
  "landing.why_body_2":
    "Deshalb lesen Validatoren unabhängig voneinander und müssen sich über die Bedeutung einigen, nicht über identische Bytes. Das Gesamtergebnis wird anschließend von gewöhnlichem Code aus den Ergebnissen je Kriterium abgeleitet — das Modell entscheidet es nie.",
  "landing.how_link": "Wie eine Prüfung abläuft",
  "landing.outcomes_heading": "Was eine Zusage zeigen kann",
  "landing.round_count": "— {count} Runde{plural}",

  /* -- colophon ----------------------------------------------------------- */
  "colophon.tagline":
    "CivicLens berichtet, was veröffentlichte Belege stützen. Absichten bewertet es nicht.",
  "colophon.safeguards": "Schutzmaßnahmen und Grenzen",
  "colophon.genlayer_docs": "GenLayer-Dokumentation",
  "colophon.contract": "Vertrag:",
  "colophon.not_deployed": "noch nicht bereitgestellt — diese Version nutzt Beispieldaten",

  /* -- banners and faults ------------------------------------------------- */
  "banner.sample_title": "Beispieldaten",
  "banner.sample_cta": "Sehen, was jedes Szenario prüft",
  "banner.sample_notice":
    "Nichts auf diesem Bildschirm ist eine Feststellung über eine echte Organisation. Alle hier genannten Subjekte sind für die Demonstration erfunden.",
  "banner.wrong_network_title": "Diese Wallet ist im falschen Netzwerk.",
  "banner.wrong_network_body":
    "CivicLens liest und schreibt in {network}. Lesen funktioniert immer; zum Schreiben ist der Wechsel unten nötig.",
  "banner.switch_network": "Zu {network} wechseln",
  "error.default_title": "Der Inhalt konnte nicht geladen werden.",
  "error.retry": "Erneut versuchen",
  "error.details": "Details",
  "error.no_contract_title": "Diese Version hat keinen Vertrag zum Lesen.",
  "error.no_contract_hint":
    "Kopiere frontend/.env.example nach frontend/.env und setze VITE_CONTRACT_ADDRESS. Bis dahin liefert die App die mitgelieferten Beispielszenarien, und jede Ansicht weist darauf hin.",
  "error.expected": "Dieser Antrag kann so nicht abgeschlossen werden.",
  "error.external": "Eine Quelle war nicht erreichbar. Später erneut versuchen.",
  "error.transient": "Vorübergehendes Problem. Erneut versuchen.",
  "error.llm": "Die Prüfung konnte nicht abgeschlossen werden. Erneut versuchen.",
  "error.unknown": "Der Antrag ist nicht durchgegangen. Erneut versuchen.",
  "error.no_reason": "Kein Grund festgehalten.",
  "error.unknown_reason": "Festgehaltener Grund nicht erkannt.",
  "error.unknown_overall_reason": "Ergebnis aus den Ergebnissen je Kriterium abgeleitet.",

  /* -- outcomes ----------------------------------------------------------- */
  "outcome.supported": "Belege stützen",
  "outcome.contradicted": "Belege widersprechen",
  "outcome.inconclusive": "Inkonklus",
  "result.pending": "Prüfung ausstehend",
  "overall_reason.all_required_supported":
    "Alle erforderlichen Kriterien sind durch veröffentlichte Belege gestützt.",
  "overall_reason.required_criterion_contradicted":
    "Veröffentlichte Belege widersprechen mindestens einem erforderlichen Kriterium.",

  /* -- reasons ------------------------------------------------------------ */
  "reason.supporting_evidence_found": "Veröffentlichte Belege behandeln dieses Kriterium.",
  "reason.contradicting_evidence_found": "Veröffentlichte Belege widersprechen diesem Kriterium.",
  "reason.threshold_met": "Der entnommene Wert erreicht den im Kriterium genannten Schwellwert.",
  "reason.threshold_not_met":
    "Der entnommene Wert erreicht den im Kriterium genannten Schwellwert nicht.",
  "reason.no_relevant_evidence": "Noch keine eingereichten Belege betreffen dieses Kriterium.",
  "reason.evidence_unavailable": "Eine Quelle war während der Prüfung nicht erreichbar.",
  "reason.source_conflict": "Maßgebliche Quellen widersprechen sich bei diesem Kriterium.",
  "reason.criterion_ambiguous":
    "Die Formulierung des Kriteriums lässt sich nicht mit Belegen abgleichen. Eine klarere Fassung könnte helfen.",
  "reason.unit_mismatch": "Der Wert wurde in einer anderen Einheit berichtet als im Kriterium.",
  "reason.review_incomplete": "Die Prüfung konnte zu diesem Kriterium kein Urteil bilden.",
  "reason.figure_unverified":
    "Ein Wert wurde berichtet, konnte aber keinem zitierten Abschnitt der Quelle zugeordnet werden.",
  "reason.period_mismatch":
    "Berichtszeitraum oder Umfang des Werts passen nicht eindeutig zum Kriterium.",

  /* -- what could resolve an inconclusive --------------------------------- */
  "resolution.no_relevant_evidence":
    "Was das klären könnte: eine Quelle einreichen, die das Kriterium betrifft, oder eine klarere Formulierung des Kriteriums.",
  "resolution.evidence_unavailable":
    "Was das klären könnte: die Prüfung später erneut anstoßen oder eine Kopie der Quelle als neuen Beleg einreichen.",
  "resolution.source_conflict":
    "Was das klären könnte: ein Kriterium, das benennt, welche Quelle gilt, oder Belege, die die Quellen zusammenführen.",
  "resolution.criterion_ambiguous":
    "Was das klären könnte: eine neue Fassung der Zusage mit einem präziseren Kriterium. Das Mittel ist eine klarere Zusage, keine Vermutung.",
  "resolution.unit_mismatch":
    "Was das klären könnte: Belege, die den Wert in der Einheit des Kriteriums berichten.",
  "resolution.review_incomplete":
    "Was das klären könnte: die Prüfung erneut beantragen. Über die Zusage wird in keiner Richtung etwas unterstellt.",
  "resolution.figure_unverified":
    "Was das klären könnte: eine Quelle, die den Wert in einem zitierten Abschnitt nennt.",
  "resolution.period_mismatch":
    "Was das klären könnte: Belege, deren Berichtszeitraum und Umfang zum Kriterium passen.",

  /* -- retrieval ---------------------------------------------------------- */
  "retrieval.fetched": "Gelesen",
  "retrieval.unreachable": "Nicht erreichbar",
  "retrieval.http_error": "Die Quelle meldete einen Fehler",
  "retrieval.blocked": "Blockiert: keine öffentliche Adresse",
  "retrieval.unsupported_format": "Format nicht lesbar",
  "retrieval.empty": "Die Seite enthielt keinen lesbaren Text",
  "retrieval.unknown": "Abrufstatus nicht festgehalten",

  /* -- declared source class ---------------------------------------------- */
  "source_class.primary": "Erklärte Primärquelle",
  "source_class.self_published": "Erklärt selbst veröffentlicht",
  "source_class.secondary": "Erklärter Sekundärbericht",
  "source_class.unclassified": "Nicht eingeordnete Quelle",
  "label.not_used": "Berücksichtigt, nicht verwendet",

  /* -- demo provenance ---------------------------------------------------- */
  "provenance.recorded_on_chain": "Nachspiel eines auf der Kette verzeichneten Ergebnisses",
  "provenance.authored_illustration": "Für die Demo erstellte Illustration",
  "provenance.note.recorded_on_chain":
    "Nachgespielt aus einer Runde, die im Netzwerk tatsächlich per Konsens geprüft wurde. Das zeigt, was diese Prüfung entschieden hat; es behauptet nicht, dass dieselbe Entscheidung erneut getroffen würde. Berufung und Endgültigkeit gelten weiterhin.",
  "provenance.note.authored_illustration":
    "Für die Demo erstellt. Die Organisation und ihre Unterlagen sind erfunden und wurden im Netzwerk nie geprüft. Das zeigt, wie sich der Vertrag verhalten würde, nicht etwas, das er entschieden hat.",

  /* -- status ------------------------------------------------------------- */
  "status.evidence_open": "Belegfenster geöffnet",
  "status.review_pending": "Prüfung ausstehend",
  "status.outcome_accepted": "Ergebnis angenommen",
  "status.challenged": "Angefochten",
  "status.withdrawn": "Zurückgezogen",
  "status.superseded": "Abgelöst",
  "trigger.initial": "Erstprüfung",
  "trigger.challenge": "Prüfung nach Anfechtung",

  /* -- role + data mode --------------------------------------------------- */
  "role.organization": "für die eigene Organisation",
  "role.observer": "als Beobachter",
  "role_short.organization": "Eigene Organisation",
  "role_short.observer": "Beobachter",
  "data_mode.sample": "Beispieldaten",
  "data_mode.live": "Live-Belege",
  "app_source.configured": "Live-Vertrag konfiguriert",
  "app_source.sample_only": "Beispieldaten",
  "app_source.title.configured":
    "In dieser Version ist ein bereitgestellter CivicLens-Vertrag konfiguriert. Jede Ansicht weist aus, woher die eigenen Daten stammen.",
  "app_source.title.sample_only":
    "Es ist keine Vertragsadresse konfiguriert, daher lesen alle Ansichten dieser App mitgelieferte Beispieldaten.",

  /* -- evidence types ----------------------------------------------------- */
  "evidence_type.official_report": "Offizieller Bericht",
  "evidence_type.audited_statement": "Geprüfte Erklärung",
  "evidence_type.government_dataset": "Behördendatensatz",
  "evidence_type.press_release": "Pressemitteilung",
  "evidence_type.news_article": "Zeitungsartikel",
  "evidence_type.other": "Sonstiges",

  /* -- actions ------------------------------------------------------------ */
  "action.register_commitment": "Zusage registrieren",
  "action.add_evidence": "Beleg hinzufügen",
  "action.request_review": "Prüfung beantragen",
  "action.open_challenge": "Anfechtung eröffnen",
  "action.supersede": "Neue Version erstellen",
  "action.withdraw": "Zurückziehen",

  /* -- transaction lifecycle ---------------------------------------------- */
  "tx_phase.submitted": "An das Netzwerk gesendet",
  "tx_phase.pending": "Validatoren prüfen gerade",
  "tx_phase.accepted": "Angenommen — noch anfechtbar",
  "tx_phase.final": "Endgültig",
  "tx_phase.dropped": "Nicht abgeschlossen: Die Validatoren kamen zu keiner Entscheidung.",
  "tx_phase.rejected": "Nicht abgeschlossen: Die Validatoren waren mit dem Vorschlag nicht einverstanden.",
  "tx_phase.reverted": "Nicht abgeschlossen: Der Vertrag hat die Anfrage abgelehnt.",
};
