# ShopNova — Architecture

## System Overview

ShopNova is a microservices e-commerce platform deployed on Amazon EKS.

```
Internet
   │
   ▼
AWS ALB  (internet-facing, provisioned by AWS Load Balancer Controller)
   │
   ├── /api/auth      → auth-service:8001        (ClusterIP)
   ├── /api/products  → product-service:8002     (ClusterIP)
   ├── /api/orders    → order-service:8003       (ClusterIP)
   └── /              → frontend-service:3000    (ClusterIP, catch-all)
                             │
                             ▼
                         nginx (React SPA)

order-service  ──► Amazon SQS ──► notification-service:8004
               (async, decoupled)  (ClusterIP, internal only)
```

## Services

| Service              | Port | Description |
|----------------------|------|-------------|
| auth-service         | 8001 | JWT authentication |
| product-service      | 8002 | Product catalogue |
| order-service        | 8003 | Order management, SQS producer |
| notification-service | 8004 | Email notifications, SQS consumer |
| frontend-service     | 3000 | React SPA served by nginx |

## Infrastructure

| Component | Tool |
|-----------|------|
| Container orchestration | Amazon EKS |
| Ingress / Load balancer | AWS Load Balancer Controller |
| Package management | Helm |
| Database | MongoDB (StatefulSet, EBS-backed) |
| Async messaging | Amazon SQS |
| CI / Image registry | Docker Hub |

## Notification Flow

1. User places an order via the frontend.
2. `order-service` saves the order to MongoDB, responds `201`, then publishes a message to SQS.
3. `notification-service` polls SQS every 5 seconds, consumes the message, sends a confirmation email via Nodemailer (Gmail SMTP), and deletes the message.

## Secrets Management

Secrets (`shopnova-secrets`) are stored as a standalone Kubernetes Secret manifest in `k8s/secrets.yaml`. This file is **gitignored** — fill in real values locally and apply with:

```bash
kubectl apply -f k8s/secrets.yaml
```

A sanitized template (empty values) is committed to the repository so the structure is documented without exposing credentials.
