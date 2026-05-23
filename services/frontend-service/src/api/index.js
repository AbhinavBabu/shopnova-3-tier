import axios from "axios";

// In Kubernetes:    VITE_* vars are undefined → AUTH_URL = "" → relative URLs
//                   e.g. baseURL = "/api/auth" → browser hits kgateway → routes to auth-service
// In Docker Compose: same relative URLs, nginx proxy_pass handles routing to backends
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "";
const PRODUCT_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || "";
const ORDER_URL = import.meta.env.VITE_ORDER_SERVICE_URL || "";

// ─────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────
export const authApi = axios.create({ baseURL: `${AUTH_URL}/api/auth` });

export const registerUser = (data) => authApi.post("/register", data);
export const loginUser = (data) => authApi.post("/login", data);
export const getMe = (token) =>
  authApi.get("/me", { headers: { Authorization: `Bearer ${token}` } });

// ─────────────────────────────────────────
// Product API
// ─────────────────────────────────────────
export const productApi = axios.create({ baseURL: `${PRODUCT_URL}/api/products` });

export const getProducts = (params) => productApi.get("/", { params });
export const getProduct = (id) => productApi.get(`/${id}`);

// ─────────────────────────────────────────
// Order API
// ─────────────────────────────────────────
export const orderApi = axios.create({ baseURL: `${ORDER_URL}/api/orders` });

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createOrder = (data, token) => orderApi.post("/", data, authHeader(token));
export const getMyOrders = (token) => orderApi.get("/my", authHeader(token));
