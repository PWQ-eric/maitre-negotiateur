// ═══════════════════════════════════════════════════════
// DATA.JS — Données statiques du jeu
// Techniques, catégories, badges, traductions, emojis
// ═══════════════════════════════════════════════════════

const TECHNIQUES = [
  {
    id: 'anchor', icon: '⚓', name: 'Ancrage haut', level: 1,
    mode: 'competitive',
    shortDesc: 'Poser une première offre élevée',
    definition: 'Orienter toute la négociation en posant la première offre volontairement haute ou basse. Chaque concession ultérieure sera mesurée par rapport à cet ancrage.',
    example: '"Notre tarif standard pour ce type de projet est de 85 000 $. Qu\'est-ce qui vous semble envisageable de votre côté ?"',
    whenUse: 'Transactions ponctuelles, marchés où vous avez peu d\'information sur les limites de l\'autre.',
    whenAvoid: 'Relations durables où une ancre trop agressive crée de la méfiance dès le départ.'
  },
  {
    id: 'listen', icon: '👂', name: 'Écoute active', level: 1,
    mode: 'harvard',
    shortDesc: 'Reformuler pour montrer la compréhension',
    definition: 'Démontrer que vous comprenez vraiment ce que l\'autre dit, en reformulant ses propos avec vos propres mots, sans jugement.',
    example: '"Si je comprends bien, votre principale préoccupation c\'est le délai de livraison — pas seulement le prix. C\'est exact ?"',
    whenUse: 'Négociations tendues, situations où l\'autre se sent incompris, ouvertures de négociation.',
    whenAvoid: 'Situations qui exigent des décisions rapides — l\'écoute active prend du temps.'
  },
  {
    id: 'silence', icon: '🤫', name: 'Silence stratégique', level: 1,
    mode: 'competitive',
    shortDesc: 'Forcer l\'autre à combler le vide',
    definition: 'Laisser un silence inconfortable après une question ou une offre. L\'inconfort naturel du silence pousse l\'autre à parler et souvent à se compromettre.',
    example: 'Après avoir posé votre offre : [Attendre 10 secondes en silence, regard calme]',
    whenUse: 'Après une offre, après une objection, pour forcer l\'autre à répondre.',
    whenAvoid: 'Situations culturelles où le silence est mal interprété. Ne pas abuser — ça se remarque.'
  },
  {
    id: 'questions', icon: '❓', name: 'Questions ouvertes', level: 1,
    mode: 'harvard',
    shortDesc: 'Quoi / Comment / Qu\'est-ce qui...',
    definition: 'Poser des questions qui commencent par Quoi, Comment ou Qu\'est-ce qui pour inviter l\'autre à développer et révéler ses vrais intérêts.',
    example: '"Qu\'est-ce qui rendrait cet accord vraiment satisfaisant pour vous ?" ou "Comment voyez-vous les prochaines étapes ?"',
    whenUse: 'Phase de découverte, quand vous ne connaissez pas les intérêts réels de l\'autre.',
    whenAvoid: 'Évitez les questions qui commencent par Pourquoi — elles sonnent comme une accusation.'
  },
  {
    id: 'conditional', icon: '🤝', name: 'Offre conditionnelle', level: 1,
    mode: 'harvard',
    shortDesc: 'Si X, alors Y — échange explicite',
    definition: 'Proposer un échange explicite et conditionnel : chaque concession est liée à une contrepartie. Rien n\'est donné gratuitement.',
    example: '"Si vous pouvez vous engager sur 12 mois, alors je peux baisser le tarif mensuel de 15%."',
    whenUse: 'Quand vous devez céder quelque chose — liez toujours la concession à une contrepartie.',
    whenAvoid: 'Évitez les conditionnelles trop complexes avec trop de variables simultanées.'
  },
  {
    id: 'empathy', icon: '💚', name: 'Empathie tactique', level: 1,
    mode: 'harvard',
    shortDesc: 'Nommer les émotions pour désamorcer',
    definition: 'Identifier et nommer à voix haute les émotions de l\'autre pour montrer que vous les reconnaissez. Cela désamorce les tensions et ouvre la communication.',
    example: '"Je vois que cette situation vous met dans une position difficile. C\'est tout à fait compréhensible."',
    whenUse: 'Situations tendues, adversaires défensifs ou émotifs, après une mauvaise nouvelle.',
    whenAvoid: 'Ne pas utiliser de manière condescendante — l\'autre doit sentir que c\'est sincère.'
  },
  {
    id: 'mirroring', icon: '🪞', name: 'Mirroring', level: 2,
    mode: 'harvard',
    shortDesc: 'Répéter les derniers mots',
    definition: 'Répéter les 2-3 derniers mots de l\'autre avec un ton légèrement interrogatif. Cette technique simple encourage l\'autre à développer et révèle des informations précieuses.',
    example: 'L\'autre : "Ce délai est vraiment problématique." Vous : "...Vraiment problématique ?"',
    whenUse: 'Pour pousser l\'autre à clarifier sans sembler agressif. Très efficace au téléphone.',
    whenAvoid: 'Pas trop souvent dans la même conversation — ça devient mécanique et irritant.'
  },
  {
    id: 'concession', icon: '🔄', name: 'Concession lente', level: 2,
    mode: 'competitive',
    shortDesc: 'Céder au compte-goutte',
    definition: 'Faire des concessions progressivement plus petites, pour signaler que vous approchez de votre limite et que chaque concession vous coûte vraiment.',
    example: 'Concession 1 : -10% → Concession 2 : -5% → Concession 3 : -2% → "C\'est vraiment ma limite absolue."',
    whenUse: 'Négociations où l\'autre s\'attend à des concessions multiples. Surtout pour les achats.',
    whenAvoid: 'Relations où la transparence est plus valorisée que la manœuvre stratégique.'
  },
  {
    id: 'labeling', icon: '🏷️', name: 'Étiquetage émotionnel', level: 3,
    mode: 'harvard',
    shortDesc: 'Il semble que... / On dirait que...',
    definition: 'Mettre une étiquette verbale sur ce que l\'autre ressemble ressentir, avec une phrase qui commence par Il semble que ou On dirait que. Évite le vous semblez (trop assertif).',
    example: '"Il semble que cette proposition ne corresponde pas tout à fait à vos attentes initiales."',
    whenUse: 'Pour valider les émotions sans les confirmer, pour désamorcer l\'hostilité, pour débloquer.',
    whenAvoid: 'Ne pas enchaîner plusieurs étiquettes d\'affilée — laissez l\'autre répondre.'
  },
  {
    id: 'reframe', icon: '🔁', name: 'Reformulation', level: 3,
    mode: 'harvard',
    shortDesc: 'Recadrer dans des termes positifs',
    definition: 'Reprendre les arguments de l\'autre dans des termes différents qui mettent en valeur un aspect positif ou une opportunité cachée dans sa position.',
    example: '"Ce que vous appelez un coût supplémentaire, c\'est en fait un investissement qui vous protège de X pendant 3 ans."',
    whenUse: 'Quand l\'autre est bloqué sur une position, pour changer la perspective sans l\'invalider.',
    whenAvoid: 'Attention à ne pas sembler manipulateur — rester factuel dans la reformulation.'
  },
  {
    id: 'urgency', icon: '⏰', name: 'Urgence artificielle', level: 4,
    mode: 'competitive',
    shortDesc: 'Créer une contrainte de temps',
    definition: 'Introduire une échéance réelle ou perçue pour accélérer la décision de l\'autre et réduire sa marge de réflexion.',
    example: '"Cette offre est valable jusqu\'à vendredi — nous avons un autre acheteur sérieux qui attend notre réponse."',
    whenUse: 'Quand la négociation s\'étire inutilement et que vous voulez accélérer la conclusion.',
    whenAvoid: 'Si l\'urgence est trop évidente ou fausse, elle détruit la crédibilité et la relation.'
  },
  {
    id: 'batna', icon: '🎯', name: 'BATNA / MESORE', level: 4,
    mode: 'competitive',
    shortDesc: 'Révéler votre meilleure alternative',
    definition: 'Mentionner explicitement ou implicitement que vous avez une alternative viable, ce qui renforce votre position et réduit votre dépendance à cet accord spécifique.',
    example: '"Nous discutons en parallèle avec deux autres fournisseurs, mais nous préférons travailler avec vous si nous pouvons nous entendre."',
    whenUse: 'Quand votre BATNA est solide et crédible. Jamais si votre alternative est faible.',
    whenAvoid: 'Ne mentez jamais sur une alternative inexistante — les bluffs se découvrent.'
  },
  {
    id: 'data', icon: '📊', name: 'Données objectives', level: 5,
    mode: 'harvard',
    shortDesc: 'Prix du marché, expertise, loi',
    definition: 'Appuyer vos arguments sur des critères externes et objectifs (prix du marché, rapports d\'experts, normes légales) qui ne dépendent pas de votre volonté.',
    example: '"Le prix moyen du marché pour ce type de service est de X, selon l\'étude sectorielle publiée par [organisme]."',
    whenUse: 'Pour dépasser des impasses, pour légitimer votre position sans sembler arbitraire.',
    whenAvoid: 'Évitez les données douteuses ou mal sourcées — elles se retournent contre vous.'
  },
  {
    id: 'reframing', icon: '💡', name: 'Recadrage positif', level: 5,
    mode: 'harvard',
    shortDesc: 'Transformer l\'obstacle en opportunité',
    definition: 'Recadrer un problème ou une objection comme une opportunité de créer plus de valeur pour les deux parties.',
    example: '"Le fait que nous ne nous entendons pas sur le délai nous donne l\'occasion de réfléchir à une approche en phases qui serait plus flexible pour vous."',
    whenUse: 'Quand la négociation est dans une impasse sur un point précis.',
    whenAvoid: 'Ne recadrez pas une vraie contrainte technique — restez dans le domaine du possible.'
  },
  {
    id: 'salami', icon: '🍕', name: 'Tactique du salami', level: 6,
    mode: 'competitive',
    shortDesc: 'Obtenir par petites tranches successives',
    definition: 'Obtenir de petites concessions successives, en demandant chaque élément séparément plutôt que tout en même temps. Chaque tranche semble insignifiante, mais l\'ensemble est substantiel.',
    example: '"Vous pouvez nous accorder 2% de remise sur ce premier article ?" puis plus tard "Et sur celui-ci aussi ?"',
    whenUse: 'Pour obtenir plus que ce que l\'autre aurait accordé d\'un coup.',
    whenAvoid: 'Si l\'autre identifie la tactique, elle génère une méfiance durable.'
  },
  {
    id: 'ultimatum', icon: '😤', name: 'Ultimatum dur', level: 6,
    mode: 'coercive',
    shortDesc: 'À prendre ou à laisser',
    definition: 'Poser une condition finale non négociable avec des conséquences claires en cas de refus. Technique risquée — ferme la négociation.',
    example: '"C\'est notre offre finale. Si vous ne l\'acceptez pas aujourd\'hui, nous retirons l\'offre et travaillons avec votre concurrent."',
    whenUse: 'Uniquement quand vous avez vraiment l\'intention d\'exécuter la menace. Jamais en bluff.',
    whenAvoid: 'Relations durables, situation où vous avez plus besoin de l\'accord que l\'autre.'
  },
  {
    id: 'goodcop', icon: '🎭', name: 'Bon / Mauvais flic', level: 7,
    mode: 'competitive',
    shortDesc: 'Jouer un rôle plus flexible vs une contrainte externe',
    definition: 'Présenter une contrainte externe (votre direction, les règles, un partenaire) comme le vrai obstacle, vous positionnant comme l\'allié qui veut aider mais dont les mains sont liées.',
    example: '"Personnellement je voudrais vous accorder cette remise, mais ma direction a posé des règles très strictes que je ne peux pas contourner."',
    whenUse: 'Pour maintenir la relation tout en tenant une position ferme.',
    whenAvoid: 'Si la contrainte externe n\'est pas crédible ou si l\'autre peut la contourner facilement.'
  },
  {
    id: 'goldbridge', icon: '🌉', name: 'Pont d\'or', level: 7,
    mode: 'harvard',
    shortDesc: 'Faciliter la retraite honorable de l\'autre',
    definition: 'Aider l\'autre à reculer de sa position initiale sans perdre la face. Construire une porte de sortie qui lui permet d\'accepter sans sembler avoir capitulé.',
    example: '"Ce que vous aviez en tête initialement était tout à fait logique dans votre contexte de l\'époque. Les circonstances ont changé depuis — voici comment on peut intégrer cette évolution..."',
    whenUse: 'Quand l\'autre est bloqué par ego ou par face à sauver, pas par intérêt réel.',
    whenAvoid: 'Inutile si l\'autre n\'est pas vraiment bloqué sur une question d\'ego.'
  },
  {
    id: 'pressure', icon: '📢', name: 'Pression publique', level: 8,
    mode: 'coercive',
    shortDesc: 'Impliquer l\'opinion externe',
    definition: 'Menacer de rendre publique la négociation ou l\'accord, exposant l\'autre à un jugement externe (clients, médias, régulateurs).',
    example: '"Si nous ne trouvons pas de solution amiable, nous serons dans l\'obligation de partager les détails de cette situation avec nos clients communs."',
    whenUse: 'Dernier recours dans des litiges sérieux. Technique à usage unique — détruit la relation.',
    whenAvoid: 'Toute situation où vous avez besoin de préserver la relation après l\'accord.'
  },
  {
    id: 'escalation', icon: '🪤', name: 'Escalade d\'engagement', level: 8,
    mode: 'coercive',
    shortDesc: 'Micro-oui menant à un grand oui',
    definition: 'Obtenir une série de petits engagements progressifs qui créent une pression psychologique d\'aller jusqu\'au bout, même si chaque étape semble raisonnable.',
    example: 'Obtenir d\'abord un accord de principe, puis des ajustements, puis une signature — chaque étape rendant l\'abandon de plus en plus coûteux.',
    whenUse: 'Processus de vente complexes, contrats multi-étapes.',
    whenAvoid: 'Ne pas utiliser de façon manipulatoire — l\'accord forcé sera saboté.'
  }
];

const CATEGORIES = [
  { id: 'business',  icon: '💼', name: 'Affaires',     desc: 'Contrats, partenariats, commercial', personal: true, enterprise: true },
  { id: 'career',   icon: '📈', name: 'Carrière',      desc: 'Salaire, promotion, conditions',      personal: true, enterprise: true },
  { id: 'sale',     icon: '🏠', name: 'Vente',         desc: 'Vendre un bien ou un service',        personal: true, enterprise: true },
  { id: 'purchase', icon: '🛒', name: 'Achat',         desc: 'Acheter auprès d\'un vendeur',        personal: true, enterprise: true },
  { id: 'conflict', icon: '⚔️', name: 'Conflits',      desc: 'Résolution, médiation',               personal: true, enterprise: true },
  { id: 'politics', icon: '🏛️', name: 'Politique',     desc: 'Diplomatie, accords, législation',    personal: true, enterprise: false },
  { id: 'couple',   icon: '💑', name: 'Couple',        desc: 'Vie à deux, décisions partagées',     personal: true, enterprise: false },
  { id: 'family',   icon: '👨‍👩‍👧‍👦', name: 'Famille',  desc: 'Conflits familiaux, héritage',        personal: true, enterprise: false },
  { id: 'crisis',   icon: '🚨', name: 'Prise d\'otage', desc: 'Négociation de crise',               personal: true, enterprise: false }
];

const BADGES = [
  { id: 'welcome',     icon: '🎉', name: 'Bienvenue',      desc: 'Première partie jouée',                          condition: s => s.gamesPlayed >= 1 },
  { id: 'perfect',     icon: '💯', name: 'Perfectionniste', desc: 'Score parfait : 100/100',                       condition: s => s.lastScore >= 100 },
  { id: 'streak',      icon: '🔥', name: 'En feu',          desc: '5 jours de jeu consécutifs',                   condition: s => s.streak >= 5 },
  { id: 'empathic',    icon: '❤️', name: 'Empathique',      desc: 'Score ≥ 85 avec techniques Harvard',            condition: s => s.lastModeScore?.harvard >= 60 && s.lastScore >= 85 },
  { id: 'resilient',   icon: '🔄', name: 'Persévérant',     desc: 'Rejouer immédiatement après un échec',          condition: s => s.justFailed === true },
  { id: 'expert',      icon: '💪', name: 'Expert',          desc: '20 parties réussies',                           condition: s => s.successCount >= 20 },
  { id: 'business',    icon: '💼', name: 'Businessman',      desc: 'Score ≥ 80 sur 3 scénarios Affaires consécutifs', condition: s => s.businessStreak >= 3 },
  { id: 'diplomat',    icon: '🏛️', name: 'Diplomate',       desc: 'Réussir Politique ou Crise avec ≥ 75',           condition: s => s.diplomatBadge === true },
  { id: 'coolblood',   icon: '⚡', name: 'Sang-froid',      desc: 'Score ≥ 80 sur une étape avec événement perturbateur', condition: s => s.disruptionScore >= 80 },
  { id: 'comeback',    icon: '🔁', name: 'Récupération',    desc: 'Réussir après 2 mauvaises réponses consécutives', condition: s => s.comeback === true },

  // ── 10 NOUVEAUX BADGES ───────────────────────────────
  { id: 'speedrun',    icon: '⚡', name: 'Fulgurant',       desc: 'Terminer une négociation en 3 étapes ou moins',   condition: s => s.stepsCount <= 3 && s.lastScore >= 70 },
  { id: 'allstars',    icon: '🌟', name: 'Toutes les étoiles', desc: 'Obtenir 3 étoiles (score ≥ 85) 5 fois de suite', condition: s => s.threeStarsStreak >= 5 },
  { id: 'versatile',   icon: '🔀', name: 'Polyvalent',      desc: 'Gagner dans 5 catégories de scénarios différentes', condition: s => (s.categoriesWon?.length || 0) >= 5 },
  { id: 'coercive',    icon: '👁',  name: 'Maître Coercitif', desc: 'Score ≥ 80 en mode coercitif dominant',         condition: s => s.lastModeScore?.coercive >= 60 && s.lastScore >= 80 },
  { id: 'sensei',      icon: '🥋', name: 'Sensei',          desc: 'Maîtriser 10 techniques différentes (score ≥ 75)', condition: s => Object.values(s.techScores || {}).filter(v => v >= 75).length >= 10 },
  { id: 'negotiator10',icon: '🏅', name: '10 Victoires',    desc: '10 négociations réussies',                        condition: s => s.successCount >= 10 },
  { id: 'firstanchor', icon: '⚓', name: 'Premier Ancrage', desc: 'Utiliser la technique Ancrage pour la première fois', condition: s => (s.techUsage?.anchor || 0) >= 1 },
  { id: 'noconcede',   icon: '🧱', name: 'Mur de granit',   desc: 'Terminer une négociation sans score sous 60 à aucune étape', condition: s => s.allStepsAbove60 === true },
  { id: 'levelup5',    icon: '🎖️', name: 'Niveau 5',        desc: 'Atteindre le niveau 5',                           condition: s => s.level >= 5 },
  { id: 'couple',      icon: '💑', name: 'Harmonie',        desc: 'Score ≥ 80 dans un scénario de type Couple/Famille', condition: s => s.coupleBadge === true }
];

const EMOJIS_AVATAR = ['👩‍💼','👨‍💼','👩‍⚖️','👨‍⚖️','🕵️‍♀️','🕵️','👩‍🏫','👨‍🏫','👩‍💻','👨‍💻'];

const MODE_WEIGHTS_BY_TECH = {
  anchor:     { competitive: 2 },
  listen:     { harvard: 2 },
  silence:    { competitive: 2 },
  questions:  { harvard: 2 },
  conditional:{ harvard: 1, competitive: 1 },
  empathy:    { harvard: 2 },
  mirroring:  { harvard: 2 },
  concession: { competitive: 2 },
  labeling:   { harvard: 2 },
  reframe:    { harvard: 2 },
  urgency:    { competitive: 2 },
  batna:      { competitive: 2 },
  data:       { harvard: 1, competitive: 1 },
  reframing:  { harvard: 2 },
  salami:     { competitive: 2, coercive: 1 },
  ultimatum:  { coercive: 3 },
  goodcop:    { competitive: 1, coercive: 1 },
  goldbridge: { harvard: 3 },
  pressure:   { coercive: 3 },
  escalation: { coercive: 3 }
};

const XP_PER_LEVEL = [100, 150, 200, 280, 360, 450, 550, 660, 800];

function getXPForLevel(level) {
  return XP_PER_LEVEL[Math.min(level - 1, XP_PER_LEVEL.length - 1)] || 1000;
}

function getTechsForLevel(level) {
  return TECHNIQUES.filter(t => t.level <= level).map(t => t.id);
}

function getTechById(id) {
  return TECHNIQUES.find(t => t.id === id);
}
