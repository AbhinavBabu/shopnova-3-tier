const mongoose = require("mongoose");

const connectDB = async () => {
  // Priority: ORDER_MONGO_URI (full URI) → MONGO_HOST (split-EC2) → localhost (bare dev)
  const uri =
    process.env.ORDER_MONGO_URI ||
    `mongodb://${process.env.MONGO_HOST || "localhost"}:27017/orderdb`;

  try {
    await mongoose.connect(uri);
    console.log("[order-service] MongoDB connected");
  } catch (error) {
    console.error("[order-service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
