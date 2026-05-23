FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# No VITE_* build args needed.
# api/index.js falls back to "" (empty string) → relative URLs like /api/auth
# In Docker Compose: nginx.conf proxy_pass handles routing
# In Kubernetes:     kgateway HTTPRoutes handle routing
RUN npm run build

# Production: serve static files with nginx (non-root)
FROM nginxinc/nginx-unprivileged:alpine

# Copy built React bundle
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
