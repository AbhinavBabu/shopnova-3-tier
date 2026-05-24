#!/usr/bin/env bash
# scripts/destroy.sh — tears down all ShopNova releases from the EKS cluster
set -euo pipefail

NAMESPACE="prod"

echo "Uninstalling all ShopNova Helm releases..."
helm uninstall ingress        -n "$NAMESPACE" --ignore-not-found
helm uninstall frontend       -n "$NAMESPACE" --ignore-not-found
helm uninstall notification   -n "$NAMESPACE" --ignore-not-found
helm uninstall order          -n "$NAMESPACE" --ignore-not-found
helm uninstall product        -n "$NAMESPACE" --ignore-not-found
helm uninstall auth           -n "$NAMESPACE" --ignore-not-found
helm uninstall shopnova-config -n "$NAMESPACE" --ignore-not-found

echo "All Helm releases removed."
