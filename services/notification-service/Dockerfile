# ── Stage 1: Dependency installer ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

# ── Stage 2: Lean runtime image (non-root) ───────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 8004

CMD ["node", "src/index.js"]
