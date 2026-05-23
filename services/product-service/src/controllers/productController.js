const Product = require("../models/Product");

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {};
    if (category) query.category = category;

    let products = Product.find(query);
    if (sort === "price_asc") products = products.sort({ price: 1 });
    if (sort === "price_desc") products = products.sort({ price: -1 });
    if (sort === "rating") products = products.sort({ rating: -1 });

    const result = await products;
    res.json(result);
  } catch (error) {
    console.error("[getAllProducts]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("[getProductById]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("[createProduct]", error.message);
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("[updateProduct]", error.message);
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("[deleteProduct]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
