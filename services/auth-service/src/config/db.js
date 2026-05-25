const mongoose = require("mongoose");

const connectDB = async () => {
  // Priority: AUTH_MONGO_URI (full URI) → MONGO_HOST (split-EC2) → localhost (bare dev)
  const uri =
    process.env.AUTH_MONGO_URI ||
    `mongodb://${process.env.MONGO_HOST || "localhost"}:27017/authdb`;

  try {
    await mongoose.connect(uri);
    console.log("[auth-service] MongoDB connected");
  } catch (error) {
    console.error("[auth-service] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
