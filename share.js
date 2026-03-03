// ═══════════════════════════════════════════════════════
// SHARE.JS — Partage sur les réseaux sociaux
// Génération des cartes visuelles
// ═══════════════════════════════════════════════════════

function showShareOptions() {
  // Vérifier si partage autorisé (désactivé par défaut en entreprise)
  if (currentContext === 'enterprise') {
    showToast('Le partage est désactivé en mode Entreprise par défaut.');
    return;
  }

  // Déterminer quelle carte générer
  const score = game?.totalScore;
  if (score >= 90 || game?.outcome === 'recovery') {
    showShareModal('performance');
  } else {
    showShareModal('performance');
  }
}

function generateAndShareModeCard() {
  if (currentContext === 'enterprise') {
    showToast('Partage désactivé en mode Entreprise.');
    return;
  }
  showShareModal('mode');
}

function showShareModal(type) {
  const modal = document.getElementById('shareModal');
  const preview = document.getElementById('shareCardPreview');

  if (type === 'mode') {
    const modeProfile = calculateModeProfile(currentContext);
    const dominant = getDominantMode(currentContext);
    preview.innerHTML = buildModeCardHTML(modeProfile, dominant);
  } else {
    preview.innerHTML = buildPerfCardHTML(game?.totalScore || 0, game?.outcome || 'success');
  }

  modal.classList.remove('hidden');
  shareImageData = { type };
}

function closeShareModal() {
  document.getElementById('shareModal').classList.add('hidden');
  shareImageData = null;
}

function buildModeCardHTML(modeProfile, dominant) {
  const modeInfo = {
    competitive: { name: 'Négociateur Compétitif', icon: '⚔', bg: '#1A2744', accent: '#6B9FFF' },
    harvard: { name: 'Négociateur Harvard', icon: '🤝', bg: '#1A4B2E', accent: '#6BE87A' },
    coercive: { name: 'Négociateur Coercitif', icon: '👁', bg: '#3B1A1A', accent: '#FF6B6B' }
  };
  const info = modeInfo[dominant] || modeInfo.competitive;

  return `
    <div style="background:${info.bg};color:#fff;border-radius:16px;padding:32px;font-family:'Lora',serif;max-width:400px;margin:0 auto;">
      <div style="font-size:12px;opacity:0.6;margin-bottom:16px;font-family:'DM Mono',monospace">MAÎTRE NÉGOCIATEUR</div>
      <div style="font-size:48px;margin-bottom:8px">${info.icon}</div>
      <div style="font-size:10px;opacity:0.7;margin-bottom:4px">Mon style de négociation</div>
      <div style="font-size:24px;font-weight:700;margin-bottom:24px">${info.name}</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;font-size:14px">
          <span style="width:100px">⚔ Compétitif</span>
          <div style="flex:1;height:8px;background:rgba(255,255,255,0.15);border-radius:4px">
            <div style="width:${modeProfile.competitive}%;height:100%;background:#6B9FFF;border-radius:4px"></div>
          </div>
          <span style="font-family:'DM Mono',monospace;font-size:12px">${modeProfile.competitive}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:14px">
          <span style="width:100px">🤝 Harvard</span>
          <div style="flex:1;height:8px;background:rgba(255,255,255,0.15);border-radius:4px">
            <div style="width:${modeProfile.harvard}%;height:100%;background:#6BE87A;border-radius:4px"></div>
          </div>
          <span style="font-family:'DM Mono',monospace;font-size:12px">${modeProfile.harvard}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:14px">
          <span style="width:100px">👁 Coercitif</span>
          <div style="flex:1;height:8px;background:rgba(255,255,255,0.15);border-radius:4px">
            <div style="width:${modeProfile.coercive}%;height:100%;background:#FF6B6B;border-radius:4px"></div>
          </div>
          <span style="font-family:'DM Mono',monospace;font-size:12px">${modeProfile.coercive}%</span>
        </div>
      </div>
      <div style="font-size:12px;opacity:0.6;text-align:center;border-top:1px solid rgba(255,255,255,0.2);padding-top:16px">
        Teste ton style → maitre-negociateur2.netlify.app
      </div>
    </div>
  `;
}

function buildPerfCardHTML(score, outcome) {
  const stars = score >= 85 ? '⭐⭐⭐' : score >= 65 ? '⭐⭐' : '⭐';
  const outcomeText = outcome === 'recovery' ? 'Récupération spectaculaire 💪' : 'Négociation maîtrisée 🎯';

  return `
    <div style="background:linear-gradient(135deg,#1A2744,#2E4070);color:#fff;border-radius:16px;padding:32px;font-family:'Lora',serif;max-width:400px;margin:0 auto;text-align:center;">
      <div style="font-size:12px;opacity:0.6;margin-bottom:24px;font-family:'DM Mono',monospace">MAÎTRE NÉGOCIATEUR</div>
      <div style="font-size:72px;font-weight:800;line-height:1;font-family:'Playfair Display',serif">${score}</div>
      <div style="font-size:18px;opacity:0.6;margin-bottom:12px">/ 100</div>
      <div style="font-size:28px;margin-bottom:12px">${stars}</div>
      <div style="font-size:16px;opacity:0.85;margin-bottom:24px">${outcomeText}</div>
      <div style="font-size:12px;opacity:0.5;border-top:1px solid rgba(255,255,255,0.2);padding-top:16px">
        Peux-tu faire mieux ? → maitre-negociateur2.netlify.app
      </div>
    </div>
  `;
}

async function shareToTwitter() {
  const text = shareImageData?.type === 'mode'
    ? `Je viens de découvrir mon style de négociation sur Maître Négociateur ! Teste le tien :`
    : `Je viens de marquer ${game?.totalScore || 0}/100 sur Maître Négociateur ! Peux-tu faire mieux ?`;
  const url = 'https://maitre-negociateur2.netlify.app';
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(tweetUrl, '_blank');
}

function shareToLinkedIn() {
  const url = 'https://maitre-negociateur2.netlify.app';
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank');
}

async function downloadCard() {
  // Sans html2canvas (bibliothèque externe), on propose de copier le texte
  // En production, html2canvas serait chargé depuis cdnjs
  const score = game?.totalScore || 0;
  const text = shareImageData?.type === 'mode'
    ? `Mon style de négociation — Maître Négociateur\nmaitre-negociateur2.netlify.app`
    : `Score : ${score}/100 — Maître Négociateur\nmaitre-negociateur2.netlify.app`;

  try {
    await navigator.clipboard.writeText(text);
    showToast('Texte copié dans le presse-papiers ✓');
  } catch(e) {
    showToast('Partagez le lien : maitre-negociateur2.netlify.app');
  }
  closeShareModal();
}

// Partage natif mobile (si disponible)
async function nativeShare(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch(e) {
      // Annulé par l'utilisateur
    }
  }
}
