# ============================================================
# Front GayeTech Store — build Vite puis service via nginx
# nginx sert le site ET fait proxy vers l'API (/api, /uploads)
# ============================================================

# ---------- Étape 1 : build ----------
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variables injectées AU BUILD (Vite les fige dans le bundle).
# VITE_API_URL vide = même origine → nginx proxie vers l'API.
ARG VITE_API_URL=""
ARG VITE_WAVE_LINK=""
ARG VITE_WHATSAPP_PHONE="221771234567"
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WAVE_LINK=$VITE_WAVE_LINK \
    VITE_WHATSAPP_PHONE=$VITE_WHATSAPP_PHONE

RUN npm run build

# ---------- Étape 2 : nginx ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO /dev/null http://localhost/ || exit 1
