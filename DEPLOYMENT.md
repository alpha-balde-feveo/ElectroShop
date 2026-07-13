# 🚀 GayeTech Store — Guide de déploiement sur VPS

Ce document décrit tout le processus de conteneurisation et de déploiement du site en production, pour pouvoir le refaire ou le dépanner à tout moment.

---

## 1. Architecture

Trois conteneurs orchestrés par Docker Compose. **Un seul port est exposé au monde : le 80** (nginx). MongoDB et l'API ne sont joignables que depuis le réseau interne Docker.

```
                        Internet
                           │
                     ┌─────▼─────┐  port 80
                     │    web    │  nginx : sert le site (React buildé)
                     │  (nginx)  │  + proxy /api et /uploads → api
                     └─────┬─────┘
                           │ réseau interne docker
                     ┌─────▼─────┐
                     │    api    │  Node/Express (TypeScript compilé)
                     │ (node:20) │  volume : uploads_data (images produits)
                     └─────┬─────┘
                           │
                     ┌─────▼─────┐
                     │   mongo   │  MongoDB 7
                     │           │  volume : mongo_data (la base)
                     └───────────┘
```

Pourquoi ce montage : le front appelle l'API **sur la même origine** (`/api/...`), donc pas de problème CORS, pas d'URL d'API à configurer côté navigateur, et un seul domaine à gérer.

## 2. Les fichiers de conteneurisation

| Fichier | Rôle |
|---|---|
| `server/Dockerfile` | Build en 2 étapes : compile le TypeScript, puis image finale légère (deps de prod uniquement) avec healthcheck sur `/health` |
| `server/.dockerignore` | Exclut `node_modules`, `.env`, `uploads` du build |
| `client/Dockerfile` | Étape 1 : `npm run build` (Vite) avec les variables `VITE_*` figées au build. Étape 2 : nginx qui sert le résultat |
| `client/nginx.conf` | SPA (toutes les routes → index.html), proxy `/api` et `/uploads` vers l'API, gzip, cache des assets |
| `client/.dockerignore` | Exclut notamment `.env` local (sinon `VITE_API_URL=localhost` serait figé dans le build !) |
| `docker-compose.yml` | Production : les 3 services, volumes, healthchecks, `restart: unless-stopped` |
| `docker-compose.dev.yml` | Développement local (Mongo seul ou API en watch) — inchangé |
| `.env.example` | Modèle des variables de production à copier en `.env` |

⚠️ **Important** : les variables `VITE_*` sont **figées au moment du build** de l'image web. Si vous changez `WAVE_LINK` ou `WHATSAPP_PHONE`, il faut reconstruire : `docker compose up -d --build web`.

## 3. Test en local (avant le VPS)

```bash
cd ~/portfolio/ElectroShop
cp .env.example .env
# Éditez .env : JWT_SECRET (openssl rand -hex 32), ADMIN_PASSWORD, etc.

docker compose up -d --build
docker compose ps            # les 3 services doivent être "healthy"/"running"

# Produits de démonstration (une seule fois)
docker compose exec api node dist/seed/seedProducts.js
```

Ouvrez http://localhost — le site complet doit fonctionner (boutique, commande, admin sur /admin).

Arrêter : `docker compose down` (les données sont conservées dans les volumes).

## 4. Déploiement sur le VPS

### 4.1 Prérequis VPS
- Ubuntu 22.04+ (ou Debian 12), 1 Go de RAM minimum (2 Go conseillés)
- Un nom de domaine pointant vers l'IP du VPS (enregistrement DNS de type A)

### 4.2 Installer Docker

```bash
ssh root@IP_DU_VPS

# Installation officielle Docker + Compose
curl -fsSL https://get.docker.com | sh

# Pare-feu : n'ouvrir que SSH, HTTP, HTTPS
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

### 4.3 Récupérer le projet et configurer

```bash
git clone https://github.com/alpha-balde-feveo/ElectroShop.git
cd ElectroShop

cp .env.example .env
nano .env
```

Remplissez le `.env` :

```ini
JWT_SECRET=<résultat de : openssl rand -hex 32>
ADMIN_EMAIL=admin@gayetechstore.sn
ADMIN_PASSWORD=<mot de passe FORT — c'est la clé de votre boutique>
CORS_ORIGIN=https://gayetechstore.sn
WAVE_LINK=https://pay.wave.com/m/VOTRE_ID/c/sn/
WHATSAPP_PHONE=221771234567
```

### 4.4 Lancer

```bash
docker compose up -d --build     # premier build : 3-5 minutes
docker compose ps                # vérifier que tout est "healthy"
docker compose logs -f api       # doit afficher "✅ MongoDB connected" et "Seed admin created"

# Produits de démo (optionnel — sinon créez vos produits via /admin)
docker compose exec api node dist/seed/seedProducts.js
```

Le site est en ligne sur `http://IP_DU_VPS` (puis sur votre domaine dès que le DNS a propagé).

### 4.5 HTTPS (fortement recommandé)

**Option A — Caddy (automatique, recommandé).** Ajoutez ce service dans `docker-compose.yml`, changez le port de `web` en `"8080:80"`, puis `docker compose up -d` :

```yaml
  caddy:
    image: caddy:2-alpine
    container_name: gayetech-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    command: caddy reverse-proxy --from gayetechstore.sn --to web:80
    volumes:
      - caddy_data:/data
# et dans volumes:   caddy_data:
```

Caddy obtient et renouvelle le certificat SSL tout seul (Let's Encrypt). Zéro maintenance.

**Option B — Cloudflare.** Mettez le domaine derrière Cloudflare (gratuit), activez le proxy (nuage orange) : SSL géré par Cloudflare, le VPS reste en HTTP sur le port 80.

Dans les deux cas, mettez à jour `CORS_ORIGIN=https://votredomaine` dans `.env` puis `docker compose up -d api`.

## 5. Exploitation au quotidien

### Mettre à jour le site après des modifications

```bash
cd ~/ElectroShop
git pull
docker compose up -d --build     # ne reconstruit que ce qui a changé
```

### Voir les logs

```bash
docker compose logs -f           # tout
docker compose logs -f api       # API seulement
docker compose logs --tail 100 web
```

### Redémarrer / arrêter

```bash
docker compose restart api       # redémarre un service
docker compose down              # arrête tout (données conservées)
docker compose down -v           # ⚠️ DÉTRUIT AUSSI LA BASE ET LES IMAGES
```

### Sauvegarder la base (à mettre en cron)

```bash
# Sauvegarde
docker compose exec mongo mongodump --archive --db electroshop > backup-$(date +%F).dump

# Restauration
docker compose exec -T mongo mongorestore --archive --db electroshop < backup-2026-07-13.dump

# Cron quotidien à 3h du matin :  crontab -e
0 3 * * * cd /root/ElectroShop && docker compose exec -T mongo mongodump --archive --db electroshop > /root/backups/gayetech-$(date +\%F).dump
```

Les images produits sont dans le volume `uploads_data` :
`docker run --rm -v electroshop_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz /data`

## 6. Dépannage

| Symptôme | Diagnostic / remède |
|---|---|
| Site inaccessible | `docker compose ps` — un service down ? `docker compose logs <service>` |
| "MongoDB connect failed" en boucle | Mongo pas encore healthy : attendre, ou `docker compose restart mongo` |
| Login admin refuse | Vérifier `ADMIN_EMAIL`/`ADMIN_PASSWORD` dans `.env`, puis `docker compose up -d api`. Le seed ne modifie PAS un admin existant : pour changer le mot de passe, supprimez l'admin en base ou recréez la base |
| Images produits cassées | Elles vivent dans le volume `uploads_data` — jamais dans l'image Docker. Vérifier `docker volume ls` |
| Changement de `WAVE_LINK`/`WHATSAPP_PHONE` sans effet | Variables figées au build → `docker compose up -d --build web` |
| Disque plein | `docker system prune -af` supprime les vieilles images (ne touche pas aux volumes) |
| Erreur 413 à l'upload d'image | Limite nginx `client_max_body_size 15m` dans `client/nginx.conf` |

## 7. Checklist de mise en production

- [ ] `.env` rempli avec un `JWT_SECRET` aléatoire et un `ADMIN_PASSWORD` fort
- [ ] `CORS_ORIGIN` = le vrai domaine en https
- [ ] HTTPS actif (Caddy ou Cloudflare)
- [ ] `ufw` activé (seuls 22, 80, 443 ouverts)
- [ ] Sauvegarde Mongo planifiée en cron
- [ ] `WAVE_LINK` = vrai lien Wave Business
- [ ] `WHATSAPP_PHONE` = vrai numéro de la boutique
- [ ] Test complet : commande client + facture + admin
