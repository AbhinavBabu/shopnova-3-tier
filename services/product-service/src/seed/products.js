const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Elite Sound Wireless Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 40-hour battery life, and crystal clear studio sound.",
    price: 349.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
    stock: 50,
    rating: 4.9,
  },
  {
    name: "Tactile Pro RGB Keyboard",
    description: "Aircraft-grade aluminum frame with custom mechanical switches and per-key RGB lighting customization.",
    price: 179.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop",
    stock: 75,
    rating: 4.8,
  },
  {
    name: "Panorama 4K Ultrawide Monitor",
    description: "Vivid 38-inch curved display with HDR600 support and 100% sRGB for professional color accuracy.",
    price: 899.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=1000&auto=format&fit=crop",
    stock: 30,
    rating: 4.7,
  },
  {
    name: "Executive Ergonomic Chair",
    description: "Full-grain leather aesthetic with advanced lumbar support and synchronized tilt mechanism for elite comfort.",
    price: 499.99,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1000&auto=format&fit=crop",
    stock: 20,
    rating: 4.6,
  },
  {
    name: "Vantage Smart Sport Watch",
    description: "Advanced health tracking with built-in GPS, heart rate variability monitoring, and 14-day battery life.",
    price: 129.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
    stock: 120,
    rating: 4.4,
  },
  {
    name: "Carbon Fiber Studio Tripod",
    description: "Ultra-lightweight carbon fiber tripod with 360-degree ball head for professional photography.",
    price: 219.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=1000&auto=format&fit=crop",
    stock: 60,
    rating: 4.5,
  },
  {
    name: "Blade Pro Gaming Laptop",
    description: "The ultimate portable gaming machine with an RTX 4080, i9 processor, and OLED 240Hz display.",
    price: 2499.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop",
    stock: 15,
    rating: 4.9,
  },
  {
    name: "Barista Edition Espresso Machine",
    description: "Professional-grade espresso extraction with built-in conical burr grinder and manual steam wand.",
    price: 549.99,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=1000&auto=format&fit=crop",
    stock: 45,
    rating: 4.8,
  },
  {
    name: "Sonic Boom Portable Speaker",
    description: "IPX7 waterproof speaker with dual passive radiators for deep bass and 24-hour non-stop playtime.",
    price: 99.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop",
    stock: 90,
    rating: 4.6,
  },
  {
    name: "Classic Minimalist Wallet",
    description: "Hand-stitched Italian leather slim wallet with integrated card-ejection mechanism.",
    price: 64.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
    stock: 150,
    rating: 4.7,
  },
  {
    name: "Titanium Hydration Flask",
    description: "Vacuum-sealed titanium flask designed for the extreme outdoors. Lightweight and virtually indestructible.",
    price: 59.99,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1559832263-6cfc79f82d1c?q=80&w=1000&auto=format&fit=crop",
    stock: 200,
    rating: 4.5,
  },
  {
    name: "Velvet Accents Modern Sofa",
    description: "Three-seater velvet sofa with solid oak legs, adding a touch of timeless elegance to any living room.",
    price: 1299.99,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop",
    stock: 10,
    rating: 4.7,
  }
];

const seedProducts = async () => {
  try {
    await Product.deleteMany({});
    console.log("[product-service] Cleared existing products for fresh seed");

    await Product.insertMany(sampleProducts);
    console.log(`[product-service] Successfully seeded ${sampleProducts.length} professional products`);
  } catch (error) {
    console.error("[product-service] Seed error:", error.message);
  }
};

module.exports = seedProducts;
