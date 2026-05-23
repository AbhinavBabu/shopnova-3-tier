# ── Stage 1: Dependency installer ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

# ── Stage 2: Lean runtime image (non-root) ───────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy only prod node_modules from builder (no npm cache bloat)
COPY --from=builder /app/node_modules ./node_modules

# Copy source with correct ownership in one layer
COPY --chown=node:node . .

# Switch to non-root user
USER node

EXPOSE 8002

CMD ["node", "src/index.js"]
