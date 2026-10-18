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
  "nav.more": "Mehr",

  /* -- account controls ---------------------------------------------------- */
  "wallet.address_label": "Kontoadresse",
  "wallet.connect": "Konto verbinden",
  "wallet.none": "Keine Wallet",
  "wallet.disconnect": "Trennen",

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
  "landing.round_count": "— Prüfungsrunden: {count}",

  /* -- how it works ------------------------------------------------------- */
  "howit.title": "So funktioniert es",
  "howit.lede":
    "CivicLens prüft öffentliche Belege gegen Kriterien, die zuvor veröffentlicht wurden. Diese Seite erklärt, was während einer Prüfung geschieht und was jedes Ergebnis bedeutet — und was nicht.",
  "howit.flow_heading": "Was eine Prüfung tut",
  "howit.flow_1":
    "Eine Zusage wird registriert, mit vorab festgelegten Kriterien, dem Link, wo die Zusage veröffentlicht wurde, und dem abgedeckten Zeitraum.",
  "howit.flow_2":
    "Alle können öffentliche Belege hinzufügen — stützend oder widersprechend. Beides wird akzeptiert. Was jemand neben einem Link schreibt, bleibt im Protokoll, wird von der Prüfung aber nie gelesen.",
  "howit.flow_3":
    "Die registrierende Person beantragt eine Prüfung. Die Quellen werden abgerufen und je Kriterium gelesen.",
  "howit.flow_4":
    "Validatoren arbeiten unabhängig und müssen zur selben Bedeutung gelangen, nicht zu denselben Bytes. Jedes Kriterium erhält ein Ergebnis, einen Grund und die Quellen, auf die es sich stützt.",
  "howit.flow_5":
    "Das Gesamtergebnis wird von gewöhnlichem Code aus den Ergebnissen je Kriterium abgeleitet. Das Modell entscheidet es nie.",
  "howit.flow_6":
    "Das Ergebnis wird als Runde festgehalten. Es kann angefochten werden, was eine neue Runde mit neuen Belegen eröffnet. Frühere Runden bleiben im Protokoll.",
  "howit.equiv_heading": 'Was hier „Einigung“ bedeutet',
  "howit.equiv_body":
    "Öffentliche Seiten ändern sich, und ein Modell formuliert zwei Lesarten selten gleich. Validatoren müssen daher nicht denselben Text erzeugen. Sie müssen sich einigen auf:",
  "howit.equiv_result": "das Ergebnis je Kriterium — exakt, ohne Toleranz;",
  "howit.equiv_reason": "den Grundcode — exakt oder innerhalb einer dokumentierten äquivalenten Gruppe;",
  "howit.equiv_figure":
    "bei einem numerischen Kriterium den entnommenen Wert innerhalb einer Toleranz und auf derselben Seite des Schwellwerts.",
  "howit.equiv_safeguards":
    "Zwei Schutzmechanismen verhindern, dass sich Validatoren auf etwas Falsches einigen. Ein eindeutiges Urteil muss Quellen zitieren, die tatsächlich in der eingereichten Menge stehen, und ein numerisches Urteil muss mit seinem eigenen entnommenen Wert übereinstimmen. Ein Urteil, das eine dieser Prüfungen verfehlt, wird verworfen statt gespeichert.",
  "howit.equiv_link": "Das Äquivalenzprinzip in der GenLayer-Dokumentation lesen",
  "howit.outcome_heading": "Wie das Gesamtergebnis abgeleitet wird",
  "howit.outcome_caption":
    "Die Bedingungen, unter denen jedes Gesamtergebnis abgeleitet wird.",
  "howit.outcome_col_if": "Wenn unter den erforderlichen Kriterien…",
  "howit.outcome_col_then": "ist das Gesamtergebnis",
  "howit.outcome_all_supported": "alle gestützt sind",
  "howit.outcome_one_contradicted": "mindestens eines widerlegt ist",
  "howit.outcome_none_contradicted":
    "keines widerlegt, aber mindestens eines inkonklus ist",
  "howit.no_score_body":
    "Optionale Kriterien werden festgehalten und angezeigt, entscheiden aber nie das Gesamtergebnis. Es gibt keine Punktzahl, keine Note und keine Rangfolge — das Ergebnis ist eine Aussage über die Belege in der Akte, keine Zahl zum Vergleich von Subjekten.",
  "howit.inconclusive_heading": 'Warum es „inkonklus“ gibt',
  "howit.inconclusive_body":
    "Vielen öffentlichen Zusagen fehlen schlicht genug veröffentlichte Belege, um irgendetwas zu entscheiden. Ohne ein drittes Ergebnis müsste dieser Zustand in „gestützt“ oder „widerlegt“ gepresst werden — und beides wäre falsch.",
  "howit.does_not_mean": "Inkonklus bedeutet nicht:",
  "howit.does_not_mean_1": "dass die Organisation nicht getan hat, was sie sagte;",
  "howit.does_not_mean_2": "dass die Zusage nicht eingehalten wurde;",
  "howit.does_not_mean_3": "dass jemand böswillig gehandelt hat;",
  "howit.does_not_mean_4": "dass die Belege abgewogen und zu dünn befunden wurden.",
  "howit.it_means": "Es bedeutet:",
  "howit.it_means_body":
    "dass die Prüfung nicht feststellen konnte, ob die Belege das Kriterium in seiner vorliegenden Form stützen. Das ist eine Aussage über die Belege, und sie wird in einer neutralen Farbe gezeigt — nie in einer Warnfarbe, nie als Punktzahl.",
  "howit.causes":
    "Häufige Ursachen: es wurde nichts Relevantes eingereicht; zwei maßgebliche Quellen widersprechen sich; eine Quelle war nicht erreichbar; die Formulierung des Kriteriums war zu vage, um auf etwas zu passen; oder ein Wert wurde in einer anderen Einheit veröffentlicht als im Kriterium.",
  "howit.resolution":
    "Jedes inkonkluse Ergebnis nennt, was fehlt und was es klären würde — zum Beispiel einen veröffentlichten Bericht, eine klarere Formulierung des Kriteriums oder eine Quelle, die den Widerspruch auflöst.",
  "howit.absence":
    "Fehlende Belege sind IMMER inkonklus. Sie werden nie als Widerspruch behandelt.",
  "howit.finality_heading": "Angenommen ist nicht endgültig",
  "howit.finality_body_1":
    "Der Konsens von GenLayer durchläuft Stufen. Sobald sich die Validatoren geeinigt haben, ist das Ergebnis angenommen — was bedeutet, dass es noch angefochten werden kann. Erst wenn das Berufungsfenster schließt, wird es endgültig.",
  "howit.finality_body_2":
    "CivicLens zeigt diese beiden Zustände getrennt und führt sie nie zusammen. Ein angenommenes Ergebnis ist als „Angenommen — noch anfechtbar“ gekennzeichnet, und nichts in der Oberfläche suggeriert Bestand vor Erreichen der Endgültigkeit.",
  "howit.finality_body_3":
    "Unabhängig von Protokollberufungen eröffnet jede CivicLens-Anfechtung eine neue Prüfungsrunde mit neuen Belegen. Das sind zwei verschiedene Dinge: Eine Protokollberufung bestreitet die Entscheidung des Gremiums auf denselben Grundlagen, während eine Anfechtung neue Grundlagen liefert. Keine ersetzt die andere.",
  "howit.term_supported_body":
    "Die veröffentlichten Belege stützen das Kriterium in seiner vorliegenden Form. Keine Bewertung von Absichten.",
  "howit.term_contradicted_body":
    "Die veröffentlichten Belege widersprechen dem Kriterium in seiner vorliegenden Form.",
  "howit.term_inconclusive_body":
    "Die Belege erlaubten keine Feststellung in die eine oder andere Richtung.",
  "howit.terms_heading": "Im Gebrauch befindliche Wörter",
  "howit.term_validator": "Validator",
  "howit.term_validator_body":
    "Ein unabhängiger Knoten, der die Belege bewertet und sich mit den anderen über die Bedeutung einigen muss.",
  "howit.term_leader": "Leader",
  "howit.term_leader_body":
    "Der Validator, der die erste Lesart erstellt, die die anderen prüfen.",
  "howit.term_finality": "Endgültigkeit",
  "howit.term_finality_body":
    "Der Punkt, nach dem ein Ergebnis nicht mehr angefochten werden kann.",
  "howit.next_prefix": "Weiter:",
  "howit.next_link": "Schutzmaßnahmen und Grenzen",

  /* -- fairness and limitations ------------------------------------------- */
  "fair.title": "Schutzmaßnahmen und Grenzen",
  "fair.lede":
    "CivicLens berichtet, was veröffentlichte Belege über eine öffentliche Zusage stützen. Diese Seite sagt, was das bedeutet, was es nicht bedeutet, und wo das System schwach ist.",
  "fair.evidence_heading": "Belege, nicht Absichten",
  "fair.evidence_1":
    "CivicLens behauptet niemals Motive, Böswilligkeit oder dass jemand ein Versprechen gebrochen hat. Es vergleicht veröffentlichte Quellen mit vorab festgelegten Kriterien.",
  "fair.evidence_2":
    "Ein widerlegtes Kriterium bedeutet, dass die Belege dem Zugesagten widersprechen. Es bedeutet nicht, dass jemand gelogen hat, und die Oberfläche verwendet nie Wörter, die das nahelegten.",
  "fair.inconclusive_heading": "Inkonklus ist kein Misserfolg",
  "fair.no_score_body":
    "Fehlende Belege sind inkonklus — nie widerlegend. Inkonklus wird in einer neutralen Farbe gezeigt, nie als Fehler gestaltet, nie zu einer negativen Punktzahl addiert und nie zum Rangieren oder Kennzeichnen eines Subjekts verwendet.",
  "fair.inconclusive_link": "Warum es das dritte Ergebnis gibt",
  "fair.authentic_heading": "Was der Konsens nicht beweisen kann",
  "fair.authentic_1":
    "Einigung ist keine Echtheit. Dass Validatoren sich darauf einigen, was ein Dokument sagt, belegt nicht, dass es echt, unverändert oder von der genannten Person geschrieben ist. CivicLens kann eine plausibel aussehende erfundene Quelle nicht erkennen.",
  "fair.authentic_2":
    "Gegenmaßnahmen sind Vorlieben, keine Garantien: offizielle Berichte, geprüfte Erklärungen und Behördendatensätze wiegen schwerer als selbst veröffentlichte Aussagen, und archivierte Stände werden verwendet, wo verfügbar. Aber keine Quelle gilt als nachweislich echt.",
  "fair.authentic_3":
    "Aus demselben Grund kann die Prüfung keine Negation beweisen. Hat ein Subjekt keinen Bericht veröffentlicht, kann CivicLens „nichts getan“ nicht von „getan, aber nicht veröffentlicht“ unterscheiden — das ist inkonklus und bleibt es.",
  "fair.attribution_heading": "Ehrlichkeit bei der Zuschreibung",
  "fair.attribution_1":
    "Jede Zusage-Seite nennt, wer den Eintrag registriert hat und in welcher Rolle, und sagt, dass das Subjekt ihn nicht unbedingt geprüft oder gebilligt hat. CivicLens prüft nicht, ob eine registrierende Person tatsächlich für die genannte Organisation spricht — das kann niemand allein anhand einer Adresse.",
  "fair.attribution_2":
    "Die Rolle „für die eigene Organisation“ ist eine Selbstauskunft, keine geprüfte Identität.",
  "fair.response_heading": "Recht auf Antwort",
  "fair.response_1":
    "Alle — auch die betroffene Organisation — können Belege einreichen und eine Anfechtung eröffnen. Eine Anfechtung fügt neue Belege bei und löst eine neue Prüfungsrunde aus. Antworten des Subjekts stehen auf der Zusage-Seite, und die vollständige Rundenhistorie samt Anfechtungen bleibt öffentlich.",
  "fair.response_2":
    "Grenzen dienen der Missbrauchsvermeidung, nicht dem Ausschluss: eine kleine Zahl an Einreichungen je Partei und eine kleine Zahl an Runden. Der Vertrag setzt sie durch und die Oberfläche zeigt sie, bevor jemand handelt.",
  "fair.privacy_heading": "Datenschutz",
  "fair.privacy_1":
    "CivicLens gilt für öffentliche Zusagen öffentlicher Organisationen und Institutionen. Einträge, die eine private Person als Subjekt benennen, werden vom Vertrag abgelehnt, und es wird keine Funktion zum Profilieren von Personen gebaut.",
  "fair.privacy_2":
    "Was on-chain gespeichert wird: der Text der Zusage, die Kriterien, die Quellenlinks und die Adressen der Einreichenden, die zur Durchsetzung der Grenzen und zur Protokollierung nötig sind. Keine personenbezogenen Daten über Adressen und öffentliche Verweise hinaus. Notizen an Belegen sind öffentlich und sollten daher nichts Privates enthalten.",
  "fair.gaming_heading": "Manipulationsresistenz und ihre Grenzen",
  "fair.gaming_does": "Was die Gestaltung leistet:",
  "fair.gaming_does_1": "nimmt stützende und widersprechende Belege gleichermaßen an;",
  "fair.gaming_does_2": "beurteilt Belege nach Inhalt, nie nach dem Einreicher;",
  "fair.gaming_does_3": "ignoriert Notizen der Einreichenden vollständig — der Prüfcode liest sie nie;",
  "fair.gaming_does_4":
    "begrenzt Einreichungen je Partei und je Zusage und lehnt Duplikate ab;",
  "fair.gaming_does_5":
    "sperrt Kriterien, sobald die Prüfung beginnt, damit ein Kriterium nicht stillschweigend abgeschwächt wird;",
  "fair.gaming_does_6":
    "behandelt Belege als Daten, sodass in ein Dokument eingebettete Anweisungen ignoriert werden;",
  "fair.gaming_does_7":
    "weist ein Urteil zurück, das Quellen außerhalb der eingereichten Menge zitiert.",
  "fair.gaming_cannot": "Was es nicht kann:",
  "fair.gaming_cannot_1":
    "eine koordinierte Gruppe am Einreichen vieler Quellen hindern. Grenzen begrenzen das Volumen je Partei, nicht das Gesamtvolumen über viele Parteien.",
  "fair.gaming_cannot_2":
    "selektive Einreichung verhindern — niemand kann gezwungen werden, die Quelle nachzureichen, die das Ergebnis geändert hätte.",
  "fair.gaming_cannot_3":
    "ein gut ausgestattetes Subjekt daran hindern, ein Dokument zu veröffentlichen, das sich leicht günstig lesen lässt — oder absichtlich schwer.",
  "fair.gaming_cannot_4":
    "garantieren, dass ein Lesemodell ein komplexes Kriterium in jedem Fall so auslegt, wie es ein sorgfältiger Mensch täte.",
  "fair.gaming_footer":
    "Das sind echte Grenzen. Lesen Sie die Belege und die Gründe je Kriterium, nicht das eine Gesamtetikett.",
  "fair.finality_heading": "Ehrlichkeit über Endgültigkeit",
  "fair.finality_body":
    "Ein angenommenes Ergebnis wird nicht als dauerhaft dargestellt. Angenommen und endgültig sind verschiedene, sichtbar verschiedene Zustände, und Berufung wie Anfechtung bleiben offen, solange sie es sind.",
  "fair.data_heading": "Beispieldaten",
  "fair.data_1":
    "Beispielszenarien sind in jeder Ansicht gekennzeichnet, in der sie erscheinen. Sie spielen verzeichnete Ergebnisse zu erfundenen Organisationen nach und werden nie als Feststellungen über reale Entitäten dargestellt.",
  "fair.data_link": "Die Beispielszenarien ansehen",
  "fair.back_prefix": "Zurück zu",
  "fair.back_link": "dem Anfang",

  /* -- browse (/commitments) ---------------------------------------------- */
  "browse.title": "Zusagen",
  "browse.lede":
    "Auf CivicLens registrierte öffentliche Zusagen. Jede zeigt ihre Kriterien, die vorliegenden Quellen und das Ergebnis jeder Prüfungsrunde.",
  "browse.filter_search": "Suchen",
  "browse.filter_search_placeholder": "Subjekt oder Nummer",
  "browse.filter_mode": "Daten",
  "browse.filter_mode_all": "Beispiel und live",
  "browse.filter_outcome": "Ergebnis",
  "browse.filter_outcome_all": "Jedes Ergebnis",
  "browse.filter_outcome_none": "Noch nicht geprüft",
  "browse.filter_status": "Zustand",
  "browse.filter_status_all": "Jeder Zustand",
  "browse.filter_role": "Registrierende",
  "browse.filter_role_all": "Jede Rolle",
  "browse.filter_sort": "Sortierung",
  "browse.sort_newest": "Neueste zuerst",
  "browse.sort_ending_soonest": "Endet am ehesten",
  "browse.sort_most_reviewed": "Am meisten geprüft",
  "browse.sort_most_sources": "Meiste Quellen",
  "browse.refreshing": "Wird aktualisiert…",
  "browse.scope_note":
    "Suche, Filter und Sortierung gelten für die zuletzt registrierten Zusagen ({count} angezeigt) — der größten Seite, die der Vertrag in einem Lesen liefert.",
  "browse.empty_title": "Nichts passt zu diesen Filtern",
  "browse.empty_body_prefix": "Filter erweitern oder",
  "browse.empty_link": "eine Zusage registrieren",
  "browse.empty_body_suffix": "um eine hinzuzufügen.",
  "browse.table_caption":
    "Zusagen mit Zustand, Datenmodus, Bewertungszeitraum und Rundenanzahl.",
  "browse.col_subject": "Subjekt",
  "browse.col_data": "Daten",
  "browse.col_status": "Zustand",
  "browse.col_period": "Zeitraum",
  "browse.col_rounds": "Runden",
  "browse.col_sources": "Quellen",
  "browse.tag_superseded": "Abgelöst durch Nr. {id}",
  "browse.demo_link": "Ansehen, was jedes dieser Beispielergebnisse prüft",
  "browse.error_title": "Die Zusagen konnten nicht geladen werden.",
  "browse.loading": "Zusagen werden geladen",

  /* -- system status ------------------------------------------------------ */
  "statuspage.title": "Systemstatus",
  "statuspage.lede":
    "Was dieser Browser über die Konfiguration prüfen kann: die Vertragsadresse, ein Live-Lesen, die Konstanten, mit denen sie antwortet, das Netzwerk und die Wallet. Methodennamen lassen sich aus einem Lesen nicht aufzählen — diese Prüfung läuft gegen das gespeicherte Schema (node scripts/save-schema.mjs / genlayer schema).",
  "statuspage.loading": "Konfigurationsprüfungen laufen",
  "statuspage.all_ok": "Alles, was diese Seite prüfen kann, stimmt überein.",
  "statuspage.needs_attention": "Prüfungen mit Handlungsbedarf: {count}.",
  "statuspage.caption":
    "Konfigurationsprüfungen mit ihrem Zustand und dem, was diejeweilige gefunden hat.",
  "statuspage.col_check": "Prüfung",
  "statuspage.col_state": "Zustand",
  "statuspage.col_detail": "Einzelheit",
  "statuspage.methods_heading": "Erwartete Methoden",
  "statuspage.methods_hint":
    "Aus dem gespeicherten Schema übernommen (docs/civic_lens.schema.json). Prüfen Sie mit genlayer schema <address>, ob eine Bereitstellung darauf antwortet.",
  "statuspage.methods_reads": "Lesezugriffe",
  "statuspage.methods_writes": "Schreibzugriffe",
  "statuspage.rerun": "Prüfungen wiederholen",
  "statuspage.state_configured": "Konfiguriert",
  "statuspage.state_not_configured": "Nicht konfiguriert",
  "statuspage.state_info": "Info",
  "statuspage.state_checking": "Wird geprüft",
  "statuspage.state_attention": "Handlungsbedarf",
  "statuspage.state_answers": "Antwortet",
  "statuspage.state_matches": "Stimmt überein",
  "statuspage.state_older": "Älterer Stand",
  "statuspage.state_connected": "Verbunden",
  "statuspage.check_address": "Vertragsadresse",
  "statuspage.check_read": "Vertragslesen",
  "statuspage.check_shape": "Form der Konstanten",
  "statuspage.check_bounds": "Grenzen im Client",
  "statuspage.check_network": "Netzwerk",
  "statuspage.check_wallet": "Wallet",
  "statuspage.check_source": "Datenquelle",
  "statuspage.address_view": "Im Explorer ansehen",
  "statuspage.address_missing":
    "Es ist keine Adresse gesetzt. Diese Version nutzt die mitgelieferten Beispielszenarien und weist überall darauf hin. Setzen Sie VITE_CONTRACT_ADDRESS in frontend/.env, um einen bereitgestellten Vertrag zu lesen.",
  "statuspage.read_sample":
    "In dieser Version gibt es keinen bereitgestellten Vertrag zu lesen — die Konstanten stammen aus dem mitgelieferten Stand.",
  "statuspage.read_checking": "get_constants wird gelesen…",
  "statuspage.read_answered": "Antwortete in {ms} ms.",
  "statuspage.read_error_hint_prefix":
    "Prüfen Sie Adresse, Netzwerk und Erreichbarkeit des Endpunkts.",
  "statuspage.read_error_hint_suffix": "scheitert so lange genauso, bis dies antwortet.",
  "statuspage.read_browse_link": "Übersicht",
  "statuspage.shape_sample":
    "Nur gegen den mitgelieferten Stand geprüft — nichts Bereitgestelltes zum Vergleich.",
  "statuspage.shape_missing_key": "erforderlicher Schlüssel fehlt: {key}",
  "statuspage.shape_mismatch_intro":
    "Die Adresse antwortet, ihre Konstanten passen aber nicht zu dieser App:",
  "statuspage.shape_mismatch_hint":
    "Wahrscheinlich ein älterer oder anderer Vertrag an dieser Adresse. Richten Sie VITE_CONTRACT_ADDRESS auf den aktuellen Stand.",
  "statuspage.shape_older_detail":
    "Antwortet, aber Audit-Felder fehlen, die diese App nutzen könnte: {fields}.",
  "statuspage.shape_older_tail":
    "Abrufstatus, Zitatgrenzen und die Klartext-Semantik erscheinen dann als fehlend.",
  "statuspage.shape_ok":
    "Alle Felder, die diese App auswertet, sind vorhanden — auch die Audit-Felder.",
  "statuspage.bounds_ok": "Der Stand der App stimmt mit den bereitgestellten Grenzen überein.",
  "statuspage.bounds_differ":
    "Grenzen weichen vom Stand der App ab: {count}. Die bereitgestellten Werte sind maßgeblich und die App verwendet sie:",
  "statuspage.bounds_line": "{key}: App {app}, bereitgestellt {deployed}",
  "statuspage.network_gasless": " — gebührenfrei, daher sind 0 GEN zu erwarten.",
  "statuspage.network_funded": " — Schreibzugriffe erfordern ein finanziertes Konto.",
  "statuspage.wallet_none":
    "Keine Wallet-Erweiterung gefunden. Lesen funktioniert ohne; Schreiben braucht eine Wallet.",
  "statuspage.wallet_no_account":
    "Eine Wallet ist verfügbar, aber kein Konto verbunden. Verbinden Sie sich in der Kopfzeile, um zu schreiben.",
  "statuspage.wallet_wrong_chain":
    "In einer anderen Kette verbunden. Lesen funktioniert weiterhin; Schreiben braucht {chain} (Kette {chainId}).",
  "statuspage.wallet_ok": "{address} auf {chain}.",
  "statuspage.source_sample":
    "Beispieldaten — {reason}. Nichts in dieser Version ist eine Feststellung über eine reale Organisation.",
  "statuspage.source_sample_default": "mitgelieferte Szenarien",
  "statuspage.source_live":
    "Live-Belege aus dem konfigurierten Vertrag. Jede Ansicht weist ihren eigenen Modus aus.",

  /* -- platform stats ------------------------------------------------------ */
  "stats.title": "Plattform-Statistik",
  "stats.window_leading":
    "Zählung des Fensters — die neuesten Zusagen plus deren jeweils neuestes Ergebnis.",
  "stats.progress": "{done} von {total} Ergebnissen gelesen.",
  "stats.counting": "Aktuelles Fenster wird gezählt",
  "stats.window_empty": "Das Fenster hat keine Daten geliefert.",
  "stats.window_error_title": "Das Fenster konnte nicht gezählt werden.",
  "stats.scope":
    "Zählungen über die neuesten Zusagen — der größten Seite, die der Vertrag in einem Lesen liefert. Ältere Einträge werden nicht gezählt, und es wird kein Netzwerk-Gesamtwert behauptet.",
  "stats.empty_title": "Noch nichts zu zählen",
  "stats.empty_body":
    "Das Fenster ist leer. Registrieren Sie eine Zusage, und ihre Prüfungen erscheinen hier.",
  "stats.records_heading": "Einträge",
  "stats.records_caption": "Gesamtwerte im aktuellen Fenster.",
  "stats.row_commitments": "Zusagen",
  "stats.row_evidence": "Belegpositionen in der Akte",
  "stats.row_rounds": "Verzeichnete Prüfungsrunden",
  "stats.row_data_mode": "Datenmodus",
  "stats.mode_live": "live",
  "stats.mode_sample": "Beispiel",
  "stats.states_heading": "Wo die Einträge stehen",
  "stats.states_caption": "Zusagen nach aktuellem Zustand.",
  "stats.outcomes_heading": "Prüfergebnisse",
  "stats.outcomes_caption": "Neuestes Ergebnis je Zusage im Fenster.",
  "stats.unread_outcome": "Ergebnis konnte nicht gelesen werden",
  "stats.inconclusive_note":
    "Inkonklus ist ein eigenes Ergebnis: Die Belege haben die Frage in der letzten Prüfung nicht entschieden. Es steht neben den anderen Ergebnissen und wird nie zu einem negativen addiert. „Ergebnis konnte nicht gelesen werden“ bedeutet, dass das Lesen selbst nicht geantwortet hat — diese Einträge zählen als kein Ergebnis.",
  "stats.sources_heading": "Wie Quellen gelesen wurden",
  "stats.sources_caption":
    "Abrufstatus summiert über die neueste Prüfungsrunde jedes Eintrags, der sie meldet.",
  "stats.sources_none":
    "Kein geprüfter Eintrag im Fenster hat Abrufstatus gemeldet.",
  "stats.sources_tail":
    "Eine Quelle, die nicht gelesen werden konnte, wird genau so verzeichnet: Sie zählt nicht als Belege für oder gegen ein Kriterium.",
  "stats.sources_count": "Quellen",
  "stats.count_again": "Erneut zählen",

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
