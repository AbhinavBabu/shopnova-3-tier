const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.PRODUCT_MONGO_URI);
    console.log("[product-service] MongoDB connected");
  } catch (error) {
    console.error("[product-service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
