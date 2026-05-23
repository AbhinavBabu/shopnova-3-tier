FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --chown=node:node . .

USER node

EXPOSE 8001

CMD ["node", "src/index.js"]
