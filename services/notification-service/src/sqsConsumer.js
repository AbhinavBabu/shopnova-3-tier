"use strict";

// ── AWS SQS Consumer ──────────────────────────────────────────────────────────
// Polls the SQS queue for order-placed notification events published by the
// order-service and sends a confirmation email for each one.
//
// Design notes:
//   • One reusable SQSClient per process (region: us-east-1).
//   • Polls every POLL_INTERVAL_MS (default 5 000 ms) using a simple
//     setTimeout loop so the event-loop stays free for HTTP requests.
//   • Up to MAX_MESSAGES (5) messages are processed per poll cycle.
//   • Each message is deleted from SQS *only after* processing succeeds
//     (or after a caught email error — we still delete to avoid re-delivery
//     of messages that can't be retried without a dead-letter queue).
//   • Any error — SDK, JSON parse, or email — is caught and logged.
//     The loop is NEVER allowed to crash the Node.js process.
// ─────────────────────────────────────────────────────────────────────────────

const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");

const createTransporter = require("./config/mailer");

// ── Constants ─────────────────────────────────────────────────────────────────
const REGION           = "us-east-1";
const MAX_MESSAGES     = 5;           // messages fetched per poll (1–10)
const WAIT_TIME_SEC    = 5;           // SQS long-poll wait (seconds)
const POLL_INTERVAL_MS = 5_000;       // delay between poll cycles (ms)

// ── Shared SQS client (one instance for the lifetime of the process) ──────────
const sqsClient = new SQSClient({ region: REGION });

// ─────────────────────────────────────────────────────────────────────────────
// sendEmail
// Reuses the existing Nodemailer transporter to deliver an order confirmation.
// Mirrors the HTML template in notificationController.js for consistency.
// ─────────────────────────────────────────────────────────────────────────────
const sendEmail = async (userEmail, orderId) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"ShopNova" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Order Confirmation",
    text: `Your order ${orderId} has been successfully placed.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4c6ef5;">Order Confirmation ✅</h2>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          Your order <strong style="color: #4c6ef5;">${orderId}</strong> has been
          <strong>successfully placed</strong>.
        </p>
        <p style="font-size: 14px; color: #666;">
          We'll notify you once your order is shipped. Thank you for shopping with ShopNova!
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} ShopNova. All rights reserved.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(
    `[notification-service] Email sent to ${userEmail} for order ${orderId} | messageId: ${info.messageId}`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// processMessage
// Parses one raw SQS message, sends the email, then deletes the message.
// ─────────────────────────────────────────────────────────────────────────────
const processMessage = async (message, queueUrl) => {
  let orderId   = "unknown";
  let userEmail = "unknown";

  try {
    // ── 1. Parse the message body ─────────────────────────────────────────────
    const body = JSON.parse(message.Body);
    orderId   = body.orderId   || "unknown";
    userEmail = body.userEmail || "unknown";
    const eventMessage = body.message  || "";

    // Required log line (exact format)
    console.log(`Processing SQS message for order ${orderId}`);
    console.log(
      `[notification-service] Payload — userEmail: ${userEmail}, message: "${eventMessage}"`
    );

    // ── 2. Send confirmation email ────────────────────────────────────────────
    await sendEmail(userEmail, orderId);

  } catch (err) {
    // Email delivery failure or JSON parse error — log and continue to delete
    // so the message is not redelivered indefinitely.
    console.error(
      `[notification-service] Error processing SQS message for order ${orderId}:`,
      err.message
    );
  }

  // ── 3. Delete the message from SQS (always, to prevent re-delivery) ────────
  try {
    const deleteCmd = new DeleteMessageCommand({
      QueueUrl:      queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    });
    await sqsClient.send(deleteCmd);
    console.log(
      `[notification-service] SQS message deleted for order ${orderId}`
    );
  } catch (deleteErr) {
    // Log only — the message will become visible again after its visibility
    // timeout and will be reprocessed (idempotent email is acceptable here).
    console.error(
      `[notification-service] Failed to delete SQS message for order ${orderId}:`,
      deleteErr.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// poll
// Single poll cycle: receive up to MAX_MESSAGES messages and process each one.
// ─────────────────────────────────────────────────────────────────────────────
const poll = async (queueUrl) => {
  try {
    const receiveCmd = new ReceiveMessageCommand({
      QueueUrl:            queueUrl,
      MaxNumberOfMessages: MAX_MESSAGES,
      WaitTimeSeconds:     WAIT_TIME_SEC,   // long-polling — reduces empty responses
    });

    const response = await sqsClient.send(receiveCmd);
    const messages = response.Messages || [];

    if (messages.length > 0) {
      console.log(
        `[notification-service] Received ${messages.length} SQS message(s)`
      );
      // Process all messages in the batch concurrently
      await Promise.all(messages.map((msg) => processMessage(msg, queueUrl)));
    }
  } catch (err) {
    // Network blip, credential error, etc. — log and let the loop retry.
    console.error("[notification-service] SQS poll error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// startSqsConsumer  (exported — called from index.js after the server starts)
//
// Starts an infinite polling loop.  Uses a recursive setTimeout so the loop
// waits POLL_INTERVAL_MS *after each cycle completes*, preventing tight-loop
// hammering if SQS responds immediately.
// ─────────────────────────────────────────────────────────────────────────────
const startSqsConsumer = () => {
  const queueUrl = process.env.SQS_QUEUE_URL;

  if (!queueUrl) {
    console.warn(
      "[notification-service] SQS_QUEUE_URL is not set — SQS consumer will NOT start. " +
      "Set the environment variable and restart the service to enable SQS polling."
    );
    return;
  }

  console.log(
    `[notification-service] SQS consumer started — polling queue every ${POLL_INTERVAL_MS / 1000}s`
  );
  console.log(`[notification-service] Queue URL: ${queueUrl}`);

  // Kick off the first poll immediately, then schedule subsequent ones
  const loop = async () => {
    await poll(queueUrl);
    setTimeout(loop, POLL_INTERVAL_MS);
  };

  loop();
};

module.exports = { startSqsConsumer };
