const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP.
 * Credentials come exclusively from environment variables — never hardcoded.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

module.exports = createTransporter;
