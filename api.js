// ═══════════════════════════════════════════════════════
// API.JS v3.0 — Appels via proxy Netlify
// La cle API est sur le serveur Netlify
// Les joueurs n'ont besoin de rien configurer
// ═══════════════════════════════════════════════════════

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Proxy Netlify : notre fonction serverless
const PROXY_URL = '/.netlify/functions/claude-proxy';

// ── APPEL API DE BASE ─────────────────────────────────
async function callClaudeAPI(systemPrompt, userPrompt, maxTokens = 1500) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur serveur ' + response.status);
  }

  const data = await response.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

function parseJSON(text) {
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  return JSON.parse(clean);
}

// ── GÉNÉRATION DU SCÉNARIO ───────────────────────────
async function generateScenario() {
  const cat = game.scenarioCategory;
  const unlockedTechs = profile.unlockedTechs.map(id => {
    const t = getTechById(id);
    return t ? `${t.icon} ${t.name} (${t.shortDesc})` : id;
  }).join(', ');

  const lang = profile.language || 'fr';
  const currency = profile.currency || 'EUR';
  const level = profile.level;

  // Déterminer la difficulté selon le niveau
  const difficulty = level <= 2 ? 'facile' : level <= 4 ? 'intermédiaire' : level <= 6 ? 'avancé' : 'expert';

  // Contexte entreprise si applicable
  const enterpriseContext = currentContext === 'enterprise' && profile.enterprise?.aiSummary
    ? `\n\nCONTEXTE ENTREPRISE:\nSecteur: ${profile.enterprise.aiSummary.sector}\nProduits: ${profile.enterprise.aiSummary.products?.join(', ')}\nClients: ${profile.enterprise.aiSummary.clients?.join(', ')}\nFonction de l'employé: ${profile.enterprise.employeeFunction}\nVocabulaire métier: ${profile.enterprise.aiSummary.vocabulary?.join(', ')}\n\nCrée un scénario qui ressemble exactement à une situation que cet employé pourrait vivre dans ce secteur.`
    : '';

  // Décider si on déclenche un événement perturbateur (~30% des parties)
  const triggerDisruption = Math.random() < 0.30;
  const disruptionStepIndex = [1, 2, 3][Math.floor(Math.random() * 3)]; // Étapes 2, 3 ou 4 (index 1,2,3)

  const systemPrompt = `Tu es un expert en négociation qui crée des scénarios de jeu de rôle pédagogiques et réalistes.
Tu dois TOUJOURS répondre avec un JSON valide et UNIQUEMENT du JSON — aucun texte avant ou après.
La langue de réponse est : ${lang === 'fr' ? 'FRANÇAIS' : lang === 'en' ? 'ENGLISH' : 'ESPAÑOL'}.
La devise est : ${currency}.`;

  const userPrompt = `Crée un scénario de négociation de type "${cat.name}" (${cat.desc}).

Niveau du joueur: ${level} — Difficulté cible: ${difficulty}
Techniques déverrouillées: ${unlockedTechs}
${enterpriseContext}

${triggerDisruption ? `IMPORTANT: Inclure un événement perturbateur secret qui se déclenche à l'étape ${disruptionStepIndex + 1}.` : ''}

Retourne EXACTEMENT ce JSON (aucun autre texte):
{
  "title": "Titre court du scénario",
  "context": "Description narrative courte de la situation (2-3 phrases)",
  "yourRole": "Rôle et nom du joueur",
  "opponentName": "Prénom de l'adversaire",
  "opponentRole": "Rôle/titre de l'adversaire",
  "opponentEmoji": "Un emoji représentant l'adversaire (ex: 🧑‍💼, 👩‍💼, 🕵️)",
  "opponentProfile": {
    "Ouverture": "Prudent/Ouvert/Méfiant",
    "Patience": "Limitée/Bonne/Faible",
    "Flexibilité": "Faible/Modérée/Haute"
  },
  "location": "Lieu de la négociation",
  "stakes": "Enjeux principaux en 1 phrase",
  "steps": [
    {
      "situation": "Description de la situation à cette étape (2-3 phrases)",
      "opponentLine": "Réplique directe de l'adversaire (1-2 phrases, ton réaliste)",
      "mood": "hostile|neutral|warm",
      "techniques": ["techId1", "techId2"]
    }
  ],
  "disruption": {
    "enabled": ${triggerDisruption},
    "stepIndex": ${disruptionStepIndex},
    "type": "${['personal', 'professional', 'positive'][Math.floor(Math.random() * 3)]}",
    "event": "Description de l'événement (pour révélation finale)",
    "moodShift": "hostile|pressured|relaxed",
    "revealText": "Ce que vous ne saviez pas : [description de l'événement qui a changé le comportement]. [Leçon pédagogique en 1 phrase]."
  }
}

RÈGLES:
- Crée exactement 5 étapes bien construites
- L'adversaire doit être réaliste et cohérent avec le type de scénario
- Les répliques doivent sonner naturelles, pas comme un exercice scolaire
- Le scénario doit permettre d'utiliser les techniques listées
- Si l'événement perturbateur est désactivé (enabled: false), mets des valeurs vides pour les autres champs disruption`;

  try {
    const text = await callClaudeAPI(systemPrompt, userPrompt, 2000);
    const scenario = parseJSON(text);
    game.scenario = scenario;
    game.maxSteps = 10; // Maximum possible avec extensions
    startGameDisplay();
  } catch(err) {
    console.error('Génération scénario:', err);
    showView('view-menu');
    if (err.message.includes('API')) {
      showToast('❌ ' + err.message + ' — Vérifiez votre clé API dans le profil.', 5000);
    } else {
      showToast('❌ Erreur de génération. Réessayez.', 3000);
    }
  }
}

// ── GÉNÉRATION DES RÉPONSES ───────────────────────────
async function callGenerateResponsesAPI(step, techs, disruptionActive) {
  const lang = profile.language || 'fr';
  const techList = techs.map(t => `${t.icon} ${t.name} : ${t.definition}`).join('\n');
  const disruptionNote = disruptionActive
    ? '\nNOTE: Un événement a perturbé l\'adversaire. Les réponses doivent tenir compte d\'une humeur plus fermée ou imprévisible.'
    : '';

  // Historique complet — sans ça l'IA génère des réponses hors contexte aux étapes 3-5
  const conversationHistory = game.steps.length > 0
    ? '\nHISTORIQUE DE LA CONVERSATION :\n' +
      game.steps.map((s, i) => {
        const stepData = game.scenario.steps[i];
        return `Étape ${i + 1} :\n  ${game.scenario.opponentName} : "${stepData?.opponentLine || ''}"\n  Vous avez répondu : "${s.response || ''}"\n  Score : ${s.score}/100`;
      }).join('\n')
    : "C'est la première étape.";

  const systemPrompt = `Tu es un expert en négociation qui génère des options de réponse concrètes et réalistes.
Tu dois TOUJOURS répondre avec un JSON valide et UNIQUEMENT du JSON.
Langue: ${lang === 'fr' ? 'FRANÇAIS' : lang === 'en' ? 'ENGLISH' : 'ESPAÑOL'}`;

  const userPrompt = `CONTEXTE DU SCÉNARIO :
"${game.scenario?.context || ''}"
Type de négociation : ${game.scenarioCategory?.name}
Adversaire : ${game.scenario?.opponentName} (${game.scenario?.opponentRole})
${conversationHistory}

ÉTAPE ACTUELLE (étape ${game.currentStep + 1}) :
Situation : "${step.situation}"
${game.scenario?.opponentName} dit : "${step.opponentLine}"
${disruptionNote}

Techniques sélectionnées par le joueur :
${techList}

Génère ${techs.length + 3} à ${techs.length + 5} réponses COHÉRENTES avec tout l'historique ci-dessus.
IMPORTANT : faire suite logiquement à la conversation — pas de répétitions ni de hors-contexte.

Retourne EXACTEMENT ce JSON:
[
  {
    "letter": "A",
    "techTag": "⚓ Ancrage haut",
    "text": "La réponse formulée en discours direct (1-3 phrases percutantes)",
    "explanation": "Pourquoi cette réponse est efficace à CE moment précis de la négociation (1 phrase)",
    "modeWeight": "competitive|harvard|coercive"
  }
]

RÈGLES:
- Réponses cohérentes avec l'arc narratif de la négociation
- Discours direct, pas des descriptions
- Varier : directe, diplomatique, créative
- Au moins 1 réponse par technique choisie
- Maximum 8 réponses au total`;

  const text = await callClaudeAPI(systemPrompt, userPrompt, 1500);
  return parseJSON(text);
}

// ── ÉVALUATION D'UNE RÉPONSE ─────────────────────────
async function callEvaluateAPI(step, response, techs, disruptionActive, failCounter) {
  const lang = profile.language || 'fr';
  const techNames = techs.map(t => t.name).join(', ');
  const disruptionNote = disruptionActive
    ? '\nNOTE CONTEXTUELLE: Un événement perturbateur externe a rendu l\'adversaire moins coopératif — ceci est indépendant de la qualité de la réponse du joueur.'
    : '';

  // Historique pour que l'évaluation tienne compte du contexte complet
  const conversationHistory = game.steps.length > 0
    ? '\nHISTORIQUE :\n' +
      game.steps.map((s, i) => {
        const stepData = game.scenario.steps[i];
        return `Étape ${i + 1} : ${game.scenario?.opponentName} dit "${stepData?.opponentLine || ''}" → joueur répond "${s.response || ''}" → score ${s.score}/100`;
      }).join('\n')
    : '';

  const systemPrompt = `Tu es un expert en négociation qui évalue des réponses pédagogiquement.
Tu dois TOUJOURS répondre avec un JSON valide et UNIQUEMENT du JSON.
Langue du feedback: ${lang === 'fr' ? 'FRANÇAIS' : lang === 'en' ? 'ENGLISH' : 'ESPAÑOL'}`;

  const userPrompt = `CONTEXTE DU SCÉNARIO :
"${game.scenario?.context || ''}"
Type : ${game.scenarioCategory?.name}
${conversationHistory}

ÉTAPE ACTUELLE (étape ${game.currentStep + 1}) :
Situation : "${step.situation}"
${game.scenario?.opponentName} a dit : "${step.opponentLine}"
Techniques utilisées : ${techNames}
Réponse du joueur : "${response?.text || ''}"
Compteur d'échecs consécutifs : ${failCounter}
${disruptionNote}

Évalue cette réponse en tenant compte du contexte complet de la négociation.

Retourne EXACTEMENT ce JSON:
{
  "score": 75,
  "quality": "good",
  "feedback": "Feedback concret en 2-3 phrases : ce qui a fonctionné, ce qui pourrait être amélioré. Ton encourageant mais honnête.",
  "continuitySignal": "continue",
  "modeWeight": "harvard"
}

RÈGLES pour le score (0-100):
- 85-100 : Réponse excellente, parfaitement appliquée, impact fort
- 70-84 : Bonne réponse, technique bien utilisée
- 55-69 : Réponse correcte mais manque de précision ou de conviction
- 40-54 : Réponse faible, technique mal appliquée
- 0-39 : Réponse contre-productive

RÈGLES pour continuitySignal:
- "conclude" : score ≥ 85 ET étape ≥ 4 → l'adversaire est prêt à conclure
- "extend" : joueur récupère bien après une mauvaise étape précédente (failCounter était > 0, maintenant bonne réponse)
- "failing" : score < 50 → le joueur est sur une mauvaise trajectoire  
- "fail" : failCounter ≥ 2 ET score < 45 → négociation en impasse
- "continue" : tout autre cas normal

Sois pédagogique et bienveillant dans le feedback.`;

  const text = await callClaudeAPI(systemPrompt, userPrompt, 600);
  return parseJSON(text);
}

// ── RÉSUMÉ ÉDUCATIF DE FIN DE PARTIE ─────────────────
async function generateEndSummary() {
  const lang = profile.language || 'fr';
  const steps = game.steps;

  const stepsHistory = steps.map((s, i) => {
    const techs = s.techs.map(id => getTechById(id)?.name || id).join(', ');
    return `Étape ${i+1}: Techniques: ${techs} | Score: ${s.score}/100 | Signal: ${s.signal}${s.disruptionActive ? ' | ⚡ Disruption active' : ''}`;
  }).join('\n');

  const disruptionInfo = game.disruptionTriggered
    ? `\nÉVÉNEMENT PERTURBATEUR: ${game.scenario.disruption?.event || 'Inconnu'} (déclenché à l'étape ${game.disruptionStep + 1})`
    : '\nPas d\'événement perturbateur dans cette partie.';

  const systemPrompt = `Tu es un coach en négociation expert qui fait un bilan pédagogique bienveillant et actionnable.
Tu dois TOUJOURS répondre avec un JSON valide et UNIQUEMENT du JSON.
Langue: ${lang === 'fr' ? 'FRANÇAIS' : lang === 'en' ? 'ENGLISH' : 'ESPAÑOL'}`;

  const userPrompt = `Historique de la partie:
Type de scénario: ${game.scenarioCategory?.name}
Score final: ${game.totalScore}/100
Résultat: ${game.outcome}
Nombre d'étapes: ${steps.length}
${stepsHistory}
${disruptionInfo}

Génère un bilan pédagogique.

Retourne EXACTEMENT ce JSON:
{
  "narrative": "Résumé narratif de l'arc de la négociation en 3-4 phrases. Mention des points forts et du moment charnière.",
  "stepFeedbacks": [],
  "bestAlternative": {
    "step": 2,
    "option": "Ce que vous auriez pu dire : [réponse concrète en discours direct]",
    "reason": "Pourquoi cette approche aurait été plus efficace (1 phrase)"
  },
  "recommendation": "Une seule recommandation concrète et actionnable pour la prochaine partie (1-2 phrases).",
  "disruptionAnalysis": "Si un événement perturbateur a eu lieu : analyse de la réaction du joueur (1-2 phrases) ou chaîne vide si pas de disruption."
}

RÈGLES:
- Narratif : honnête mais encourageant
- bestAlternative : choisir l'étape avec le score le plus bas
- recommendation : UNE seule chose concrète, pas une liste
- Ton coach bienveillant, jamais condescendant`;

  try {
    const text = await callClaudeAPI(systemPrompt, userPrompt, 800);
    const summary = parseJSON(text);
    updateResultWithSummary(summary);
  } catch(err) {
    console.error('Résumé éducatif:', err);
    // Fallback
    updateResultWithSummary({
      narrative: `Vous avez complété ce scénario avec un score de ${game.totalScore}/100 en ${game.steps.length} étapes.`,
      recommendation: 'Continuez à pratiquer et explorez de nouvelles techniques à chaque partie.',
      bestAlternative: { step: 1, option: 'Consultez la page de référence des techniques pour approfondir.', reason: '' }
    });
  }
}
