#!/usr/bin/env bash
# scripts/deploy.sh — ShopNova EKS deployment
#
# Prerequisites:
#   1. kubectl configured against your target EKS cluster
#   2. AWS Load Balancer Controller installed in the cluster
#   3. Real secret values filled in k8s/secrets.yaml (never commit filled values)
#
# Usage:
#   bash scripts/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HELM_DIR="$REPO_ROOT/helm"
K8S_DIR="$REPO_ROOT/k8s"
NAMESPACE="prod"

echo "==> [1/9] Creating namespace and applying shared ConfigMap..."
helm upgrade --install shopnova-config "$HELM_DIR/shopnova-config" \
  --namespace "$NAMESPACE" \
  --create-namespace \
  --wait

echo "==> [2/9] Applying StorageClass and MongoDB StatefulSet..."
kubectl apply -f "$K8S_DIR/storageclass.yaml"
kubectl apply -f "$K8S_DIR/mongo-statefulset.yaml"

echo "==> [3/9] Applying secrets (ensure k8s/secrets.yaml has real values)..."
kubectl apply -f "$K8S_DIR/secrets.yaml"

echo "==> [4/9] Deploying auth-service..."
helm upgrade --install auth "$HELM_DIR/auth" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [5/9] Deploying product-service..."
helm upgrade --install product "$HELM_DIR/product" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [6/9] Deploying order-service..."
helm upgrade --install order "$HELM_DIR/order" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [7/9] Deploying notification-service..."
helm upgrade --install notification "$HELM_DIR/notification" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> [8/9] Deploying frontend..."
helm upgrade --install frontend "$HELM_DIR/frontend" \
  --namespace "$NAMESPACE" \
  --wait

echo "==> Deploying ALB Ingress..."
helm upgrade --install ingress "$HELM_DIR/ingress" \
  --namespace "$NAMESPACE" \
  --wait

echo ""
echo "==> [9/9] All resources deployed successfully!"
echo ""
echo "Fetching ALB address (may take 1-2 minutes to provision)..."
kubectl get ingress shopnova-alb-ingress -n "$NAMESPACE" \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' && echo ""
