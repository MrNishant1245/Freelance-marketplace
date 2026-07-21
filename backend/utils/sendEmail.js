// backend/utils/sendEmail.js
//
// Reusable email-sending utility built on Nodemailer, using the SMTP
// credentials already configured in your .env (SMTP_HOST, SMTP_PORT,
// SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_FROM_NAME).

const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to       - Recipient email address
 * @param {string} options.subject  - Email subject line
 * @param {string} options.html     - HTML body
 * @param {string} [options.text]   - Plain-text fallback (optional)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = getTransporter();

    await transport.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'FreelanceMarket'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || undefined,
    });

    console.log(`📧 Email sent to ${to}: "${subject}"`);
  } catch (error) {
    // Email failures should never crash the main request (e.g. proposal submission) —
    // log it and move on.
    console.error('❌ Email send error:', error.message);
  }
};

module.exports = sendEmail;
