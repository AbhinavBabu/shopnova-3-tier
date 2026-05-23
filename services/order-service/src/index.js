require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 8003;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "order-service" }));

app.listen(PORT, () => {
  console.log(`[order-service] Running on port ${PORT}`);
});
