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
  const currEl = document.getElementById('currencySelect');
  const apiEl = document.getElementById('apiKeyInput');
  if (langEl) langEl.value = profile.language || 'fr';
  if (currEl) currEl.value = profile.currency || 'EUR';
  if (apiEl) {
    const key = getApiKey();
    apiEl.value = key ? '••••••••••••' : '';
    apiEl.placeholder = key ? 'Clé enregistrée' : 'sk-ant-...';
  }
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
