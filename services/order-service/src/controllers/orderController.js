const http = require("http");
const Order = require("../models/Order");

/**
 * Fire-and-forget call to the notification service.
 * Any failure is logged but never throws — the order has already
 * been saved and the client response already sent.
 */
const notifyUser = (userEmail, orderId) => {
  const payload = JSON.stringify({ userEmail, orderId });

  const options = {
    hostname: process.env.NOTIFICATION_SERVICE_HOST || "notification-service-active",
    port: process.env.NOTIFICATION_SERVICE_PORT || 8004,
    path: "/notify",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const req = http.request(options, (res) => {
    console.log(
      `[order-service] Notification service responded with status ${res.statusCode} for order ${orderId}`
    );
  });

  req.on("error", (err) => {
    // Log only — order is safe, notification is best-effort
    console.error(
      `[order-service] Could not reach notification-service for order ${orderId}:`,
      err.message
    );
  });

  req.write(payload);
  req.end();
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, userEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    const order = await Order.create({
      userId: req.userId,
      userName: req.userName,
      items,
      totalAmount,
      shippingAddress: shippingAddress || "Default Address",
    });

    // Respond immediately — don't wait for email delivery
    res.status(201).json(order);

    // Fire notification asynchronously after response is sent
    if (userEmail) {
      notifyUser(userEmail, order._id.toString());
    } else {
      console.warn(
        `[order-service] Order ${order._id} created without userEmail — notification skipped`
      );
    }
  } catch (error) {
    console.error("[createOrder]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("[getMyOrders]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    console.error("[getOrderById]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
