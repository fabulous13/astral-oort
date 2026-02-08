# Guide de Déploiement : VERITE AI

Pour connecter votre application à `fidelitytesting.com`, vous devez la mettre en ligne. Vercel est excellent pour l'interface visuelle (Frontend), mais ne gère pas la partie "WebSockets" (discussion en direct). Nous utiliserons donc une stratégie hybride.

## 1. Déployer le Backend (Cerveau)
Le backend gère l'IA et la connexion vocale. Il doit tourner 24h/24.
**Hébergeur Recommandé :** [Render.com](https://render.com) (L'offre gratuite suffit pour tester).

1.  Envoyez (push) votre code sur GitHub.
2.  Créez un **New Web Service** sur Render et connectez votre dépôt GitHub.
3.  **Root Directory (Dossier Racine) :** `server`
4.  **Build Command :** `npm install`
5.  **Start Command :** `node index.js`
6.  **Environment Variables :** Ajoutez vos clés (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`) dans le tableau de bord Render.
7.  Déployez ! Vous obtiendrez une URL du type `https://verite-ai-backend.onrender.com`.

## 2. Déployer le Frontend (Application)
C'est ce que vos utilisateurs verront sur leur téléphone.
**Hébergeur Recommandé :** [Vercel](https://vercel.com).

1.  Connectez votre dépôt GitHub à Vercel.
2.  **Root Directory :** `.` (par défaut) ou `client` si vous l'avez déplacé.
3.  **Environment Variables :** Ajoutez `VITE_API_URL` pointant vers l'URL de votre Backend (ex: `wss://verite-ai-backend.onrender.com`).
    *   *Note : Utilisez `wss://` au lieu de `https://` pour les WebSockets.*
4.  Déployez ! Vous obtiendrez une URL du type `https://verite-ai.vercel.app`.

## 3. Connecter votre Domaine
1.  Dans Vercel, allez sur **Settings > Domains**.
2.  Ajoutez `fidelitytesting.com`.
3.  Suivez les instructions pour modifier les DNS (CNAME/A Record) chez votre registraire de domaine.

## Note sur le Micro Mobile
Pour que le microphone fonctionne sur Safari (iPhone) et Chrome (Android), votre site **DOIT** être en HTTPS (`https://...`). Les déploiements ci-dessus garantissent cela automatiquement.
