// ═══════════════════════════════════════════════════════
// UI.JS — Fonctions de rendu et mise à jour de l'interface
// ═══════════════════════════════════════════════════════

// ── INIT UI GLOBALE ──────────────────────────────────
function updateAllUI() {
  updateHUD();
  renderMenu();
  updateContextToggle();
  renderProfile();
  renderGlossary();
  renderBadges();
  loadProfileSettings();
  updateEnvSwitchBtn();
}

// ── HUD ───────────────────────────────────────────────
function updateHUD() {
  const xpNeeded = getXPForLevel(profile.level);
  const pct = Math.min(100, (profile.xp / xpNeeded) * 100);

  document.getElementById('hudLevel').textContent = profile.level;
  document.getElementById('hudXPVal').textContent = profile.xp;
  const fill = document.getElementById('xpFillMini');
  if (fill) fill.style.width = pct + '%';
}

// ── CONTEXTE TOGGLE ──────────────────────────────────
function updateContextToggle() {
  const toggle = document.getElementById('contextToggle');
  const hasEnterprise = profile.enterprise?.activated;

  if (hasEnterprise) {
    toggle.classList.remove('hidden');
    document.getElementById('ctxCompanyName').textContent = profile.enterprise.companyName || 'Entreprise';
    document.getElementById('ctxPersonal').classList.toggle('active', currentContext === 'personal');
    document.getElementById('ctxEnterprise').classList.toggle('active', currentContext === 'enterprise');
  } else {
    toggle.classList.add('hidden');
  }
  updateEnvSwitchBtn();
}

function updateEnvSwitchBtn() {
  // Bouton "Changer d'environnement" visible seulement si on est dans un env
  // et qu'on n'a PAS les deux actifs simultanément (toggle déjà là)
  const btn = document.getElementById('envSwitchBtn');
  if (!btn) return;
  const hasEnterprise = profile.enterprise?.activated;
  // Montrer le bouton switch si pas de double-toggle (env seul actif)
  btn.classList.toggle('hidden', !!hasEnterprise);
}

// ── MENU ─────────────────────────────────────────────
function renderMenu() {
  const ctx = getCtx();
  const isEnterprise = currentContext === 'enterprise';

  // Titre du menu
  document.getElementById('menuTitle').textContent = isEnterprise
    ? `🏢 ${profile.enterprise.companyName || 'Espace Entreprise'}`
    : 'Choisissez votre scénario';
  document.getElementById('menuSub').textContent = isEnterprise
    ? `Formation pour ${profile.enterprise.employeeFunction || 'votre équipe'}`
    : 'Sélectionnez une catégorie de négociation';

  // Grille des catégories
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const available = isEnterprise ? cat.enterprise : cat.personal;
    const card = document.createElement('div');
    card.className = `category-card ${available ? '' : 'disabled'}`;
    card.innerHTML = `
      <div class="cat-icon">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-desc">${cat.desc}</div>
    `;
    if (available) {
      card.onclick = () => selectScenario(cat.id);
    }
    grid.appendChild(card);
  });

  // Stats bar
  document.getElementById('menuStreak').textContent = ctx.streak || 0;
  document.getElementById('menuAvgScore').textContent = ctx.avgScore ? ctx.avgScore + '/100' : '—';
  document.getElementById('menuGamesPlayed').textContent = ctx.gamesPlayed || 0;

  // Mode teaser
  const history = ctx.history || [];
  const modeTeaser = document.getElementById('modeTeaser');
  if (history.length >= 3 && !ctx.modeRevealed) {
    modeTeaser.classList.remove('hidden');
    modeTeaser.textContent = '🧠 Votre mode de négociation se dessine...';
  } else if (ctx.modeRevealed) {
    const dominant = getDominantMode(currentContext);
    const icons = { competitive: '⚔', harvard: '🤝', coercive: '👁' };
    modeTeaser.classList.remove('hidden');
    modeTeaser.textContent = `${icons[dominant] || '🧠'} Mode : ${dominant === 'competitive' ? 'Compétitif' : dominant === 'harvard' ? 'Harvard' : 'Coercitif'}`;
  } else {
    modeTeaser.classList.add('hidden');
  }
}

// ── RESULT SCREEN ─────────────────────────────────────
function renderResultScreen(xpGained) {
  const score = game.totalScore;
  const outcome = game.outcome;
  const steps = game.steps;

  // Header
  document.getElementById('resultScoreBig').textContent = score;
  document.getElementById('resultStars').textContent = getStarRating(score);
  document.getElementById('resultOutcome').textContent =
    outcome === 'fail' ? 'Négociation interrompue' :
    outcome === 'recovery' ? 'Récupération réussie ! 💪' :
    'Négociation réussie ! 🎉';

  document.getElementById('resultHeader').style.background =
    outcome === 'fail' ? 'var(--red)' :
    outcome === 'recovery' ? 'var(--orange)' :
    'var(--navy)';

  // Bouton rejouer
  document.getElementById('btnReplay').style.display = outcome === 'fail' ? 'inline-flex' : 'inline-flex';

  // XP
  document.getElementById('xpGainedNum').textContent = xpGained;
  const xpNeeded = getXPForLevel(profile.level);
  const xpPct = Math.min(100, (profile.xp / xpNeeded) * 100);
  setTimeout(() => {
    document.getElementById('xpFillResult').style.width = xpPct + '%';
  }, 300);

  // Revue étape par étape
  const reviewList = document.getElementById('stepsReviewList');
  reviewList.innerHTML = steps.map((step, i) => {
    const scoreClass = step.score >= 80 ? 'excellent' : step.score >= 60 ? 'good' : 'poor';
    const techNames = step.techs.map(id => getTechById(id)?.icon || '').join(' ');
    return `
      <div class="step-review-row">
        <div class="step-num">Étape ${i+1} ${step.disruptionActive ? '⚡' : ''}</div>
        <div class="step-review-score ${scoreClass}">${step.score}</div>
        <div class="step-review-feedback">
          <span style="font-size:13px;color:var(--text-light)">${techNames}</span>
          <div>${step.feedback || '—'}</div>
        </div>
      </div>
    `;
  }).join('');

  // Mode de la partie
  const sessionMode = calculateSessionMode();
  document.getElementById('gameModeBreakdown').innerHTML = `
    <div class="mode-breakdown-bars">
      <div class="mode-breakdown-row">
        <span>⚔ Compétitif</span>
        <div class="mode-breakdown-bar"><div class="mode-bd-fill competitive" style="width:${sessionMode.competitive}%"></div></div>
        <span>${sessionMode.competitive}%</span>
      </div>
      <div class="mode-breakdown-row">
        <span>🤝 Harvard</span>
        <div class="mode-breakdown-bar"><div class="mode-bd-fill harvard" style="width:${sessionMode.harvard}%"></div></div>
        <span>${sessionMode.harvard}%</span>
      </div>
      <div class="mode-breakdown-row">
        <span>👁 Coercitif</span>
        <div class="mode-breakdown-bar"><div class="mode-bd-fill coercive" style="width:${sessionMode.coercive}%"></div></div>
        <span>${sessionMode.coercive}%</span>
      </div>
    </div>
  `;

  // Placeholder pour le résumé IA (rempli par generateEndSummary)
  document.getElementById('narrativeText').textContent = 'Analyse en cours...';
  document.getElementById('recommendationText').textContent = 'Analyse en cours...';
  document.getElementById('bestAltContent').innerHTML = '<p style="color:var(--text-light);font-style:italic">Analyse en cours...</p>';
}

function calculateSessionMode() {
  const w = game.sessionModeWeights;
  const total = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  return {
    competitive: Math.round((w.competitive / total) * 100),
    harvard: Math.round((w.harvard / total) * 100),
    coercive: Math.round((w.coercive / total) * 100)
  };
}

function getStarRating(score) {
  if (score >= 85) return '⭐⭐⭐';
  if (score >= 65) return '⭐⭐';
  return '⭐';
}

function updateResultWithSummary(summary) {
  if (summary.narrative) {
    document.getElementById('narrativeText').textContent = summary.narrative;
  }
  if (summary.recommendation) {
    document.getElementById('recommendationText').textContent = summary.recommendation;
  }
  if (summary.bestAlternative) {
    const ba = summary.bestAlternative;
    document.getElementById('bestAltContent').innerHTML = `
      <div class="best-alt-box">
        <strong>À l'étape ${ba.step || '—'} :</strong><br>
        ${ba.option || ba.text || ''}<br>
        <em style="font-size:14px;color:var(--text-light);margin-top:8px;display:block">${ba.reason || ''}</em>
      </div>
    `;
  }
}

// ── PROFIL ────────────────────────────────────────────
function renderProfile() {
  const ctx = getCtx();

  // Nom d'utilisateur
  const usernameText = document.getElementById('usernameText');
  if (usernameText) usernameText.textContent = profile.username || 'Mon profil';
  updateProfileHeaderBadge();

  // Avatar
  const av = profile.avatar;
  const display = av.type === 'photo' ? `<img src="${av.data}">` : av.data;
  const profileAv = document.getElementById('profileAvatar');
  if (profileAv) profileAv.innerHTML = display;

  // Niveau & XP
  const xpNeeded = getXPForLevel(profile.level);
  const pct = Math.min(100, (profile.xp / xpNeeded) * 100);
  const lvlEl = document.getElementById('profileLevel');
  if (lvlEl) lvlEl.textContent = profile.level;
  const xpFill = document.getElementById('xpFillProfile');
  if (xpFill) { setTimeout(() => { xpFill.style.width = pct + '%'; }, 300); }
  const xpText = document.getElementById('profileXPText');
  if (xpText) xpText.textContent = `${profile.xp} / ${xpNeeded} XP`;

  // Stats
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('pGamesPlayed', ctx.gamesPlayed || 0);
  setEl('pSuccessRate', ctx.successRate ? ctx.successRate + '%' : '—%');
  setEl('pAvgScore', ctx.avgScore || '—');
  setEl('pStreak', ctx.streak || 0);

  // Mode négociateur
  renderProfileMode();

  // Techniques
  renderProfileTechs();
}

function renderProfileMode() {
  const ctx = getCtx();
  const container = document.getElementById('profileModeDisplay');
  if (!container) return;

  if (!ctx.modeRevealed && (ctx.history?.length || 0) < 3) {
    container.innerHTML = `<p class="profile-mode-placeholder">Jouez ${3 - (ctx.history?.length || 0)} parties de plus pour voir votre tendance.</p>`;
    return;
  }

  const modeProfile = calculateModeProfile(currentContext);
  const dominant = getDominantMode(currentContext);
  const labels = { competitive: '⚔ Compétitif', harvard: '🤝 Harvard', coercive: '👁 Coercitif' };

  container.innerHTML = `
    <div class="mode-tendency-bar">
      <div class="mode-tend-seg" style="width:${modeProfile.competitive}%;background:var(--navy)"></div>
      <div class="mode-tend-seg" style="width:${modeProfile.harvard}%;background:var(--green)"></div>
      <div class="mode-tend-seg" style="width:${modeProfile.coercive}%;background:var(--red)"></div>
    </div>
    <div style="display:flex;gap:16px;font-size:14px;margin-top:8px;flex-wrap:wrap">
      <span>⚔ ${modeProfile.competitive}%</span>
      <span>🤝 ${modeProfile.harvard}%</span>
      <span>👁 ${modeProfile.coercive}%</span>
    </div>
    ${ctx.modeRevealed ? `<p style="margin-top:12px;font-weight:600;color:var(--navy)">Mode dominant : ${labels[dominant]}</p>` : '<p style="color:var(--text-light);font-style:italic;margin-top:8px">Révélation après 5 parties...</p>'}
  `;
}

function renderProfileTechs() {
  const ctx = getCtx();
  const grid = document.getElementById('profileTechsGrid');
  if (!grid) return;

  grid.innerHTML = TECHNIQUES.map(tech => {
    const isUnlocked = profile.unlockedTechs.includes(tech.id);
    const score = ctx.techScores?.[tech.id];
    const isMastered = score >= 80;
    return `
      <div class="profile-tech-item ${isUnlocked ? (isMastered ? 'mastered' : '') : 'locked'}">
        <span>${tech.icon}</span>
        <span style="font-size:13px">${tech.name}</span>
        ${isUnlocked && score ? `<span style="font-family:'DM Mono',monospace;font-size:12px;margin-left:auto;color:var(--text-light)">${score}</span>` : ''}
        ${!isUnlocked ? `<span style="margin-left:auto;font-size:11px;color:var(--text-light)">Niv.${tech.level}</span>` : ''}
      </div>
    `;
  }).join('');
}

function loadProfileSettings() {
  const langEl = document.getElementById('langSelect');
  if (langEl) langEl.value = profile.language || 'fr';

  // Devise libre (2 champs)
  const currName = document.getElementById('currencyNameInput');
  const currSymbol = document.getElementById('currencySymbolInput');
  if (currName) currName.value = profile.currencyName || 'Dollar canadien';
  if (currSymbol) currSymbol.value = profile.currencySymbol || '$';

  // Nom d'utilisateur
  const nameEl = document.getElementById('usernameText');
  if (nameEl) nameEl.textContent = profile.username || 'Mon profil';
  const nameInput = document.getElementById('usernameInput');
  if (nameInput) nameInput.value = profile.username || '';

  // Badge profil et nom court dans header
  updateProfileHeaderBadge();
}

function updateProfileHeaderBadge() {
  const nameShort = document.getElementById('profileNameShort');
  if (nameShort) {
    const name = profile.username || '';
    nameShort.textContent = name ? name.split(' ')[0] : '';
  }
  // Badge vert si nouveau badge récemment débloqué
  const dot = document.getElementById('profileBadgeDot');
  if (dot) {
    const ctx = getCtx();
    const hasNew = (ctx.newBadges && ctx.newBadges.length > 0);
    dot.classList.toggle('has-new', !!hasNew);
  }
}

function toggleUsernameEdit() {
  const row = document.getElementById('usernameEditRow');
  const display = document.getElementById('usernameDisplay');
  if (!row) return;
  const hidden = row.classList.contains('hidden');
  row.classList.toggle('hidden', !hidden);
  display.classList.toggle('hidden', hidden);
  if (hidden) {
    const input = document.getElementById('usernameInput');
    if (input) { input.value = profile.username || ''; input.focus(); }
  }
}

function saveUsername() {
  const input = document.getElementById('usernameInput');
  if (!input) return;
  const name = input.value.trim();
  profile.username = name;
  saveProfile();
  document.getElementById('usernameText').textContent = name || 'Mon profil';
  document.getElementById('usernameEditRow').classList.add('hidden');
  document.getElementById('usernameDisplay').classList.remove('hidden');
  updateProfileHeaderBadge();
  showToast('Nom sauvegardé ✓');
  // Mettre à jour l'avatar du joueur dans le jeu
  const playerPanel = document.getElementById('playerNamePanel');
  if (playerPanel && name) playerPanel.textContent = name;
}

function updateCurrencyFree() {
  const nameEl = document.getElementById('currencyNameInput');
  const symEl = document.getElementById('currencySymbolInput');
  if (nameEl) profile.currencyName = nameEl.value;
  if (symEl) profile.currencySymbol = symEl.value;
  saveProfile();
}

// ── GLOSSAIRE ─────────────────────────────────────────
function renderGlossary(modeFilter) {
  const grid = document.getElementById('glossaryGrid');
  if (!grid) return;

  const ctx = getCtx();
  const techs = modeFilter ? TECHNIQUES.filter(t => t.mode === modeFilter) : TECHNIQUES;

  grid.innerHTML = techs.map(tech => {
    const isUnlocked = profile.unlockedTechs.includes(tech.id);
    const usageCount = ctx.techUsage?.[tech.id] || 0;
    const avgScore = ctx.techScores?.[tech.id] || null;

    return `
      <div class="glossary-card ${isUnlocked ? '' : 'locked'}">
        <div class="glossary-card-header">
          <span class="glossary-tech-icon">${tech.icon}</span>
          <div>
            <div class="glossary-tech-name">${tech.name}</div>
            <span class="tech-mode-badge mode-badge-${tech.mode}">
              ${tech.mode === 'competitive' ? '⚔ Compétitif' : tech.mode === 'harvard' ? '🤝 Harvard' : '👁 Coercitif'}
            </span>
          </div>
        </div>
        ${isUnlocked ? `
          <div class="glossary-definition">${tech.definition}</div>
          <div class="glossary-example">${tech.example}</div>
          <div class="glossary-when"><strong>✅ Utiliser quand :</strong> ${tech.whenUse}</div>
          <div class="glossary-when"><strong>⚠️ Éviter si :</strong> ${tech.whenAvoid}</div>
          ${usageCount > 0 ? `<div class="glossary-stat">Utilisée ${usageCount}× · Score moyen : <span class="stat-val">${avgScore || '—'}</span></div>` : ''}
        ` : `
          <div class="glossary-definition">${tech.shortDesc}</div>
          <div class="locked-banner">🔒 Disponible au Niveau ${tech.level}</div>
        `}
      </div>
    `;
  }).join('');
}

function filterGlossary(mode, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGlossary(mode === 'all' ? null : mode);
}

// ── BADGES ────────────────────────────────────────────
function renderBadges() {
  const grid = document.getElementById('badgesGrid');
  if (!grid) return;

  const ctx = getCtx();
  const unlocked = ctx.badges || [];

  grid.innerHTML = BADGES.map(badge => {
    const isUnlocked = unlocked.includes(badge.id);
    const date = isUnlocked ? new Date().toLocaleDateString('fr-FR') : null;
    return `
      <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.desc}</div>
        ${isUnlocked ? `<div class="badge-date">Débloqué</div>` : ''}
      </div>
    `;
  }).join('');
}

// ── AVATAR ────────────────────────────────────────────
function openAvatarModal() {
  pendingAvatar = null;

  // Générer la grille emoji
  const emojiGrid = document.getElementById('emojiGrid');
  emojiGrid.innerHTML = EMOJIS_AVATAR.map(emoji => `
    <div class="emoji-opt" onclick="selectEmojiAvatar('${emoji}', this)">${emoji}</div>
  `).join('');

  document.getElementById('avatarModal').classList.remove('hidden');
}

function closeAvatarModal() {
  document.getElementById('avatarModal').classList.add('hidden');
  pendingAvatar = null;
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target.result;
    pendingAvatar = { type: 'photo', data };
    const preview = document.getElementById('avatarPreview');
    preview.innerHTML = `<img src="${data}">`;
  };
  reader.readAsDataURL(file);
}

function selectEmojiAvatar(emoji, el) {
  pendingAvatar = { type: 'emoji', data: emoji };
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('avatarPreview').innerHTML = emoji;
  document.getElementById('avatarPreview').style.fontSize = '48px';
}

function confirmAvatar() {
  if (!pendingAvatar) { closeAvatarModal(); return; }
  profile.avatar = pendingAvatar;
  saveProfile();
  renderProfile();
  closeAvatarModal();
  showToast('Avatar mis à jour ✓');
}

// ── STATS DU JEU ──────────────────────────────────────
function updateStatBars(confidence, credibility, relation) {
  const setBar = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.max(5, val) + '%';
  };
  setBar('statConfidence', confidence);
  setBar('statCredibility', credibility);
  setBar('statRelation', relation);
}

function updateOpponentMood(mood) {
  const bar = document.getElementById('moodBar');
  const text = document.getElementById('moodText');
  if (!bar) return;

  const moods = {
    hostile: { class: 'hostile', label: 'Hostile', width: '15%' },
    neutral: { class: 'neutral', label: 'Neutre', width: '50%' },
    warm: { class: 'warm', label: 'Réceptif', width: '78%' },
    receptive: { class: 'receptive', label: 'Très ouvert', width: '95%' }
  };

  const m = moods[mood] || moods.neutral;
  bar.className = 'mood-bar ' + m.class;
  bar.style.width = m.width;
  if (text) text.textContent = m.label;

  // Symbole central
  const symbol = document.getElementById('sceneSymbol');
  if (symbol) {
    if (mood === 'warm' || mood === 'receptive') symbol.textContent = '🤝';
    else if (mood === 'hostile') symbol.textContent = '⚔';
    else symbol.textContent = '↔';
  }
}

// ── NOTIFICATIONS & TOASTS ───────────────────────────
function showNotification(title, msg) {
  const popup = document.getElementById('notificationPopup');
  document.getElementById('notifTitle').textContent = title;
  document.getElementById('notifMsg').textContent = msg;
  popup.classList.remove('hidden');
  setTimeout(() => popup.classList.add('hidden'), 4000);
}

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}


// ── SAVIEZ-VOUS QUE (pendant génération des réponses) ──
const DYK_FACTS = [
  { title: "L'ancrage psychologique fonctionne même quand on le sait", text: "Des études montrent que même lorsqu'on est conscient de l'effet d'ancrage, on y reste partiellement sensible. La première offre mentionnée influence toujours le cadre de la négociation.", techId: "anchor" },
  { title: "Le silence est une technique de négociation redoutable", text: "Après une offre, les négociateurs expérimentés attendent sans parler. Le silence crée un inconfort qui pousse souvent l'autre partie à combler le vide... avec des concessions.", techId: "silence" },
  { title: "Les meilleurs négociateurs posent 2× plus de questions", text: "Une étude sur des centaines de négociations a révélé que les négociateurs performants posent en moyenne 21% de questions, contre 10% pour les autres.", techId: "socratic" },
  { title: "L'empathie augmente la valeur totale créée", text: "Comprendre les besoins réels de l'adversaire permet souvent de trouver des solutions que ni l'un ni l'autre n'avait envisagées seul. L'empathie n'est pas une faiblesse — c'est un levier.", techId: "empathy" },
  { title: "Le recadrage change la perception sans changer les faits", text: "Présenter une concession comme un 'investissement dans la relation' plutôt qu'une 'perte' active différentes zones du cerveau de votre interlocuteur et change sa réponse émotionnelle.", techId: "reframe" },
  { title: "Les négociateurs Harvard évitent le mot 'non'", text: "Plutôt que de refuser directement, ils utilisent des formulations comme 'Comment pourrions-nous résoudre cela autrement ?' — ce qui maintient la coopération tout en tenant ferme sur les principes.", techId: "harvard" },
  { title: "La loi de réciprocité est quasi-universelle", text: "Dans toutes les cultures étudiées, recevoir quelque chose crée un sentiment d'obligation de rendre. Dans une négociation, une concession stratégique invite presque toujours une contrepartie.", techId: "reciprocity" },
  { title: "L'urgence artificielle est détectable — et contre-productive", text: "80% des négociateurs affirment avoir déjà senti une fausse urgence de l'autre côté. Quand elle est détectée, elle détruit la confiance et renforce la résistance.", techId: "deadline" },
  { title: "Nommer les émotions réduit leur intensité", text: "La technique du 'labelling' (nommer ce que l'autre ressent) active le cortex préfrontal et réduit l'activité de l'amygdale. Scientifiquement, cela calme littéralement la conversation.", techId: "labeling" },
  { title: "Votre BATNA est votre vraie source de pouvoir", text: "Les négociateurs avec une bonne alternative de rechange obtiennent en moyenne 18% de meilleurs résultats. Avant toute négociation importante, renforcez votre BATNA.", techId: "batna" },
];

let dykInterval = null;
let dykCurrentIndex = 0;
let dykFacts = [];

function showDidYouKnow(selectedTechIds) {
  const overlay = document.getElementById('didYouKnowOverlay');
  if (!overlay) return;

  // Construire une liste de faits pertinents (techs choisies en premier)
  dykFacts = [];
  // Faits sur les techs choisies
  selectedTechIds.forEach(id => {
    const fact = DYK_FACTS.find(f => f.techId === id);
    if (fact) dykFacts.push(fact);
  });
  // Compléter avec d'autres faits aléatoires
  const others = DYK_FACTS.filter(f => !selectedTechIds.includes(f.techId));
  const shuffled = others.sort(() => Math.random() - 0.5);
  dykFacts = [...dykFacts, ...shuffled].slice(0, 5);

  dykCurrentIndex = 0;
  overlay.classList.remove('hidden');
  renderDYKSlide(0);

  // Rotation automatique toutes les 3.5 secondes
  dykInterval = setInterval(() => {
    dykCurrentIndex = (dykCurrentIndex + 1) % dykFacts.length;
    renderDYKSlide(dykCurrentIndex);
  }, 3500);
}

function renderDYKSlide(idx) {
  const fact = dykFacts[idx];
  if (!fact) return;

  document.getElementById('dykTitle').textContent = fact.title;
  document.getElementById('dykText').textContent = fact.text;

  // Trouver la tech associée
  const tech = typeof getTechById === 'function' ? getTechById(fact.techId) : null;
  const techRow = document.getElementById('dykTechRow');
  if (tech && techRow) {
    techRow.style.display = 'flex';
    document.getElementById('dykTechIcon').textContent = tech.icon || '🎯';
    document.getElementById('dykTechName').textContent = tech.name || '';
    document.getElementById('dykTechDesc').textContent = tech.shortDesc || '';
  } else if (techRow) {
    techRow.style.display = 'none';
  }

  // Dots de progression
  const progress = document.getElementById('dykProgress');
  if (progress) {
    progress.innerHTML = dykFacts.map((_, i) =>
      `<div class="didyouknow-dot ${i === idx ? 'active' : ''}"></div>`
    ).join('');
  }
}

function hideDidYouKnow() {
  const overlay = document.getElementById('didYouKnowOverlay');
  if (overlay) overlay.classList.add('hidden');
  if (dykInterval) { clearInterval(dykInterval); dykInterval = null; }
}
