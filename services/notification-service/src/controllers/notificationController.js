const createTransporter = require("../config/mailer");

/**
 * POST /notify
 * Body: { userEmail: string, orderId: string }
 *
 * Sends an order confirmation email.
 * If email delivery fails (bad credentials, network issue, etc.)
 * the error is logged but we still return 200 so order-service
 * is never blocked by notification failures.
 */
const sendNotification = async (req, res) => {
  const { userEmail, orderId } = req.body;

  // ── Input validation ──────────────────────────────────────────
  if (!userEmail || !orderId) {
    return res
      .status(400)
      .json({ message: "Both 'userEmail' and 'orderId' are required" });
  }

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

  // ── Attempt email delivery (non-blocking on failure) ──────────
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[notification-service] Email sent to ${userEmail} for order ${orderId} | messageId: ${info.messageId}`
    );
    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    // Log instead of crash — order already exists, notification is best-effort
    console.error(
      `[notification-service] Failed to send email to ${userEmail} for order ${orderId}:`,
      error.message
    );
    return res
      .status(200)
      .json({ message: "Notification logged (email delivery failed)", error: error.message });
  }
};

module.exports = { sendNotification };
