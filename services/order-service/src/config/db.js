const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ORDER_MONGO_URI);
    console.log("[order-service] MongoDB connected");
  } catch (error) {
    console.error("[order-service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
