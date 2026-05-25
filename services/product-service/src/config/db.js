const mongoose = require("mongoose");

const connectDB = async () => {
  // Priority: PRODUCT_MONGO_URI (full URI) → MONGO_HOST (split-EC2) → localhost (bare dev)
  const uri =
    process.env.PRODUCT_MONGO_URI ||
    `mongodb://${process.env.MONGO_HOST || "localhost"}:27017/productdb`;

  try {
    await mongoose.connect(uri);
    console.log("[product-service] MongoDB connected");
  } catch (error) {
    console.error("[product-service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
