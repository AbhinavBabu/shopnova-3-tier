# ShopNova — Simplified EKS Deployment

> **Stack**: Amazon EKS · AWS Load Balancer Controller (ALB) · Helm · Kubernetes Ingress (`networking.k8s.io/v1`)
> **No**: Gateway API · KGateway · ArgoCD · Argo Rollouts · Sealed Secrets · Istio · Service Mesh

---

## Architecture Overview

```
Internet
   │
   ▼
AWS ALB  (internet-facing, provisioned by AWS Load Balancer Controller)
   │
   ├── /api/auth      → auth-service:8001      (ClusterIP)
   ├── /api/products  → product-service:8002   (ClusterIP)
   ├── /api/orders    → order-service:8003     (ClusterIP)
   └── /              → frontend-service:3000  (ClusterIP, catch-all)
                             │
                             ▼
                         nginx (React SPA)
                         static files only

order-service  ──────────────────────────────►  notification-service:8004
               (internal K8s DNS, not via ALB)  (ClusterIP, no external exposure)
```

## Port Map

| Service              | Container Port |
|----------------------|---------------|
| auth-service         | 8001          |
| product-service      | 8002          |
| order-service        | 8003          |
| notification-service | 8004          |
| frontend (nginx)     | 3000          |

---

## Folder Structure

```
shopnova-deployment/
├── deploy.sh                      # One-shot deploy script
├── destroy.sh                     # Teardown script
└── helm/
    ├── shopnova-config/           # Shared prerequisites (Namespace, ConfigMap, Secret)
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       └── config.yaml
    ├── auth/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       └── service.yaml
    ├── product/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       └── service.yaml
    ├── order/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       └── service.yaml
    ├── notification/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       └── service.yaml
    ├── frontend/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       └── service.yaml
    └── ingress/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
            └── ingress.yaml
```

---

## Prerequisites

### 1. AWS Load Balancer Controller

The AWS Load Balancer Controller must be installed in your EKS cluster **before** deploying the ingress chart.

```bash
# Add the EKS Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install the controller (replace <CLUSTER_NAME> and <REGION>)
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=<CLUSTER_NAME> \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

> The controller requires an IAM role with the `AWSLoadBalancerControllerIAMPolicy` attached.
> See: https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html

---

## Deploying ShopNova

### Option A — One-shot script

```bash
# Export your real secrets as environment variables first
export AUTH_MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/authdb"
export PRODUCT_MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/productdb"
export ORDER_MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/orderdb"
export JWT_SECRET="your-super-secret-jwt-key"
export EMAIL_USER="noreply@shopnova.com"
export EMAIL_PASS="your-smtp-password"

bash deploy.sh
```

### Option B — Install charts individually

```bash
NAMESPACE=prod

# 1. Shared config, ConfigMaps, and Secrets
helm upgrade --install shopnova-config ./helm/shopnova-config \
  --namespace $NAMESPACE --create-namespace \
  --set secrets.AUTH_MONGO_URI="..." \
  --set secrets.PRODUCT_MONGO_URI="..." \
  --set secrets.ORDER_MONGO_URI="..." \
  --set secrets.JWT_SECRET="..." \
  --set secrets.EMAIL_USER="..." \
  --set secrets.EMAIL_PASS="..."

# 2. Backend services
helm upgrade --install auth        ./helm/auth        -n $NAMESPACE
helm upgrade --install product     ./helm/product     -n $NAMESPACE
helm upgrade --install order       ./helm/order       -n $NAMESPACE
helm upgrade --install notification ./helm/notification -n $NAMESPACE

# 3. Frontend
helm upgrade --install frontend    ./helm/frontend    -n $NAMESPACE

# 4. ALB Ingress (deploy last — backend services must exist first)
helm upgrade --install ingress     ./helm/ingress     -n $NAMESPACE
```

---

## Accessing the Application

After the ingress chart is deployed, the ALB typically takes **1–2 minutes** to provision.

```bash
# Get the ALB hostname
kubectl get ingress shopnova-alb-ingress -n prod \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Open the hostname in your browser — it routes to the React frontend.

---

## Updating an Image

To roll out a new image tag for any service:

```bash
helm upgrade auth ./helm/auth -n prod \
  --set image.tag=auth-service-v1.2.3
```

---

## Enabling HTTPS (Production)

1. Create an ACM certificate in your AWS account.
2. Edit `helm/ingress/values.yaml`:
   ```yaml
   # certificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/xxxx"
   ```
   Uncomment the line and set your ARN.
3. In `helm/ingress/templates/ingress.yaml`, uncomment the HTTPS listen-ports annotation.
4. `helm upgrade ingress ./helm/ingress -n prod`

---

## Tearing Down

```bash
bash destroy.sh
```

---

## What Was Removed

| Removed Component     | Reason |
|-----------------------|--------|
| Gateway API / KGateway | Replaced by standard `networking.k8s.io/v1` Ingress + AWS ALB |
| ArgoCD + Argo Rollouts | Replaced by simple `kubectl` / `helm upgrade` deploys |
| Sealed Secrets        | Replaced by Helm `--set secrets.*` at deploy time |
| Blue-green Rollouts   | Standard Kubernetes rolling update strategy |
| Network Policies      | Can be re-added independently if needed |
| HPA                   | Can be re-added independently if needed |
