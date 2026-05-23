const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.AUTH_MONGO_URI);
    console.log("[auth-service] MongoDB connected");
  } catch (error) {
    console.error("[auth-service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
