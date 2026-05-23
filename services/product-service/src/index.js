require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const seedProducts = require("./seed/products");

const app = express();
const PORT = process.env.PORT || 8002;

// Connect to MongoDB then seed
connectDB().then(seedProducts);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "product-service" }));

app.listen(PORT, () => {
  console.log(`[product-service] Running on port ${PORT}`);
});
