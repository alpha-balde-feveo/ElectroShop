# 🌊 Wave — Guide d'installation et d'intégration API

Ce document couvre les deux niveaux d'intégration Wave pour GayeTech Store :
le **niveau 1 (déjà en place)** avec le lien de paiement + QR code, et le
**niveau 2 (API Checkout)** pour la confirmation automatique des paiements.

Documentation officielle : https://docs.wave.com/checkout

---

## Niveau 1 — Lien de paiement + QR (déjà intégré au site)

C'est ce que le site utilise aujourd'hui pour le retrait en boutique :
le client scanne un QR généré à partir de votre lien de paiement Wave Business,
avec le montant pré-rempli. **Aucune clé API nécessaire.**

### 1.1 Obtenir le lien

1. Créez un compte **Wave Business** : app Wave → menu → "Wave Business",
   ou sur https://business.wave.com (pièce d'identité + infos boutique requises).
2. Une fois validé, le portail vous donne votre **lien de paiement marchand** :
   `https://pay.wave.com/m/M_XXXXXXXX/c/sn/`
3. Frais marchands Wave : **1 %** par encaissement (l'encaissement client est gratuit pour lui).

### 1.2 Le brancher au site

Dans le `.env` racine (production) :

```ini
WAVE_LINK=https://pay.wave.com/m/M_XXXXXXXX/c/sn/
```

puis `docker compose up -d --build web` (variable figée au build du front).
En développement, c'est `VITE_WAVE_LINK` dans `client/.env`.

Le code concerné : `client/src/utils/wave.ts` — il ajoute `?amount=<total>` au lien
et génère le QR affiché au checkout et sur la confirmation de commande.

### 1.3 Limite de ce niveau

Le paiement fonctionne, mais **le site ne sait pas automatiquement que le client
a payé** : l'admin voit la notification dans son app Wave Business, puis passe la
commande en "Payée" manuellement. C'est le niveau 2 qui automatise cela.

---

## Niveau 2 — API Checkout Wave (confirmation automatique)

L'API Checkout permet de créer une **session de paiement** liée à chaque commande :
Wave redirige le client vers son app, encaisse, puis notifie votre serveur
(webhook) qui passe la commande en "Payée" toute seule.

### 2.1 Obtenir la clé API

1. Connectez-vous au **Wave Business Portal** : https://business.wave.com/dev-portal
2. Section **Developers** (visible uniquement pour les utilisateurs *Admin* du
   compte ; si absente, contactez le support API Wave pour l'activer).
3. **Create API key** :
   - choisissez les APIs autorisées (Checkout suffit),
   - option recommandée : activez **request signing** (vous recevez en plus un
     secret `wave_sn_AKS_...`).
4. ⚠️ La clé complète (`wave_sn_prod_...`) **n'est affichée qu'une seule fois** —
   copiez-la immédiatement. Idem pour le secret de signature.

Règles de sécurité impératives :
- La clé ne doit **jamais** apparaître côté client (React), ni dans git — uniquement
  dans le `.env` du serveur.
- En cas de fuite : créez une nouvelle clé dans le portail, déployez-la, puis
  révoquez l'ancienne.
- Bonus sécurité dans le portail : **IP whitelisting** — ajoutez l'IP fixe de votre
  VPS ; même volée, la clé sera inutilisable ailleurs.

### 2.2 Les endpoints (base : `https://api.wave.com`)

| Méthode | Endpoint | Rôle |
|---|---|---|
| POST | `/v1/checkout/sessions` | Créer une session de paiement |
| GET | `/v1/checkout/sessions/:id` | Consulter une session (statut) |
| GET | `/v1/checkout/sessions/search?client_reference=` | Retrouver la session d'une commande |
| POST | `/v1/checkout/sessions/:id/expire` | Annuler une session ouverte |
| POST | `/v1/checkout/sessions/:id/refund` | Rembourser un paiement |

Authentification : header `Authorization: Bearer wave_sn_prod_...` sur chaque requête HTTPS.

### 2.3 Création d'une session — l'appel clé

```js
// Node / axios — côté SERVEUR uniquement
const res = await axios.post(
  "https://api.wave.com/v1/checkout/sessions",
  {
    amount: "15000",                 // string, XOF sans décimales
    currency: "XOF",
    client_reference: order._id,     // ← lie la session à VOTRE commande
    success_url: "https://gayetechstore.sn/order-success",
    error_url: "https://gayetechstore.sn/checkout",
    // optionnel : seul ce numéro pourra payer (anti-arnaque)
    // restrict_payer_mobile: "+221771234567",
  },
  { headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` } }
);

// La réponse contient wave_launch_url → rediriger le client dessus :
// res.data.wave_launch_url  ex: https://pay.wave.com/c/cos-18qq25rgr100a
```

Points critiques de la doc officielle :
- `success_url` et `error_url` doivent être en **https** (donc domaine + SSL requis
  avant d'activer l'API → voir DEPLOYMENT.md).
- `wave_launch_url` doit être ouvert **dans le navigateur du client** (jamais dans
  une webview), sinon la bascule vers l'app Wave échoue.
- Une session expire au bout de **30 minutes** par défaut.
- Montants XOF : chaîne de caractères, **sans décimales** (`"15000"`, pas `15000.00`).

### 2.4 Statuts d'une session

| Champ | Valeurs | Signification |
|---|---|---|
| `checkout_status` | `open` / `complete` / `expired` | Cycle de vie de la session |
| `payment_status` | `processing` / `cancelled` / `succeeded` | État du paiement |

Une commande est payée quand `payment_status === "succeeded"`.

### 2.5 Webhook (notification de paiement)

Dans le portail développeur, configurez l'URL de webhook, par ex.
`https://gayetechstore.sn/api/payments/wave/webhook`. Wave y POSTe les événements
de paiement (réussite ou échec avec `last_payment_error`). Vérifiez la signature
du webhook avec le secret fourni par le portail avant de traiter l'événement.

Sans webhook, alternative simple : au retour du client sur `success_url`,
le serveur interroge `GET /v1/checkout/sessions/search?client_reference=<orderId>`
et vérifie `payment_status`.

### 2.6 Plan d'intégration dans GayeTech Store (quand vous aurez la clé)

Modifications à faire — environ une demi-journée de travail :

1. **`.env` serveur** : ajouter `WAVE_API_KEY=wave_sn_prod_...`
   (+ `WAVE_WEBHOOK_SECRET=...`) et les passer au conteneur `api` dans
   `docker-compose.yml`.
2. **Serveur — nouvelle route `server/src/routes/payments.ts`** :
   - `POST /api/payments/wave/session` : reçoit `orderId`, vérifie la commande,
     appelle `POST /v1/checkout/sessions` avec `client_reference: orderId`,
     renvoie `wave_launch_url` au front.
   - `POST /api/payments/wave/webhook` : vérifie la signature, retrouve la
     commande via `client_reference`, si `payment_status=succeeded` →
     `status: "PAID"`.
3. **Front — `Checkout.tsx`** : pour le paiement Wave, après création de la
   commande, appeler `/api/payments/wave/session` puis
   `window.location.href = wave_launch_url` (au lieu du QR statique).
   Garder le QR du lien marchand en secours si l'API est indisponible.
4. **Admin** : la commande passe en "Payée" automatiquement — la pastille du
   pipeline se met à jour au rechargement.

### 2.7 Erreurs fréquentes

| Code | Cause / remède |
|---|---|
| `unauthorized-wallet` | Votre compte n'a pas encore l'accès API → contacter un représentant Wave |
| `no-matching-api-key` / `api-key-revoked` | Clé mal copiée ou révoquée → régénérer dans le portail |
| `request-validation-error` | Champ invalide (montant avec décimales en XOF, URL non-https...) — lire `error_message` |
| `insufficient-funds` (webhook) | Le client n'avait pas le solde — la session reste ouverte, il peut réessayer |
| `ip-not-allowed` (403) | IP whitelisting actif et l'IP du VPS n'est pas dans la liste |
| `kyb-limits-exceeded` | Plafond du compte business atteint → contacter Wave |

### 2.8 Tester sans risque

Wave n'a pas de "mode sandbox" public : les tests se font avec de vrais petits
montants (ex. 100 FCFA) que vous pouvez rembourser via
`POST /v1/checkout/sessions/:id/refund` (le remboursement est idempotent :
rejouer l'appel renvoie simplement 200).

---

## Récapitulatif

| | Niveau 1 (actuel) | Niveau 2 (API) |
|---|---|---|
| Prérequis | Compte Wave Business | + accès API (portail dev) + domaine en https |
| Configuration | `WAVE_LINK` dans `.env` | + `WAVE_API_KEY` serveur + webhook |
| Confirmation du paiement | Manuelle (app Wave Business) | Automatique (commande → "Payée") |
| Remboursements | Manuels | Par API |
| Effort | ✅ Déjà fait | ~ une demi-journée (plan §2.6) |
