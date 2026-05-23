require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 8001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "authservice" }));

app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT}`);
});
