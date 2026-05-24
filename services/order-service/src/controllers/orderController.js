const Order = require("../models/Order");

// ── AWS SQS Client ────────────────────────────────────────────────────────────
// Using the modular v3 SDK (@aws-sdk/client-sqs).
// Region is hard-coded to us-east-1 as required; credentials are picked up
// automatically from the environment (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
// / AWS_SESSION_TOKEN) or from the EKS pod IAM role — no explicit creds needed.
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({ region: "us-east-1" });

// ─────────────────────────────────────────────────────────────────────────────
// [REPLACED] Old HTTP notification helper — kept for reference / rollback.
// The order-service used to call the internal notification-service REST API
// directly over HTTP. That logic is now replaced by the SQS publish below.
//
// const http = require("http");
//
// /**
//  * Fire-and-forget call to the notification service.
//  * Any failure is logged but never throws — the order has already
//  * been saved and the client response already sent.
//  */
// const notifyUser = (userEmail, orderId) => {
//   const payload = JSON.stringify({ userEmail, orderId });
//
//   const options = {
//     hostname: process.env.NOTIFICATION_SERVICE_HOST || "notification-service-active",
//     port: process.env.NOTIFICATION_SERVICE_PORT || 8004,
//     path: "/notify",
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Content-Length": Buffer.byteLength(payload),
//     },
//   };
//
//   const req = http.request(options, (res) => {
//     console.log(
//       `[order-service] Notification service responded with status ${res.statusCode} for order ${orderId}`
//     );
//   });
//
//   req.on("error", (err) => {
//     // Log only — order is safe, notification is best-effort
//     console.error(
//       `[order-service] Could not reach notification-service for order ${orderId}:`,
//       err.message
//     );
//   });
//
//   req.write(payload);
//   req.end();
// };
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Publish an order-placed event to Amazon SQS.
 *
 * This is fire-and-forget: the order has already been saved and the HTTP
 * response already sent to the client before this runs.  Any SQS error is
 * caught and logged — it must NEVER break the order creation flow.
 *
 * Message body shape:
 *   { orderId, userEmail, message: "Order placed successfully" }
 *
 * @param {string} userEmail  - Buyer's email address.
 * @param {string} orderId    - MongoDB _id of the newly created order.
 */
const sendSqsNotification = async (userEmail, orderId) => {
  try {
    // SQS_QUEUE_URL must be set in the environment (injected via K8s secret / .env).
    // We intentionally do NOT guard-return here — the SendMessageCommand runs
    // unconditionally so that SQS is always attempted after every order creation.
    // If the URL is missing or wrong the SDK will throw and we catch it below.
    const queueUrl = process.env.SQS_QUEUE_URL;

    // Build the message payload
    const messageBody = JSON.stringify({
      orderId,
      userEmail,
      message: "Order placed successfully",
    });

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    });

    const result = await sqsClient.send(command);

    // Required log line — exact format: "Message sent to SQS for order <orderId>"
    console.log(`Message sent to SQS for order ${orderId}`);
    console.log(`[order-service] SQS MessageId: ${result.MessageId}`);
  } catch (err) {
    // Log only — do NOT re-throw.  Order creation has already succeeded.
    console.error(
      `[order-service] Failed to send SQS notification for order ${orderId}:`,
      err.message
    );
  }
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

    // Respond immediately — don't wait for notification delivery
    res.status(201).json(order);

    // Fire SQS notification asynchronously after response is sent.
    // Called unconditionally — SQS always executes regardless of whether
    // userEmail is present.  Any failure is caught inside sendSqsNotification.
    // [REPLACED] Previously called notifyUser(userEmail, order._id.toString())
    //            which made a direct HTTP POST to the notification-service API.
    //            Now ONLY SQS is used for notification delivery.
    sendSqsNotification(userEmail, order._id.toString());
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
