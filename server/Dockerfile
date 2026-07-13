# ============================================================
# API GayeTech Store — build TypeScript puis image de prod légère
# ============================================================

# ---------- Étape 1 : build ----------
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Étape 2 : production ----------
FROM node:20-slim AS prod
WORKDIR /app
ENV NODE_ENV=production

# Dépendances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Code compilé
COPY --from=build /app/dist ./dist

# Dossier des images produits (monté en volume par docker compose)
RUN mkdir -p /app/uploads

EXPOSE 4000

# Vérification de santé : l'API répond sur /health
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
