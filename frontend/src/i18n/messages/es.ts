/**
 * Spanish catalog.
 *
 * DRAFT TRANSLATION: written without a native-speaker reviewer. Wording is
 * reviewed by a native speaker before it is called final (see README).
 *
 * Vocabulary is fixed on purpose so the same words are used everywhere:
 *   evidence  -> "pruebas"        commitment -> "compromiso"
 *   review    -> "revisión"       outcome    -> "resultado"
 *   inconclusive -> "inconclusivo"  (never a failure word)
 */

import type { MessageKey } from "./en";

export const es: Partial<Record<MessageKey, string>> = {
  /* -- navigation --------------------------------------------------------- */
  "nav.commitments": "Compromisos",
  "nav.activity": "Actividad",
  "nav.demo": "Demo",
  "nav.how_it_works": "Cómo funciona",
  "nav.fairness": "Equidad",
  "nav.stats": "Estadísticas de la plataforma",
  "nav.status": "Estado del sistema",
  "nav.main": "Principal",
  "nav.skip_to_content": "Saltar al contenido",

  /* -- appearance + language ---------------------------------------------- */
  "theme.label": "Tema",
  "theme.system": "Sistema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "language.label": "Idioma",
  "language.switch": "Cambiar idioma",
  "language.current": "Idioma: {language}",
  "language.same_as_browser": "Idioma del navegador",
  "language.draft_note":
    "Las traducciones son borradores escritos sin revisión nativa. Señala cualquier redacción que cambiarías.",

  /* -- landing ------------------------------------------------------------ */
  "landing.title": "Lo que respaldan las pruebas publicadas",
  "landing.lede":
    "CivicLens comprueba si las pruebas publicadas respaldan lo que una organización prometió públicamente, criterio por criterio y mostrando las fuentes.",
  "landing.cta_demo": "Abrir la demo",
  "landing.cta_register": "Registrar un compromiso",
  "landing.does_not_title": "Lo que CivicLens no hace",
  "landing.does_not_body":
    "CivicLens informa lo que respaldan las pruebas publicadas. No juzga las intenciones. No afirma que un documento sea auténtico ni puntúa a las organizaciones.",
  "landing.sample_build": "Esta versión funciona con datos de muestra",
  "landing.sample_heading": "Un compromiso de muestra, mostrado completo",
  "landing.sample_hint":
    'Este es el mismo componente que usa la aplicación con pruebas en vivo: el libro de criterios. El sujeto, «{subject}», es ficticio para esta demostración.',
  "landing.commitment_as_stated": "Compromiso tal como se declaró",
  "landing.outcome_replay_heading": "Resultado (reproducción de un resultado registrado)",
  "landing.ledger_heading": "Libro de criterios",
  "landing.open_commitment": "Abre la página de este compromiso",
  "landing.open_commitment_tail":
    "para ver el panel de pruebas, el bloque de auditoría y el historial de rondas.",
  "landing.why_heading": "Por qué esto necesita GenLayer",
  "landing.why_body_1":
    "Un compromiso dice una cosa con sus propias palabras; las pruebas están formuladas de otra manera. Decidir si un informe respalda un criterio determinado es una cuestión de significado, no de coincidir palabras clave, y las páginas públicas cambian entre que un validador las lee y que informa.",
  "landing.why_body_2":
    "Por eso la lectura la hacen validadores que trabajan de forma independiente y deben ponerse de acuerdo en el significado, no en bytes idénticos. El resultado global lo deriva después el código ordinario a partir de los resultados por criterio: el modelo nunca lo decide.",
  "landing.how_link": "Cómo se ejecuta una revisión",
  "landing.outcomes_heading": "Lo que puede mostrar un compromiso",
  "landing.round_count": "— {count} ronda{plural}",

  /* -- colophon ----------------------------------------------------------- */
  "colophon.tagline":
    "CivicLens informa lo que respaldan las pruebas publicadas. No juzga las intenciones.",
  "colophon.safeguards": "Salvaguardas y limitaciones",
  "colophon.genlayer_docs": "Documentación de GenLayer",
  "colophon.contract": "Contrato:",
  "colophon.not_deployed": "aún no desplegado: esta versión funciona con datos de muestra",

  /* -- banners and faults ------------------------------------------------- */
  "banner.sample_title": "Datos de muestra",
  "banner.sample_cta": "Mira qué prueba cada escenario",
  "banner.sample_notice":
    "Nada en esta pantalla es un hallazgo sobre una organización real. Todos los sujetos aquí son ficticios para la demostración.",
  "banner.wrong_network_title": "Esta cartera está en la red equivocada.",
  "banner.wrong_network_body":
    "CivicLens lee y escribe en {network}. La lectura funciona igualmente; una escritura necesita el cambio de abajo.",
  "banner.switch_network": "Cambiar a {network}",
  "error.default_title": "No se pudo cargar.",
  "error.retry": "Inténtalo de nuevo",
  "error.details": "Detalles",
  "error.no_contract_title": "Esta versión no tiene contrato que leer.",
  "error.no_contract_hint":
    "Copia frontend/.env.example a frontend/.env y define VITE_CONTRACT_ADDRESS. Hasta entonces la aplicación sirve los escenarios de muestra incluidos y cada pantalla lo indica.",
  "error.expected": "Esa solicitud no se puede completar tal como está escrita.",
  "error.external": "No se pudo alcanzar una fuente. Inténtalo más tarde.",
  "error.transient": "Problema temporal. Inténtalo de nuevo.",
  "error.llm": "No se pudo completar la revisión. Inténtalo de nuevo.",
  "error.unknown": "La solicitud no llegó a completarse. Inténtalo de nuevo.",
  "error.no_reason": "No se registró ningún motivo.",
  "error.unknown_reason": "Motivo registrado no reconocido.",
  "error.unknown_overall_reason": "Resultado derivado de los resultados por criterio.",

  /* -- outcomes ----------------------------------------------------------- */
  "outcome.supported": "Las pruebas respaldan",
  "outcome.contradicted": "Las pruebas contradicen",
  "outcome.inconclusive": "Inconclusivo",
  "result.pending": "Revisión pendiente",
  "overall_reason.all_required_supported":
    "Todos los criterios obligatorios están respaldados por pruebas publicadas.",
  "overall_reason.required_criterion_contradicted":
    "Las pruebas publicadas entran en conflicto con al menos un criterio obligatorio.",

  /* -- reasons ------------------------------------------------------------ */
  "reason.supporting_evidence_found": "Las pruebas publicadas tratan este criterio.",
  "reason.contradicting_evidence_found": "Las pruebas publicadas contradicen este criterio.",
  "reason.threshold_met": "La cifra extraída cumple el umbral indicado en el criterio.",
  "reason.threshold_not_met":
    "La cifra extraída no cumple el umbral indicado en el criterio.",
  "reason.no_relevant_evidence": "Todavía ninguna prueba enviada trata este criterio.",
  "reason.evidence_unavailable": "No se pudo alcanzar una fuente durante la revisión.",
  "reason.source_conflict": "Las fuentes autorizadas discrepan en este criterio.",
  "reason.criterion_ambiguous":
    "La redacción del criterio no se puede vincular a las pruebas. Una versión más clara podría ayudar.",
  "reason.unit_mismatch": "La cifra se reportó en una unidad distinta a la del criterio.",
  "reason.review_incomplete": "La revisión no pudo emitir un juicio sobre este criterio.",
  "reason.figure_unverified":
    "Se reportó una cifra, pero no se pudo vincular a un pasaje citado de la fuente.",
  "reason.period_mismatch":
    "El periodo o el alcance del informe de la cifra no coincide claramente con el criterio.",

  /* -- what could resolve an inconclusive --------------------------------- */
  "resolution.no_relevant_evidence":
    "Qué podría resolverlo: enviar una fuente que trate el criterio, o una versión del criterio más clara.",
  "resolution.evidence_unavailable":
    "Qué podría resolverlo: repetir la revisión más tarde, o enviar una copia de la fuente como prueba nueva.",
  "resolution.source_conflict":
    "Qué podría resolverlo: un criterio que indique qué fuente prevalece, o pruebas que concilien las fuentes.",
  "resolution.criterion_ambiguous":
    "Qué podría resolverlo: una nueva versión del compromiso con un criterio más preciso. La solución es un compromiso más claro, no una suposición.",
  "resolution.unit_mismatch":
    "Qué podría resolverlo: pruebas que reporten la cifra en la unidad del criterio.",
  "resolution.review_incomplete":
    "Qué podría resolverlo: solicitar la revisión de nuevo. No se implica nada sobre el compromiso en ningún sentido.",
  "resolution.figure_unverified":
    "Qué podría resolverlo: una fuente que indique la cifra en un pasaje citado.",
  "resolution.period_mismatch":
    "Qué podría resolverlo: pruebas cuyo periodo de informe y alcance coincidan con el criterio.",

  /* -- retrieval ---------------------------------------------------------- */
  "retrieval.fetched": "Leída",
  "retrieval.unreachable": "No se pudo alcanzar",
  "retrieval.http_error": "La fuente devolvió un error",
  "retrieval.blocked": "Bloqueada: no es una dirección pública",
  "retrieval.unsupported_format": "No se pudo leer el formato",
  "retrieval.empty": "La página no tenía texto legible",
  "retrieval.unknown": "No se registró el estado de lectura",

  /* -- declared source class ---------------------------------------------- */
  "source_class.primary": "Fuente principal declarada",
  "source_class.self_published": "Autopublicada declarada",
  "source_class.secondary": "Informe secundario declarado",
  "source_class.unclassified": "Fuente sin clasificar",
  "label.not_used": "Considerada, no usada",

  /* -- demo provenance ---------------------------------------------------- */
  "provenance.recorded_on_chain": "Reproducción de un resultado registrado en la cadena",
  "provenance.authored_illustration": "Ilustración creada para la demo",
  "provenance.note.recorded_on_chain":
    "Reproducido desde una ronda que consensus revisó realmente en la red. Muestra lo que decidió esa revisión; no afirma que se volvería a decidir igual. Siguen aplicando los recursos y la definitividad.",
  "provenance.note.authored_illustration":
    "Creado para la demo. La organización y sus documentos son ficticios y nunca se revisaron en la red. Esto muestra cómo se comportaría el contrato, no algo que haya decidido.",

  /* -- status ------------------------------------------------------------- */
  "status.evidence_open": "Ventana de pruebas abierta",
  "status.review_pending": "Revisión pendiente",
  "status.outcome_accepted": "Resultado aceptado",
  "status.challenged": "Impugnado",
  "status.withdrawn": "Retirado",
  "status.superseded": "Reemplazado",
  "trigger.initial": "Revisión inicial",
  "trigger.challenge": "Revisión tras una impugnación",

  /* -- role + data mode --------------------------------------------------- */
  "role.organization": "para su propia organización",
  "role.observer": "como observador",
  "role_short.organization": "Propia organización",
  "role_short.observer": "Observador",
  "data_mode.sample": "Datos de muestra",
  "data_mode.live": "Pruebas en vivo",
  "app_source.configured": "Contrato en vivo configurado",
  "app_source.sample_only": "Datos de muestra",
  "app_source.title.configured":
    "Hay un contrato CivicLens desplegado configurado en esta versión. Cada pantalla indica de dónde vienen sus propios datos.",
  "app_source.title.sample_only":
    "No hay dirección de contrato configurada, así que todas las pantallas de esta aplicación leen datos de muestra incluidos.",

  /* -- evidence types ----------------------------------------------------- */
  "evidence_type.official_report": "Informe oficial",
  "evidence_type.audited_statement": "Declaración auditada",
  "evidence_type.government_dataset": "Conjunto de datos gubernamental",
  "evidence_type.press_release": "Comunicado de prensa",
  "evidence_type.news_article": "Artículo de prensa",
  "evidence_type.other": "Otro",

  /* -- actions ------------------------------------------------------------ */
  "action.register_commitment": "Registrar compromiso",
  "action.add_evidence": "Añadir prueba",
  "action.request_review": "Solicitar revisión",
  "action.open_challenge": "Abrir impugnación",
  "action.supersede": "Crear nueva versión",
  "action.withdraw": "Retirar",

  /* -- transaction lifecycle ---------------------------------------------- */
  "tx_phase.submitted": "Enviada a la red",
  "tx_phase.pending": "Los validadores están revisando",
  "tx_phase.accepted": "Aceptada: todavía se puede impugnar",
  "tx_phase.final": "Definitiva",
  "tx_phase.dropped": "No se completó: los validadores no llegaron a una decisión.",
  "tx_phase.rejected": "No se completó: los validadores no estuvieron de acuerdo con la propuesta.",
  "tx_phase.reverted": "No se completó: el contrato rechazó la solicitud.",
};
