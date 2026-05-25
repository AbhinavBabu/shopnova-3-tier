FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# ── Build-time variables for the React SPA ───────────────────────────────────
# Pass --build-arg VITE_AUTH_SERVICE_URL=http://... when building for
# environments where the browser needs to call backends directly.
# Leave empty ("") to use relative URLs — nginx proxy_pass handles routing.
# This is the recommended default for both local Compose and ALB deployments.
ARG VITE_AUTH_SERVICE_URL=""
ARG VITE_PRODUCT_SERVICE_URL=""
ARG VITE_ORDER_SERVICE_URL=""
ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL \
    VITE_PRODUCT_SERVICE_URL=$VITE_PRODUCT_SERVICE_URL \
    VITE_ORDER_SERVICE_URL=$VITE_ORDER_SERVICE_URL

RUN npm run build

# ── Production: serve static files with nginx (non-root) ─────────────────────
FROM nginxinc/nginx-unprivileged:alpine

# Install gettext (provides envsubst) for runtime nginx config templating.
USER root
RUN apk add --no-cache gettext
USER nginx

# Copy built React bundle
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx.conf as a template — envsubst renders it at container start.
# The ${VAR} placeholders in the file are backend routing targets.
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.template

EXPOSE 3000

# At startup:
#   1. envsubst substitutes ONLY our 6 backend routing vars into the template.
#      The explicit variable list prevents envsubst from touching nginx's own
#      variables like $uri, $host, $remote_addr, $proxy_add_x_forwarded_for.
#   2. The rendered config is written to default.conf (nginx picks it up).
#   3. nginx starts in foreground mode.
CMD ["/bin/sh", "-c", \
  "envsubst '${AUTH_SERVICE_HOST} ${AUTH_SERVICE_PORT} ${PRODUCT_SERVICE_HOST} ${PRODUCT_SERVICE_PORT} ${ORDER_SERVICE_HOST} ${ORDER_SERVICE_PORT}' \
   < /etc/nginx/conf.d/nginx.conf.template \
   > /etc/nginx/conf.d/default.conf \
   && exec nginx -g 'daemon off;'"]
