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
  "nav.more": "Plus",

  /* -- account controls ---------------------------------------------------- */
  "wallet.address_label": "adresse du compte",
  "wallet.connect": "Connecter un compte",
  "wallet.none": "Aucun portefeuille",
  "wallet.disconnect": "Déconnecter",

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
  "landing.round_count": "— tours de révision : {count}",

  /* -- how it works ------------------------------------------------------- */
  "howit.title": "Comment ça marche",
  "howit.lede":
    "CivicLens confronte les preuves publiques aux critères publiés à l'avance. Cette page explique ce qui se passe pendant une révision, et ce que chaque résultat signifie — et ne signifie pas.",
  "howit.flow_heading": "Ce qu'une révision fait",
  "howit.flow_1":
    "Un engagement est enregistré avec des critères énoncés à l'avance, ainsi que le lien où l'engagement a été publié et la période qu'il couvre.",
  "howit.flow_2":
    "N'importe qui peut ajouter des preuves publiques — à l'appui ou contradictoires. Les deux sont acceptées. Ce que quelqu'un écrit à côté d'un lien est conservé au dossier, mais la révision ne le lit jamais.",
  "howit.flow_3":
    "Le déclarant demande une révision. Les sources sont récupérées et lues au regard de chaque critère.",
  "howit.flow_4":
    "Les validateurs travaillent indépendamment et doivent aboutir au même sens, pas aux mêmes octets. Chaque critère reçoit un résultat, un motif et les sources sur lesquelles il s'est appuyé.",
  "howit.flow_5":
    "Le résultat global est déduit par du code ordinaire à partir des résultats par critère. Le modèle ne le décide jamais.",
  "howit.flow_6":
    "Le résultat est enregistré comme un tour. Il peut être contesté, ce qui ouvre un nouveau tour avec de nouvelles preuves. Les tours précédents restent au dossier.",
  "howit.equiv_heading": 'Ce que « l\'accord » signifie ici',
  "howit.equiv_body":
    "Les pages publiques changent, et un modèle formule rarement deux lectures de la même manière. Les validateurs n'ont donc pas à produire le même texte. Ils doivent s'accorder sur :",
  "howit.equiv_result": "le résultat pour chaque critère — correspondance exacte, sans tolérance ;",
  "howit.equiv_reason": "le code de motif — exact, ou dans un groupe équivalent documenté ;",
  "howit.equiv_figure":
    "pour un critère chiffré, la valeur extraite dans une tolérance et du même côté du seuil.",
  "howit.equiv_safeguards":
    "Deux garde-fous empêchent les validateurs de s'accorder sur une erreur. Un verdict catégorique doit citer des sources réellement présentes dans l'ensemble soumis, et un verdict chiffré doit être cohérent avec sa propre valeur extraite. Un verdict qui échoue à l'une de ces vérifications est rejeté plutôt qu'enregistré.",
  "howit.equiv_link": "Lire le principe d'équivalence dans la documentation GenLayer",
  "howit.outcome_heading": "Comment le résultat global est déduit",
  "howit.outcome_caption":
    "Les conditions dans lesquelles chaque résultat global est déduit.",
  "howit.outcome_col_if": "Si, parmi les critères requis…",
  "howit.outcome_col_then": "Le résultat global est",
  "howit.outcome_all_supported": "tous sont étayés",
  "howit.outcome_one_contradicted": "au moins un est contredit",
  "howit.outcome_none_contradicted":
    "aucun n'est contredit mais au moins un est non concluant",
  "howit.no_score_body":
    "Les critères facultatifs sont enregistrés et affichés, mais ils ne décident jamais du résultat global. Il n'y a ni note, ni classement, ni rang : le résultat est une affirmation sur les preuves au dossier, pas un nombre pour comparer des sujets.",
  "howit.inconclusive_heading": 'Pourquoi « non concluant » existe',
  "howit.inconclusive_body":
    "Beaucoup d'engagements publics n'ont tout simplement pas assez de preuves publiées pour décider quoi que ce soit. Sans un troisième résultat, cette situation devrait être rangée dans « étayé » ou « contredit », et les deux seraient faux.",
  "howit.does_not_mean": "Non concluant ne signifie pas :",
  "howit.does_not_mean_1": "que l'organisation n'a pas fait ce qu'elle a annoncé ;",
  "howit.does_not_mean_2": "que l'engagement a été rompu ou non tenu ;",
  "howit.does_not_mean_3": "que quelqu'un a agi de mauvaise foi ;",
  "howit.does_not_mean_4": "que les preuves ont été jugées insuffisantes.",
  "howit.it_means": "Cela signifie :",
  "howit.it_means_body":
    "que la révision n'a pas pu déterminer si les preuves étayent le critère tel qu'il est formulé. C'est une affirmation sur les preuves, affichée dans une couleur neutre — jamais une couleur d'alerte, jamais une note.",
  "howit.causes":
    "Causes fréquentes : rien de pertinent n'a été déposé ; deux sources faisant autorité se contredisent ; une source n'a pas pu être atteinte ; la formulation du critère était trop vague pour correspondre à quoi que ce soit ; ou une valeur a été publiée dans une autre unité que celle du critère.",
  "howit.resolution":
    "Chaque résultat non concluant indique ce qui manque et ce qui lèverait l'ambiguïté : par exemple un rapport publié, une formulation de critère plus claire, ou une source qui réconcilie le désaccord.",
  "howit.absence":
    "L'absence de preuve est TOUJOURS non concluante. Elle n'est jamais traitée comme une contradiction.",
  "howit.finality_heading": "Accepté n'est pas définitif",
  "howit.finality_body_1":
    "Le consensus de GenLayer passe par des étapes. Une fois l'accord des validateurs, le résultat est accepté — ce qui signifie qu'il peut encore être contesté. Ce n'est qu'après la fermeture de la fenêtre de contestation qu'il devient final.",
  "howit.finality_body_2":
    "CivicLens distingue ces deux états et ne les confond jamais. Un résultat accepté est libellé « Acceptée — encore contestable », et rien dans l'interface ne laisse entendre une permanence avant la finalité.",
  "howit.finality_body_3":
    "Indépendamment des recours du protocole, toute contestation CivicLens ouvre un nouveau tour de révision avec de nouvelles preuves jointes. Les deux sont différentes : un recours du protocole conteste la décision du comité sur les mêmes entrées, tandis qu'une contestation fournit de nouvelles entrées. L'une ne remplace pas l'autre.",
  "howit.term_supported_body":
    "Les preuves publiées étayent le critère tel qu'il est formulé. Ce n'est pas un jugement des intentions.",
  "howit.term_contradicted_body":
    "Les preuves publiées contredisent le critère tel qu'il est formulé.",
  "howit.term_inconclusive_body": "Les preuves n'ont permis aucune détermination.",
  "howit.terms_heading": "Mots employés sur ce site",
  "howit.term_validator": "Validateur",
  "howit.term_validator_body":
    "Un nœud indépendant qui évalue les preuves et doit s'accorder avec les autres sur le sens.",
  "howit.term_leader": "Leader",
  "howit.term_leader_body":
    "Le validateur qui produit la première lecture que les autres vérifient.",
  "howit.term_finality": "Finalité",
  "howit.term_finality_body":
    "Le point après lequel un résultat ne peut plus être contesté.",
  "howit.next_prefix": "Suivant :",
  "howit.next_link": "garanties et limites",

  /* -- fairness and limitations ------------------------------------------- */
  "fair.title": "Garanties et limites",
  "fair.lede":
    "CivicLens rapporte ce que les preuves publiées étayent au sujet d'un engagement public. Cette page dit ce que cela signifie, ce que cela ne signifie pas, et où le système est faible.",
  "fair.evidence_heading": "Les preuves, pas les intentions",
  "fair.evidence_1":
    "CivicLens n'affirme jamais une intention, une mauvaise foi, ni qu'une promesse n'a pas été tenue. Il compare des sources publiées à des critères énoncés à l'avance.",
  "fair.evidence_2":
    "Un critère contredit signifie que les preuves entrent en conflit avec ce qui a été annoncé. Cela ne signifie pas que quelqu'un a menti, et l'interface n'emploie jamais de mots qui le laisseraient croire.",
  "fair.inconclusive_heading": "Non concluant n'est pas un échec",
  "fair.no_score_body":
    "L'absence de preuve est non concluante — jamais contradictoire. Le non concluant est affiché dans une couleur neutre, jamais stylé comme une erreur, jamais additionné à une note négative, et jamais utilisé pour classer ou signaler un sujet.",
  "fair.inconclusive_link": "Pourquoi le troisième résultat existe",
  "fair.authentic_heading": "Ce que le consensus ne peut pas prouver",
  "fair.authentic_1":
    "L'accord n'est pas une authentification. Que des validateurs s'accordent sur ce qu'un document dit n'établit pas que le document est authentique, intact, ou écrit par qui il prétend l'être. CivicLens ne peut pas détecter une source fabriquée mais crédible.",
  "fair.authentic_2":
    "Les mesures d'atténuation sont des préférences, pas des garanties : les rapports officiels, les déclarations auditées et les jeux de données gouvernementaux pèsent davantage que les affirmations auto-publiées, et des instantanés archivés sont utilisés lorsque cela est possible. Mais aucune source n'est traitée comme prouvée authentique.",
  "fair.authentic_3":
    "Pour la même raison, la révision ne peut pas prouver une absence. Si un sujet n'a publié aucun rapport, CivicLens ne peut pas distinguer « n'a rien fait » de « l'a fait sans publier » — c'est non concluant, et cela le reste.",
  "fair.attribution_heading": "Honnêteté sur l'attribution",
  "fair.attribution_1":
    "Chaque page d'engagement indique qui a enregistré l'entrée et à quel titre, et précise que le sujet ne l'a pas nécessairement vérifiée ni approuvée. CivicLens ne vérifie pas que la personne qui enregistre parle réellement pour l'organisation qu'elle nomme — personne ne peut le faire à partir d'une seule adresse.",
  "fair.attribution_2":
    "Un rôle de déclarant « pour sa propre organisation » est une autodéclaration, pas une identité vérifiée.",
  "fair.response_heading": "Droit de réponse",
  "fair.response_1":
    "Toute personne — y compris l'organisation concernée — peut déposer des preuves et ouvrir une contestation. Une contestation ajoute des preuves et déclenche un nouveau tour de révision. Les réponses du sujet sont affichées sur la page de l'engagement, et l'historique complet des tours et contestations reste public.",
  "fair.response_2":
    "Les limites existent pour empêcher les abus, pas pour écarter qui que ce soit : un petit nombre de dépôts par partie et un petit nombre de tours. Le contrat les applique et l'interface les affiche avant toute action.",
  "fair.privacy_heading": "Confidentialité",
  "fair.privacy_1":
    "CivicLens vise les engagements publics d'organisations et d'institutions publiques. Le contrat rejette les entrées nommant une personne privée comme sujet, et aucune fonction de profilage des personnes n'est construite.",
  "fair.privacy_2":
    "Ce qui est stocké sur la chaîne : le texte de l'engagement, les critères, les liens des sources et les adresses des personnes qui déposent, nécessaires pour appliquer les limites et consigner qui a fait quoi. Aucune donnée personnelle au-delà des adresses et références publiques. Les notes jointes aux preuves sont publiques : elles ne devraient donc rien contenir de privé.",
  "fair.gaming_heading": "Résistance à la manipulation, et ses limites",
  "fair.gaming_does": "Ce que la conception fait :",
  "fair.gaming_does_1": "accepte indifféremment preuves à l'appui et contradictoires ;",
  "fair.gaming_does_2": "juge les preuves sur leur contenu, jamais sur qui les a déposées ;",
  "fair.gaming_does_3":
    "ignore entièrement les notes des personnes qui déposent — le code de révision ne les lit jamais ;",
  "fair.gaming_does_4":
    "borne les dépôts par partie et par engagement, et rejette les doublons ;",
  "fair.gaming_does_5":
    "verrouille les critères dès le début de la révision, pour qu'un critère ne puisse être adouci en silence ;",
  "fair.gaming_does_6":
    "traite les preuves comme des données : les instructions cachées dans un document sont donc ignorées ;",
  "fair.gaming_does_7": "rejette un verdict citant des sources hors de l'ensemble soumis.",
  "fair.gaming_cannot": "Ce qu'elle ne peut pas faire :",
  "fair.gaming_cannot_1":
    "empêcher un groupe coordonné de déposer beaucoup de sources. Les bornes limitent le volume par partie, pas le volume total entre plusieurs parties.",
  "fair.gaming_cannot_2":
    "empêcher un dépôt sélectif — personne ne peut être obligé d'ajouter la source qui aurait changé le résultat.",
  "fair.gaming_cannot_3":
    "empêcher un sujet bien doté de publier un document conçu pour être lu favorablement, ou pour être lu difficilement.",
  "fair.gaming_cannot_4":
    "garantir qu'un modèle de lecture interprète un critère complexe comme le ferait un humain careful, dans tous les cas.",
  "fair.gaming_footer":
    "Ce sont de vraies limites. Lisez les preuves et les motifs par critère, pas la seule étiquette globale.",
  "fair.finality_heading": "Honnêteté sur la finalité",
  "fair.finality_body":
    "Un résultat accepté n'est pas présenté comme permanent. Accepté et final sont des états distincts, visiblement distincts, et le recours comme la contestation restent ouverts tant qu'ils le sont.",
  "fair.data_heading": "Données d'exemple",
  "fair.data_1":
    "Les scénarios d'exemple sont étiquetés sur chaque surface où ils apparaissent. Ils rejouent des résultats enregistrés sur des organisations fictives et ne sont jamais présentés comme des constats sur des entités réelles.",
  "fair.data_link": "Voir les scénarios d'exemple",
  "fair.back_prefix": "Retour à",
  "fair.back_link": "l'accueil",

  /* -- browse (/commitments) ---------------------------------------------- */
  "browse.title": "Engagements",
  "browse.lede":
    "Les engagements publics enregistrés sur CivicLens. Chacun montre ses critères, les sources au dossier et le résultat de chaque tour de révision.",
  "browse.filter_search": "Rechercher",
  "browse.filter_search_placeholder": "Sujet ou numéro",
  "browse.filter_mode": "Données",
  "browse.filter_mode_all": "Exemple et en direct",
  "browse.filter_outcome": "Résultat",
  "browse.filter_outcome_all": "Tous les résultats",
  "browse.filter_outcome_none": "Pas encore révisé",
  "browse.filter_status": "État",
  "browse.filter_status_all": "Tous les états",
  "browse.filter_role": "Déclarant",
  "browse.filter_role_all": "Tous les rôles",
  "browse.filter_sort": "Tri",
  "browse.sort_newest": "Plus récents d'abord",
  "browse.sort_ending_soonest": "Les plus proches de la fin",
  "browse.sort_most_reviewed": "Les plus révisés",
  "browse.sort_most_sources": "Les plus de sources",
  "browse.refreshing": "Actualisation…",
  "browse.scope_note":
    "La recherche, les filtres et le tri s'appliquent aux engagements enregistrés le plus récemment ({count} affichés) — la plus grande page que le contrat sert en une lecture.",
  "browse.empty_title": "Rien ne correspond à ces filtres",
  "browse.empty_body_prefix": "Élargissez les filtres, ou",
  "browse.empty_link": "enregistrez un engagement",
  "browse.empty_body_suffix": "pour en ajouter un.",
  "browse.table_caption":
    "Engagements avec leur état, leur mode de données, leur période d'évaluation et leur nombre de tours.",
  "browse.col_subject": "Sujet",
  "browse.col_data": "Données",
  "browse.col_status": "État",
  "browse.col_period": "Période",
  "browse.col_rounds": "Tours",
  "browse.col_sources": "Sources",
  "browse.tag_superseded": "Remplacé par le n° {id}",
  "browse.demo_link": "Voir ce que teste chacun de ces résultats d'exemple",
  "browse.error_title": "Les engagements n'ont pas pu être chargés.",
  "browse.loading": "Chargement des engagements",

  /* -- system status ------------------------------------------------------ */
  "statuspage.title": "État du système",
  "statuspage.lede":
    "Ce que ce navigateur peut vérifier de la configuration : l'adresse du contrat, une lecture en direct, les constantes auxquelles il répond, le réseau et le portefeuille. Les noms de méthodes ne peuvent pas être énumérés depuis une lecture — cette vérification se fait contre le schéma enregistré (node scripts/save-schema.mjs / genlayer schema).",
  "statuspage.loading": "Exécution des vérifications de configuration",
  "statuspage.all_ok": "Tout ce que cette page peut vérifier concorde.",
  "statuspage.needs_attention": "Vérifications demandent votre attention : {count}.",
  "statuspage.caption":
    "Vérifications de configuration avec leur état et ce que chacune a trouvé.",
  "statuspage.col_check": "Vérification",
  "statuspage.col_state": "État",
  "statuspage.col_detail": "Détail",
  "statuspage.methods_heading": "Méthodes attendues",
  "statuspage.methods_hint":
    "Transcrites du schéma enregistré (docs/civic_lens.schema.json). Vérifiez qu'un déploiement y répond avec genlayer schema <address>.",
  "statuspage.methods_reads": "Lectures",
  "statuspage.methods_writes": "Écritures",
  "statuspage.rerun": "Relancer les vérifications",
  "statuspage.state_configured": "Configurée",
  "statuspage.state_not_configured": "Non configurée",
  "statuspage.state_info": "Info",
  "statuspage.state_checking": "Vérification",
  "statuspage.state_attention": "Requiert votre attention",
  "statuspage.state_answers": "Répond",
  "statuspage.state_matches": "Concordance",
  "statuspage.state_older": "Version antérieure",
  "statuspage.state_connected": "Connecté",
  "statuspage.check_address": "Adresse du contrat",
  "statuspage.check_read": "Lecture du contrat",
  "statuspage.check_shape": "Forme des constantes",
  "statuspage.check_bounds": "Bornes du client",
  "statuspage.check_network": "Réseau",
  "statuspage.check_wallet": "Portefeuille",
  "statuspage.check_source": "Source des données",
  "statuspage.address_view": "Voir sur l'explorateur",
  "statuspage.address_missing":
    "Aucune adresse n'est définie. Cette version fonctionne avec les scénarios d'exemple fournis et l'indique partout. Définissez VITE_CONTRACT_ADDRESS dans frontend/.env pour lire un contrat déployé.",
  "statuspage.read_sample":
    "Aucun contrat déployé à lire dans cette version — les constantes viennent de l'instantané fourni.",
  "statuspage.read_checking": "Lecture de get_constants…",
  "statuspage.read_answered": "A répondu en {ms} ms.",
  "statuspage.read_error_hint_prefix":
    "Vérifiez l'adresse, le réseau et que le point d'accès est joignable.",
  "statuspage.read_error_hint_suffix": "échouera de la même façon tant que ceci ne répond pas.",
  "statuspage.read_browse_link": "Parcourir",
  "statuspage.shape_sample":
    "Vérifié uniquement par rapport à l'instantané fourni — rien de déployé à comparer.",
  "statuspage.shape_missing_key": "clé requise manquante : {key}",
  "statuspage.shape_mismatch_intro":
    "L'adresse répond, mais ses constantes ne correspondent pas à cette application :",
  "statuspage.shape_mismatch_hint":
    "Probablement un contrat plus ancien ou différent à cette adresse. Pointez VITE_CONTRACT_ADDRESS sur la version actuelle.",
  "statuspage.shape_older_detail":
    "Répond, mais il manque des champs d'audit que cette application peut exploiter : {fields}.",
  "statuspage.shape_older_tail":
    "Les statuts de lecture, les limites de citation et la sémantique en langage clair apparaîtront comme absents.",
  "statuspage.shape_ok":
    "Tous les champs que cette application consomme sont présents, y compris ceux d'audit.",
  "statuspage.bounds_ok": "L'instantané de l'application correspond aux bornes déployées.",
  "statuspage.bounds_differ":
    "Bornes diffèrent de l'instantané de l'application : {count}. Les valeurs déployées font foi et l'application les utilise :",
  "statuspage.bounds_line": "{key} : application {app}, déployé {deployed}",
  "statuspage.network_gasless": " — sans frais, 0 GEN est donc attendu.",
  "statuspage.network_funded": " — les écritures exigent un compte approvisionné.",
  "statuspage.wallet_none":
    "Aucune extension de portefeuille détectée. La lecture fonctionne sans elle ; les écritures exigent un portefeuille.",
  "statuspage.wallet_no_account":
    "Un portefeuille est disponible mais aucun compte n'est connecté. Connectez-vous depuis l'en-tête pour écrire.",
  "statuspage.wallet_wrong_chain":
    "Connecté sur une autre chaîne. La lecture fonctionne toujours ; les écritures exigent {chain} (chaîne {chainId}).",
  "statuspage.wallet_ok": "{address} sur {chain}.",
  "statuspage.source_sample":
    "Données d'exemple — {reason}. Rien dans cette version n'est un constat sur une organisation réelle.",
  "statuspage.source_sample_default": "scénarios fournis",
  "statuspage.source_live":
    "Preuves en direct du contrat configuré. Chaque page indique son propre mode.",

  /* -- platform stats ------------------------------------------------------ */
  "stats.title": "Statistiques de la plateforme",
  "stats.window_leading":
    "Comptage de la fenêtre — les engagements les plus récents ainsi que leur dernier résultat.",
  "stats.progress": "{done} résultats lus sur {total}.",
  "stats.counting": "Comptage de la fenêtre actuelle",
  "stats.window_empty": "La fenêtre n'a produit aucune donnée.",
  "stats.window_error_title": "La fenêtre n'a pas pu être comptée.",
  "stats.scope":
    "Comptages sur les engagements les plus récents — la plus grande page que le contrat sert en une lecture. Les entrées antérieures à la fenêtre ne sont pas comptées, et aucun total réseau n'est affirmé.",
  "stats.empty_title": "Rien à compter pour l'instant",
  "stats.empty_body":
    "La fenêtre est vide. Enregistrez un engagement et ses révisions apparaîtront ici.",
  "stats.records_heading": "Entrées",
  "stats.records_caption": "Totaux sur la fenêtre actuelle.",
  "stats.row_commitments": "Engagements",
  "stats.row_evidence": "Éléments de preuve au dossier",
  "stats.row_rounds": "Tours de révision enregistrés",
  "stats.row_data_mode": "Mode de données",
  "stats.mode_live": "en direct",
  "stats.mode_sample": "d'exemple",
  "stats.states_heading": "Où en sont les entrées",
  "stats.states_caption": "Engagements par état actuel.",
  "stats.outcomes_heading": "Résultats de la révision",
  "stats.outcomes_caption": "Dernier résultat de chaque engagement dans la fenêtre.",
  "stats.unread_outcome": "Le résultat n'a pas pu être lu",
  "stats.inconclusive_note":
    "Le non concluant est un résultat à part entière : les preuves n'ont pas tranché la question au dernier tour. Il figure à côté des autres résultats et n'est jamais additionné à un résultat négatif. « Le résultat n'a pas pu être lu » signifie que la lecture elle-même n'a pas répondu — ces entrées sont comptées comme aucun résultat.",
  "stats.sources_heading": "Comment les sources ont été lues",
  "stats.sources_caption":
    "Statuts de lecture additionnés sur le dernier tour de révision de chaque entrée qui les rapporte.",
  "stats.sources_none":
    "Aucune entrée révisée dans la fenêtre n'a encore rapporté de statuts de lecture.",
  "stats.sources_tail":
    "Une source qui n'a pas pu être lue est enregistrée exactement comme telle : elle n'est pas comptée comme preuve pour ou contre un critère.",
  "stats.sources_count": "sources",
  "stats.count_again": "Compter à nouveau",

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
