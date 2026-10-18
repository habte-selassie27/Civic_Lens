/**
 * French catalog.
 *
 * DRAFT TRANSLATION: written without a native-speaker reviewer (see README).
 *
 * Vocabulary is fixed on purpose so the same words are used everywhere:
 *   evidence -> "preuves"       commitment -> "engagement"
 *   review   -> "révision"      outcome     -> "résultat"
 *   inconclusive -> "non concluant" (never a failure word)
 */

import type { MessageKey } from "./en";

export const fr: Partial<Record<MessageKey, string>> = {
  /* -- navigation --------------------------------------------------------- */
  "nav.commitments": "Engagements",
  "nav.activity": "Activité",
  "nav.demo": "Démo",
  "nav.how_it_works": "Comment ça marche",
  "nav.fairness": "Équité",
  "nav.stats": "Statistiques de la plateforme",
  "nav.status": "État du système",
  "nav.main": "Principal",
  "nav.skip_to_content": "Aller au contenu",

  /* -- appearance + language ---------------------------------------------- */
  "theme.label": "Thème",
  "theme.system": "Système",
  "theme.light": "Clair",
  "theme.dark": "Sombre",
  "language.label": "Langue",
  "language.switch": "Changer de langue",
  "language.current": "Langue : {language}",
  "language.same_as_browser": "Langue du navigateur",
  "language.draft_note":
    "Les traductions sont des brouillons rédigés sans relecture par un locuteur natif. Signalez les formulations que vous changeriez.",

  /* -- landing ------------------------------------------------------------ */
  "landing.title": "Ce que les preuves publiées étayent",
  "landing.lede":
    "CivicLens vérifie si les preuves publiées étayent ce qu'une organisation a publiquement annoncé, critère par critère, sources à l'appui.",
  "landing.cta_demo": "Ouvrir la démo",
  "landing.cta_register": "Enregistrer un engagement",
  "landing.does_not_title": "Ce que CivicLens ne fait pas",
  "landing.does_not_body":
    "CivicLens rapporte ce que les preuves publiées étayent. Il n'évalue pas les intentions. Il ne prétend pas qu'un document est authentique, et il ne note pas les organisations.",
  "landing.sample_build": "Cette version fonctionne avec des données d'exemple",
  "landing.sample_heading": "Un engagement d'exemple, présenté en entier",
  "landing.sample_hint":
    "Voici le même composant que l'application utilise pour les preuves en direct — le registre des critères. Le sujet, « {subject} », est fictif pour cette démonstration.",
  "landing.commitment_as_stated": "Engagement tel qu'il a été annoncé",
  "landing.outcome_replay_heading": "Résultat (rejeu d'un résultat enregistré)",
  "landing.ledger_heading": "Registre des critères",
  "landing.open_commitment": "Ouvrir la page de cet engagement",
  "landing.open_commitment_tail":
    "pour voir le panneau des preuves, le bloc d'audit et l'historique des tours.",
  "landing.why_heading": "Pourquoi cela demande GenLayer",
  "landing.why_body_1":
    "Un engagement dit une chose avec ses propres mots ; les preuves sont formulées autrement. Savoir si un rapport appuie un critère énoncé est une question de sens, pas de correspondance de mots-clés — et les pages publiques changent entre le moment où un validateur les lit et celui où il rend compte.",
  "landing.why_body_2":
    "La lecture est donc faite par des validateurs qui travaillent indépendamment et doivent s'accorder sur le sens, pas sur des octets identiques. Le résultat global est ensuite déduit par du code ordinaire à partir des résultats par critère — le modèle ne le décide jamais.",
  "landing.how_link": "Comment se déroule une révision",
  "landing.outcomes_heading": "Ce qu'un engagement peut finir par montrer",
  "landing.round_count": "— {count} tour{plural}",

  /* -- colophon ----------------------------------------------------------- */
  "colophon.tagline":
    "CivicLens rapporte ce que les preuves publiées étayent. Il n'évalue pas les intentions.",
  "colophon.safeguards": "Garanties et limites",
  "colophon.genlayer_docs": "Documentation GenLayer",
  "colophon.contract": "Contrat :",
  "colophon.not_deployed": "pas encore déployé — cette version fonctionne avec des données d'exemple",

  /* -- banners and faults ------------------------------------------------- */
  "banner.sample_title": "Données d'exemple",
  "banner.sample_cta": "Voir ce que chaque scénario teste",
  "banner.sample_notice":
    "Rien sur cet écran ne constitue un constat sur une organisation réelle. Tous les sujets présentés sont fictifs, pour la démonstration.",
  "banner.wrong_network_title": "Ce portefeuille est sur le mauvais réseau.",
  "banner.wrong_network_body":
    "CivicLens lit et écrit sur {network}. La lecture fonctionne dans tous les cas ; une écriture nécessite le changement ci-dessous.",
  "banner.switch_network": "Passer à {network}",
  "error.default_title": "Le contenu n'a pas pu être chargé.",
  "error.retry": "Réessayer",
  "error.details": "Détails",
  "error.no_contract_title": "Cette version n'a aucun contrat à lire.",
  "error.no_contract_hint":
    "Copiez frontend/.env.example vers frontend/.env et définissez VITE_CONTRACT_ADDRESS. D'ici là, l'application sert les scénarios d'exemple fournis et chaque écran l'indique.",
  "error.expected": "Cette demande ne peut pas être exécutée telle qu'elle est écrite.",
  "error.external": "Une source n'a pas pu être atteinte. Réessayez plus tard.",
  "error.transient": "Problème temporaire. Réessayez.",
  "error.llm": "La révision n'a pas pu être exécutée. Réessayez.",
  "error.unknown": "La demande n'est pas passée. Réessayez.",
  "error.no_reason": "Aucun motif enregistré.",
  "error.unknown_reason": "Motif enregistré non reconnu.",
  "error.unknown_overall_reason": "Résultat dérivé des résultats par critère.",

  /* -- outcomes ----------------------------------------------------------- */
  "outcome.supported": "Les preuves soutiennent",
  "outcome.contradicted": "Les preuves contredisent",
  "outcome.inconclusive": "Non concluant",
  "result.pending": "Révision en attente",
  "overall_reason.all_required_supported":
    "Chaque critère requis est étayé par des preuves publiées.",
  "overall_reason.required_criterion_contradicted":
    "Des preuves publiées contredisent au moins un critère requis.",

  /* -- reasons ------------------------------------------------------------ */
  "reason.supporting_evidence_found": "Des preuves publiées portent sur ce critère.",
  "reason.contradicting_evidence_found": "Des preuves publiées contredisent ce critère.",
  "reason.threshold_met": "Le chiffre extrait atteint le seuil indiqué par le critère.",
  "reason.threshold_not_met": "Le chiffre extrait n'atteint pas le seuil indiqué par le critère.",
  "reason.no_relevant_evidence": "Aucune preuve déposée ne porte encore sur ce critère.",
  "reason.evidence_unavailable": "Une source n'a pas pu être atteinte pendant la révision.",
  "reason.source_conflict": "Des sources faisant autorité se contredisent sur ce critère.",
  "reason.criterion_ambiguous":
    "La formulation du critère ne peut pas être rapprochée des preuves. Une version plus précise pourrait aider.",
  "reason.unit_mismatch":
    "Le chiffre a été rapporté dans une unité différente de celle du critère.",
  "reason.review_incomplete": "La révision n'a pas pu statuer sur ce critère.",
  "reason.figure_unverified":
    "Un chiffre a été rapporté mais n'a pas pu être relié à un passage cité de la source.",
  "reason.period_mismatch":
    "La période ou le périmètre de rapport du chiffre ne correspond pas clairement au critère.",

  /* -- what could resolve an inconclusive --------------------------------- */
  "resolution.no_relevant_evidence":
    "Ce qui pourrait lever l'ambiguïté : déposer une source qui porte sur le critère, ou une formulation de critère plus claire.",
  "resolution.evidence_unavailable":
    "Ce qui pourrait lever l'ambiguïté : relancer la révision plus tard, ou déposer une copie de la source comme nouvelle preuve.",
  "resolution.source_conflict":
    "Ce qui pourrait lever l'ambiguïté : un critère qui indique quelle source l'emporte, ou des preuves qui réconcilient les sources.",
  "resolution.criterion_ambiguous":
    "Ce qui pourrait lever l'ambiguïté : une nouvelle version de l'engagement avec un critère plus précis. Le remède est un engagement plus clair, pas une supposition.",
  "resolution.unit_mismatch":
    "Ce qui pourrait lever l'ambiguïté : des preuves rapportant le chiffre dans l'unité du critère.",
  "resolution.review_incomplete":
    "Ce qui pourrait lever l'ambiguïté : demander à nouveau la révision. Rien n'est sous-entendu sur l'engagement dans un sens ou l'autre.",
  "resolution.figure_unverified":
    "Ce qui pourrait lever l'ambiguïté : une source qui énonce le chiffre dans un passage cité.",
  "resolution.period_mismatch":
    "Ce qui pourrait lever l'ambiguïté : des preuves dont la période de rapport et le périmètre correspondent au critère.",

  /* -- retrieval ---------------------------------------------------------- */
  "retrieval.fetched": "Lu",
  "retrieval.unreachable": "Injoignable",
  "retrieval.http_error": "La source a renvoyé une erreur",
  "retrieval.blocked": "Bloqué : ce n'est pas une adresse publique",
  "retrieval.unsupported_format": "Le format n'a pas pu être lu",
  "retrieval.empty": "La page ne contenait pas de texte lisible",
  "retrieval.unknown": "Statut de lecture non enregistré",

  /* -- declared source class ---------------------------------------------- */
  "source_class.primary": "Source primaire déclarée",
  "source_class.self_published": "Auto-publiée déclarée",
  "source_class.secondary": "Rapport secondaire déclaré",
  "source_class.unclassified": "Source non classée",
  "label.not_used": "Considérée, non utilisée",

  /* -- demo provenance ---------------------------------------------------- */
  "provenance.recorded_on_chain": "Rejeu d'un résultat enregistré sur la chaîne",
  "provenance.authored_illustration": "Illustration créée pour la démo",
  "provenance.note.recorded_on_chain":
    "Rejoué depuis une tour réellement examinée par consensus sur le réseau. Cela montre ce que cette révision a décidé ; cela ne prétend pas que la même décision serait prise à nouveau. Les recours et la finalité s'appliquent toujours.",
  "provenance.note.authored_illustration":
    "Créé pour la démo. L'organisation et ses documents sont fictifs et n'ont jamais été examinés sur le réseau. Cela montre comment le contrat se comporterait, pas quelque chose qu'il a décidé.",

  /* -- status ------------------------------------------------------------- */
  "status.evidence_open": "Fenêtre de preuves ouverte",
  "status.review_pending": "Révision en attente",
  "status.outcome_accepted": "Résultat accepté",
  "status.challenged": "Contesté",
  "status.withdrawn": "Retiré",
  "status.superseded": "Remplacé",
  "trigger.initial": "Révision initiale",
  "trigger.challenge": "Révision après contestation",

  /* -- role + data mode --------------------------------------------------- */
  "role.organization": "pour sa propre organisation",
  "role.observer": "en tant qu'observateur",
  "role_short.organization": "Sa propre organisation",
  "role_short.observer": "Observateur",
  "data_mode.sample": "Données d'exemple",
  "data_mode.live": "Preuves en direct",
  "app_source.configured": "Contrat en direct configuré",
  "app_source.sample_only": "Données d'exemple",
  "app_source.title.configured":
    "Un contrat CivicLens déployé est configuré dans cette version. Chaque écran indique d'où viennent ses propres données.",
  "app_source.title.sample_only":
    "Aucune adresse de contrat n'est configurée : tous les écrans de cette application lisent des données d'exemple fournies.",

  /* -- evidence types ----------------------------------------------------- */
  "evidence_type.official_report": "Rapport officiel",
  "evidence_type.audited_statement": "Déclaration auditée",
  "evidence_type.government_dataset": "Jeu de données gouvernemental",
  "evidence_type.press_release": "Communiqué de presse",
  "evidence_type.news_article": "Article de presse",
  "evidence_type.other": "Autre",

  /* -- actions ------------------------------------------------------------ */
  "action.register_commitment": "Enregistrer un engagement",
  "action.add_evidence": "Ajouter une preuve",
  "action.request_review": "Demander une révision",
  "action.open_challenge": "Ouvrir une contestation",
  "action.supersede": "Créer une nouvelle version",
  "action.withdraw": "Retirer",

  /* -- transaction lifecycle ---------------------------------------------- */
  "tx_phase.submitted": "Envoyée au réseau",
  "tx_phase.pending": "Les validateurs sont en train d'examiner",
  "tx_phase.accepted": "Acceptée — encore contestable",
  "tx_phase.final": "Finale",
  "tx_phase.dropped": "Non aboutie : les validateurs n'ont pas abouti à une décision.",
  "tx_phase.rejected": "Non aboutie : les validateurs n'ont pas accepté la proposition.",
  "tx_phase.reverted": "Non aboutie : le contrat a rejeté la demande.",
};
