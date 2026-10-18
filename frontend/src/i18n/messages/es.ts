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
  "landing.round_count": "— rondas de revisión: {count}",

  /* -- how it works ------------------------------------------------------- */
  "howit.title": "Cómo funciona",
  "howit.lede":
    "CivicLens contrasta pruebas públicas con criterios publicados de antemano. Esta página explica qué ocurre durante una revisión y qué significa cada resultado, y qué no.",
  "howit.flow_heading": "Qué hace una revisión",
  "howit.flow_1":
    "Se registra un compromiso con criterios enunciados de antemano, junto con el enlace donde se publicó el compromiso y el período que abarca.",
  "howit.flow_2":
    "Cualquiera puede añadir pruebas públicas, a favor o en contra. Ambas se aceptan. Lo que alguien escriba junto a un enlace queda en el registro, pero la revisión nunca lo lee.",
  "howit.flow_3":
    "El registrante solicita una revisión. Se obtienen y leen las fuentes frente a cada criterio.",
  "howit.flow_4":
    "Los validadores trabajan de forma independiente y deben llegar al mismo significado, no a los mismos bytes. Cada criterio recibe un resultado, el motivo y las fuentes en las que se basó.",
  "howit.flow_5":
    "El resultado global lo deriva el código ordinario a partir de los resultados por criterio. El modelo nunca lo decide.",
  "howit.flow_6":
    "El resultado se registra como una ronda. Puede impugnarse, lo que abre una ronda nueva con pruebas nuevas. Las rondas anteriores permanecen en el registro.",
  "howit.equiv_heading": 'Qué significa aquí el "acuerdo"',
  "howit.equiv_body":
    "Las páginas públicas cambian, y un modelo rara vez formula dos lecturas de la misma manera. Así que los validadores no tienen que producir el mismo texto. Deben ponerse de acuerdo en:",
  "howit.equiv_result": "el resultado de cada criterio: coincidencia exacta, sin tolerancia;",
  "howit.equiv_reason": "el código de motivo: exacto, o dentro de un grupo equivalente documentado;",
  "howit.equiv_figure":
    "para un criterio numérico, la cifra extraída dentro de una tolerancia y en el mismo lado del umbral.",
  "howit.equiv_safeguards":
    "Dos salvaguardas impiden que los validadores se pongan de acuerdo en algo equivocado. Un veredicto categórico debe citar fuentes que estén realmente en el conjunto enviado, y un veredicto numérico debe coincidir con su propia cifra extraída. Un veredicto que incumpla cualquiera de las dos comprobaciones se rechaza en lugar de almacenarse.",
  "howit.equiv_link": "Leer el principio de equivalencia en la documentación de GenLayer",
  "howit.outcome_heading": "Cómo se deriva el resultado global",
  "howit.outcome_caption": "Las condiciones en las que se deriva cada resultado global.",
  "howit.outcome_col_if": "Si, entre los criterios obligatorios…",
  "howit.outcome_col_then": "El resultado global es",
  "howit.outcome_all_supported": "todos están respaldados",
  "howit.outcome_one_contradicted": "al menos uno está contradicho",
  "howit.outcome_none_contradicted":
    "ninguno está contradicho pero al menos uno es inconclusivo",
  "howit.no_score_body":
    "Los criterios opcionales se registran y se muestran, pero nunca deciden el resultado global. No hay puntuación, ni calificación, ni clasificación: el resultado es una afirmación sobre las pruebas reunidas, no un número para comparar sujetos.",
  "howit.inconclusive_heading": 'Por qué existe "inconclusivo"',
  "howit.inconclusive_body":
    "Muchos compromisos públicos simplemente no tienen pruebas publicadas suficientes para decidir nada. Sin un tercer resultado, esa situación tendría que meterse en «respaldado» o «contradicho», y ambas serían falsas.",
  "howit.does_not_mean": "Inconclusivo no significa:",
  "howit.does_not_mean_1": "que la organización no hizo lo que dijo;",
  "howit.does_not_mean_2": "que el compromiso se rompió o no se cumplió;",
  "howit.does_not_mean_3": "que alguien actuó de mala fe;",
  "howit.does_not_mean_4": "que las pruebas se ponderaron y resultaron insuficientes.",
  "howit.it_means": "Significa:",
  "howit.it_means_body":
    "que la revisión no pudo determinar si las pruebas respaldan el criterio tal como está escrito. Es una afirmación sobre las pruebas, y se muestra en un color neutro, nunca en un color de advertencia ni como una puntuación.",
  "howit.causes":
    "Causas habituales: no se envió nada relevante; dos fuentes autorizadas discrepan; no se pudo alcanzar una fuente; la redacción del criterio era demasiado vaga para casar con nada; o se publicó una cifra en una unidad distinta de la que usa el criterio.",
  "howit.resolution":
    "Cada resultado inconclusivo dice qué falta y qué lo resolvería: por ejemplo un informe publicado, una versión del criterio más clara, o una fuente que concilie el desacuerdo.",
  "howit.absence":
    "La ausencia de pruebas es SIEMPRE inconclusiva. Nunca se trata como contradicción.",
  "howit.finality_heading": "Aceptado no es definitivo",
  "howit.finality_body_1":
    "El consenso de GenLayer pasa por etapas. Una vez que los validadores coinciden, el resultado queda aceptado, lo que significa que aún puede impugnarse. Solo cuando se cierra la ventana de impugnación pasa a ser definitivo.",
  "howit.finality_body_2":
    "CivicLens muestra estos dos estados por separado y nunca los colapsa. Un resultado aceptado se etiqueta «Aceptado: todavía se puede impugnar», y nada en la interfaz sugiere permanencia antes de alcanzar la definitividad.",
  "howit.finality_body_3":
    "Aparte de los recursos del protocolo, cualquier impugnación de CivicLens abre una ronda de revisión nueva con pruebas nuevas adjuntas. Son dos cosas distintas: un recurso del protocolo discute la decisión del comité sobre las mismas entradas, mientras que una impugnación aporta entradas nuevas. Ninguna reemplaza a la otra.",
  "howit.term_supported_body":
    "Las pruebas publicadas respaldan el criterio tal como está escrito. No es un juicio sobre las intenciones.",
  "howit.term_contradicted_body":
    "Las pruebas publicadas entran en conflicto con el criterio tal como está escrito.",
  "howit.term_inconclusive_body":
    "Las pruebas no permitieron una determinación en ningún sentido.",
  "howit.terms_heading": "Palabras usadas en este sitio",
  "howit.term_validator": "Validador",
  "howit.term_validator_body":
    "Un nodo independiente que evalúa las pruebas y debe ponerse de acuerdo con los demás sobre el significado.",
  "howit.term_leader": "Líder",
  "howit.term_leader_body":
    "El validador que produce la primera lectura que los demás comprueban.",
  "howit.term_finality": "Definitividad",
  "howit.term_finality_body":
    "El punto después del cual un resultado ya no puede impugnarse.",
  "howit.next_prefix": "Siguiente:",
  "howit.next_link": "salvaguardas y limitaciones",

  /* -- fairness and limitations ------------------------------------------- */
  "fair.title": "Salvaguardas y limitaciones",
  "fair.lede":
    "CivicLens informa lo que las pruebas publicadas respaldan sobre un compromiso público. Esta página dice qué significa eso, qué no significa y dónde es débil el sistema.",
  "fair.evidence_heading": "Pruebas, no intenciones",
  "fair.evidence_1":
    "CivicLens nunca afirma motivos, mala fe ni que alguien incumpliera una promesa. Compara fuentes publicadas con criterios enunciados de antemano.",
  "fair.evidence_2":
    "Un criterio contradicho significa que las pruebas entran en conflicto con lo comprometido. No significa que nadie haya mentido, y la interfaz nunca usa palabras que lo insinúen.",
  "fair.inconclusive_heading": "Inconclusivo no es fracaso",
  "fair.no_score_body":
    "La ausencia de pruebas es inconclusiva, nunca contradictoria. Lo inconclusivo se muestra en un color neutro, nunca con estilo de error, nunca se suma a una puntuación negativa y nunca se usa para clasificar ni señalar a un sujeto.",
  "fair.inconclusive_link": "Por qué existe el tercer resultado",
  "fair.authentic_heading": "Lo que el consenso no puede probar",
  "fair.authentic_1":
    "El acuerdo no es autenticidad. Que los validadores coincidan en que un documento dice algo no demuestra que el documento sea auténtico, inalterado ni escrito por quien dice haberlo escrito. CivicLens no puede detectar una fuente fabricada que resulte verosímil.",
  "fair.authentic_2":
    "Las mitigaciones son preferencias, no garantías: los informes oficiales, las declaraciones auditadas y los conjuntos de datos gubernamentales pesan más que las declaraciones autopublicadas, y se usan copias archivadas cuando existen. Pero ninguna fuente se trata como autenticada probada.",
  "fair.authentic_3":
    "Por la misma razón, la revisión no puede probar una negación. Si un sujeto no publicó ningún informe, CivicLens no puede distinguir entre «no hizo nada» y «lo hizo pero no lo publicó»: eso es inconclusivo y lo sigue siendo.",
  "fair.attribution_heading": "Honestidad en la atribución",
  "fair.attribution_1":
    "Cada página de compromiso indica quién registró la entrada y con qué rol, y dice que el sujeto no la ha verificado ni respaldado necesariamente. CivicLens no verifica que quien registra hable realmente por la organización que nombra: nadie puede hacerlo solo con una dirección.",
  "fair.attribution_2":
    "Un rol de registrante «para su propia organización» es una autodeclaración, no una identidad verificada.",
  "fair.response_heading": "Derecho a respuesta",
  "fair.response_1":
    "Cualquiera, incluida la organización sujeto, puede enviar pruebas y abrir una impugnación. Una impugnación añade pruebas nuevas y activa una ronda de revisión nueva. Las respuestas del sujeto se muestran en la página del compromiso, y el historial completo de rondas e impugnaciones sigue siendo público.",
  "fair.response_2":
    "Los límites existen para evitar abusos, no para excluir a nadie: un número pequeño de envíos por parte y de rondas. El contrato los aplica y la interfaz los muestra antes de que alguien actúe.",
  "fair.privacy_heading": "Privacidad",
  "fair.privacy_1":
    "CivicLens es para compromisos públicos de organizaciones e instituciones públicas. El contrato rechaza las entradas que nombran a una persona privada como sujeto, y no se construye ninguna función para perfilar a personas.",
  "fair.privacy_2":
    "Lo que se guarda en la cadena: el texto del compromiso, los criterios, los enlaces de las fuentes y las direcciones de quienes envían, necesarias para aplicar límites y registrar quién hizo qué. Ningún dato personal más allá de direcciones y referencias públicas. Las notas adjuntas a las pruebas son públicas, así que no deberían contener nada privado.",
  "fair.gaming_heading": "Resistencia a la manipulación, y sus límites",
  "fair.gaming_does": "Lo que el diseño sí hace:",
  "fair.gaming_does_1": "acepta pruebas a favor y en contra por igual;",
  "fair.gaming_does_2": "juzga las pruebas por su contenido, nunca por quién las envió;",
  "fair.gaming_does_3": "ignora por completo las notas de quien envía: el código de revisión nunca las lee;",
  "fair.gaming_does_4":
    "limita los envíos por parte y por compromiso, y rechaza duplicados;",
  "fair.gaming_does_5":
    "bloquea los criterios cuando empieza la revisión, para que un criterio no pueda suavizarse en silencio;",
  "fair.gaming_does_6":
    "trata las pruebas como datos, de modo que las instrucciones incrustadas en un documento se ignoran;",
  "fair.gaming_does_7":
    "rechaza un veredicto que cite fuentes ajenas al conjunto enviado.",
  "fair.gaming_cannot": "Lo que no puede hacer:",
  "fair.gaming_cannot_1":
    "impedir que un grupo coordinado envíe muchas fuentes. Los límites acotan el volumen por parte, no el volumen total entre muchas partes.",
  "fair.gaming_cannot_2":
    "impedir el envío selectivo: a nadie se puede obligar a añadir la fuente que habría cambiado el resultado.",
  "fair.gaming_cannot_3":
    "evitar que un sujeto con recursos publique un documento diseñado para leerse favorablemente, o para leerse difícil.",
  "fair.gaming_cannot_4":
    "garantizar que un modelo de lectura interprete un criterio complejo como lo haría una persona cuidadosa, en todos los casos.",
  "fair.gaming_footer":
    "Son limitaciones reales. Lea las pruebas y los motivos por criterio, no la única etiqueta general.",
  "fair.finality_heading": "Honestidad sobre la definitividad",
  "fair.finality_body":
    "Un resultado aceptado no se presenta como permanente. Aceptado y definitivo son estados distintos y visiblemente distintos, y el recurso y la impugnación siguen abiertos mientras lo estén.",
  "fair.data_heading": "Datos de muestra",
  "fair.data_1":
    "Los escenarios de muestra están etiquetados en cada superficie donde aparecen. Reproducen resultados registrados sobre organizaciones ficticias y nunca se presentan como hallazgos sobre entidades reales.",
  "fair.data_link": "Mira los escenarios de muestra",
  "fair.back_prefix": "Volver a",
  "fair.back_link": "el inicio",

  /* -- browse (/commitments) ---------------------------------------------- */
  "browse.title": "Compromisos",
  "browse.lede":
    "Compromisos públicos registrados en CivicLens. Cada uno muestra sus criterios, las fuentes en el archivo y el resultado de cada ronda de revisión.",
  "browse.filter_search": "Buscar",
  "browse.filter_search_placeholder": "Sujeto o número",
  "browse.filter_mode": "Datos",
  "browse.filter_mode_all": "Muestra y en vivo",
  "browse.filter_outcome": "Resultado",
  "browse.filter_outcome_all": "Cualquier resultado",
  "browse.filter_outcome_none": "Aún sin revisar",
  "browse.filter_status": "Estado",
  "browse.filter_status_all": "Cualquier estado",
  "browse.filter_role": "Registrante",
  "browse.filter_role_all": "Cualquier rol",
  "browse.filter_sort": "Orden",
  "browse.sort_newest": "Más recientes primero",
  "browse.sort_ending_soonest": "Finalizan antes",
  "browse.sort_most_reviewed": "Más revisados",
  "browse.sort_most_sources": "Más fuentes",
  "browse.refreshing": "Actualizando…",
  "browse.scope_note":
    "La búsqueda, los filtros y el orden se aplican a los compromisos registrados más recientemente ({count} mostrados), la página más grande que el contrato sirve en una lectura.",
  "browse.empty_title": "Nada coincide con esos filtros",
  "browse.empty_body_prefix": "Amplía los filtros, o",
  "browse.empty_link": "registra un compromiso",
  "browse.empty_body_suffix": "para añadir uno.",
  "browse.table_caption":
    "Compromisos con su estado, modo de datos, período de evaluación y número de rondas.",
  "browse.col_subject": "Sujeto",
  "browse.col_data": "Datos",
  "browse.col_status": "Estado",
  "browse.col_period": "Período",
  "browse.col_rounds": "Rondas",
  "browse.col_sources": "Fuentes",
  "browse.tag_superseded": "Reemplazado por el n.º {id}",
  "browse.demo_link": "Mira qué prueba cada uno de estos resultados de muestra",
  "browse.error_title": "No se pudieron cargar los compromisos.",
  "browse.loading": "Cargando compromisos",

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
