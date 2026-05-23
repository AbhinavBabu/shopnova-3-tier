#!/usr/bin/env bash
# ── ShopNova EKS Deployment Script ──────────────────────────────────────────
# Deploys all ShopNova Helm charts to an existing EKS cluster.
# Prerequisites:
#   1. kubectl configured against your EKS cluster
#   2. AWS Load Balancer Controller installed in the cluster
#   3. Replace the REPLACE_ME secrets below with real values (or use AWS Secrets Manager)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

HELM_DIR="$(cd "$(dirname "$0")/helm" && pwd)"
NAMESPACE="prod"

echo "==> [1/8] Deploying shared ConfigMap, nginx config, and Secrets..."
helm upgrade --install shopnova-config "$HELM_DIR/shopnova-config" \
  --namespace "$NAMESPACE" \
  --create-namespace \
  --set secrets.AUTH_MONGO_URI="${AUTH_MONGO_URI:-REPLACE_ME}" \
  --set secrets.PRODUCT_MONGO_URI="${PRODUCT_MONGO_URI:-REPLACE_ME}" \
  --set secrets.ORDER_MONGO_URI="${ORDER_MONGO_URI:-REPLACE_ME}" \
  --set secrets.JWT_SECRET="${JWT_SECRET:-REPLACE_ME}" \
  --set secrets.EMAIL_USER="${EMAIL_USER:-REPLACE_ME}" \
  --set secrets.EMAIL_PASS="${EMAIL_PASS:-REPLACE_ME}" \
  --wait

echo "==> [2/8] Deploying auth-service..."
helm upgrade --install auth "$HELM_DIR/auth" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [3/8] Deploying product-service..."
helm upgrade --install product "$HELM_DIR/product" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [4/8] Deploying order-service..."
helm upgrade --install order "$HELM_DIR/order" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [5/8] Deploying notification-service..."
helm upgrade --install notification "$HELM_DIR/notification" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [6/8] Deploying frontend..."
helm upgrade --install frontend "$HELM_DIR/frontend" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [7/8] Deploying ALB Ingress..."
helm upgrade --install ingress "$HELM_DIR/ingress" \
  --namespace "$NAMESPACE" \
  --wait

echo ""
echo "==> [8/8] All charts deployed successfully!"
echo ""
echo "Fetching ALB address (may take 1-2 minutes for ALB to provision)..."
kubectl get ingress shopnova-alb-ingress -n "$NAMESPACE" \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' && echo ""
