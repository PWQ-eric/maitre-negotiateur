# 🤝 Maître Négociateur v3.0

Jeu de négociation pédagogique propulsé par l'IA Claude (Anthropic).

## Structure des fichiers

```
maitre-negociateur/
├── index.html          — Structure HTML (toutes les vues)
├── style.css           — Design complet (crème/navy/gold)
├── data.js             — Données statiques (techniques, catégories, badges)
├── engine.js           — Moteur de jeu, profil, gamification
├── ui.js               — Rendu de l'interface
├── api.js              — Appels à l'API Claude
├── share.js            — Partage sur les réseaux sociaux
└── netlify.toml        — Configuration de déploiement
```

## Fonctionnalités v3.0

- ✅ 1 compte / 2 contextes (Personnel + Entreprise)
- ✅ 20 techniques de négociation, révélées progressivement sur 8 niveaux
- ✅ 3 modes détectés silencieusement (Compétitif / Harvard / Coercitif)
- ✅ 9 catégories de scénarios générés par IA
- ✅ Scénarios à longueur variable (3–10 étapes selon performances)
- ✅ Adversaire instable — événement perturbateur aléatoire (~30%)
- ✅ Résumé éducatif After Action Review en fin de partie
- ✅ Glossaire interactif des 20 techniques
- ✅ Partage sur les réseaux sociaux (cartes visuelles)
- ✅ Gamification complète (XP, niveaux, 10 badges, streak)
- ✅ Avatar personnalisé (emoji ou photo)
- ✅ i18n FR / EN / ES

## Configuration requise

**Clé API Claude** : L'application utilise l'API Anthropic Claude directement depuis le navigateur. Chaque utilisateur entre sa propre clé dans Profil → Paramètres.

Obtenir une clé : https://console.anthropic.com

## Déploiement

1. Push ce dossier sur GitHub
2. Connecter le repo à Netlify
3. Publier (`publish = "."` dans netlify.toml)

## Développement local

```bash
# Serveur local simple
npx serve .
# ou
python3 -m http.server 8080
```

---
*Version 3.0 — Architecture : SPA vanilla JS, API Anthropic, localStorage*
