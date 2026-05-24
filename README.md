# ShopNova — EKS Deployment

> **Stack**: Amazon EKS · AWS Load Balancer Controller · Helm · Amazon SQS · MongoDB (StatefulSet)

A production-ready microservices deployment for the ShopNova e-commerce platform on AWS.

---

## Repository Structure

```
shopnova-deployment/
├── services/                    # Application source code
│   ├── auth-service/
│   ├── product-service/
│   ├── order-service/
│   ├── notification-service/
│   └── frontend-service/
│
├── helm/                        # Helm charts (one per service)
│   ├── shopnova-config/         # Shared Namespace + ConfigMap
│   ├── auth/
│   ├── product/
│   ├── order/
│   ├── notification/
│   ├── frontend/
│   └── ingress/
│
├── k8s/                         # Raw Kubernetes manifests
│   ├── storageclass.yaml        # EBS StorageClass for MongoDB
│   ├── mongo-statefulset.yaml   # MongoDB StatefulSet + headless Service
│   └── secrets.yaml             # Secret template (sanitized — fill locally)
│
├── scripts/
│   ├── deploy.sh                # One-shot deploy to EKS
│   └── destroy.sh               # Teardown all Helm releases
│
├── docs/
│   └── architecture.md          # System architecture overview
│
├── eks-cluster.yaml             # eksctl cluster definition
├── docker-compose.yml           # Local development only
├── iam-policy.json              # IAM policy for AWS Load Balancer Controller
├── .env.example                 # Environment variable reference
└── .gitignore
```

---

## Architecture

```
Internet
   │
   ▼
AWS ALB  (internet-facing)
   │
   ├── /api/auth      → auth-service:8001
   ├── /api/products  → product-service:8002
   ├── /api/orders    → order-service:8003
   └── /              → frontend-service:3000  (React SPA / nginx)

order-service ──► Amazon SQS ──► notification-service:8004
              (async, decoupled)   (internal ClusterIP, email via Gmail SMTP)
```

See [docs/architecture.md](docs/architecture.md) for full details.

---

## Prerequisites

1. An EKS cluster — create one with:
   ```bash
   eksctl create cluster -f eks-cluster.yaml
   ```
2. AWS Load Balancer Controller installed in the cluster
3. `kubectl` configured against the cluster
4. `helm` v3+

---

## Deploying

### Step 1 — Fill in secrets

Edit `k8s/secrets.yaml` locally (it is gitignored — never commit real values):

```yaml
stringData:
  AUTH_MONGO_URI: "mongodb://****/authdb"
  PRODUCT_MONGO_URI: "mongodb://****/productdb"
  ORDER_MONGO_URI: "mongodb://****/orderdb"
  JWT_SECRET: "your-jwt-secret"
  EMAIL_USER: "your@gmail.com"
  EMAIL_PASS: "your-app-password"
  SQS_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/<account>/<queue>"
```

### Step 2 — Deploy everything

```bash
bash scripts/deploy.sh
```

The script applies the StorageClass, MongoDB StatefulSet, secrets, and all Helm charts in order.

### Manual deployment

```bash
NAMESPACE=prod

# Shared prerequisites (Namespace + ConfigMap)
helm upgrade --install shopnova-config ./helm/shopnova-config \
  --namespace $NAMESPACE --create-namespace

# Kubernetes manifests
kubectl apply -f k8s/storageclass.yaml
kubectl apply -f k8s/mongo-statefulset.yaml
kubectl apply -f k8s/secrets.yaml      # fill real values first

# Services
helm upgrade --install auth         ./helm/auth         -n $NAMESPACE
helm upgrade --install product      ./helm/product      -n $NAMESPACE
helm upgrade --install order        ./helm/order        -n $NAMESPACE
helm upgrade --install notification ./helm/notification -n $NAMESPACE
helm upgrade --install frontend     ./helm/frontend     -n $NAMESPACE
helm upgrade --install ingress      ./helm/ingress      -n $NAMESPACE
```

---

## Accessing the Application

```bash
# Get the ALB hostname (takes 1-2 minutes after ingress deploy)
kubectl get ingress shopnova-alb-ingress -n prod \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## Updating a Service Image

```bash
helm upgrade order ./helm/order -n prod --set image.tag=v1.2.3
```

---

## Enabling HTTPS

1. Create an ACM certificate in your AWS account.
2. Set the ARN in `helm/ingress/values.yaml`.
3. Uncomment the HTTPS annotations in `helm/ingress/templates/ingress.yaml`.
4. `helm upgrade ingress ./helm/ingress -n prod`

---

## Teardown

```bash
bash scripts/destroy.sh
```

---

## Local Development

```bash
cp .env.example .env   # fill in values
docker compose up --build
# Open http://localhost:3000
```

---

## Port Reference

| Service              | Port |
|----------------------|------|
| auth-service         | 8001 |
| product-service      | 8002 |
| order-service        | 8003 |
| notification-service | 8004 |
| frontend (nginx)     | 3000 |
