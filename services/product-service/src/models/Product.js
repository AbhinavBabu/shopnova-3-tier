const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/400x300?text=Product",
    },
    stock: {
      type: Number,
      default: 100,
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
