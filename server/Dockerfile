v# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- production stage ----------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# deps prod uniquement
COPY package*.json ./
RUN npm ci --omit=dev

# code compilé + fichiers nécessaires
COPY --from=build /app/dist ./dist


EXPOSE 4000
CMD ["node", "dist/index.js"]
