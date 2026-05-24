require("dotenv").config();
const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");
const { startSqsConsumer } = require("./sqsConsumer");

const app = express();
const PORT = process.env.PORT || 8004;

// Middleware
app.use(cors());
app.use(express.json());

// Routes — existing HTTP endpoint kept intact
app.use("/notify", notificationRoutes);

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "notificationservice" })
);

app.listen(PORT, () => {
  console.log(`[notification-service] Running on port ${PORT}`);
  console.log(
    `[notification-service] Email user: ${process.env.EMAIL_USER || "NOT SET — emails will fail gracefully"}`
  );

  // Start SQS polling loop — runs concurrently with the HTTP server.
  // The consumer polls for order-placed events published by the order-service
  // and sends confirmation emails for each one.
  startSqsConsumer();
});
