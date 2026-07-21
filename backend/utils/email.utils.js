const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ─── Email templates ──────────────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #6366f1; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 40px; }
    .body h2 { color: #111827; font-size: 20px; margin: 0 0 12px; }
    .body p { color: #4b5563; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .token-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 24px; font-family: monospace; font-size: 20px; letter-spacing: 6px; text-align: center; color: #111827; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 13px; margin: 0; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .warning p { color: #92400e; margin: 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Freelance Marketplace</h1>
      <p>Connecting talent with opportunity</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Freelance Marketplace. All rights reserved.</p>
      <p style="margin-top:8px;">If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

const templates = {
  verifyEmail: (firstName, verificationUrl) => ({
    subject: 'Verify your email address',
    html: emailWrapper(`
      <h2>Welcome, ${firstName}!</h2>
      <p>Thanks for signing up. Please verify your email address to activate your account and start using the platform.</p>
      <p style="text-align:center;">
        <a href="${verificationUrl}" class="btn">Verify Email Address</a>
      </p>
      <div class="warning">
        <p>⏰ This link expires in <strong>24 hours</strong>.</p>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break:break-all;color:#6366f1;font-size:13px;">${verificationUrl}</p>
    `),
  }),

  forgotPassword: (firstName, resetUrl) => ({
    subject: 'Reset your password',
    html: emailWrapper(`
      <h2>Reset your password</h2>
      <p>Hi ${firstName}, we received a request to reset your password. Click the button below to set a new one.</p>
      <p style="text-align:center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <div class="warning">
        <p>⏰ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your password won't change.</p>
      </div>
    `),
  }),

  passwordChanged: (firstName) => ({
    subject: 'Your password has been changed',
    html: emailWrapper(`
      <h2>Password changed</h2>
      <p>Hi ${firstName}, this is a confirmation that your password was successfully changed.</p>
      <div class="warning">
        <p>🔐 If you did not make this change, please contact our support team immediately.</p>
      </div>
    `),
  }),

  welcomeVerified: (firstName, role) => ({
    subject: 'You\'re in! Welcome to Freelance Marketplace',
    html: emailWrapper(`
      <h2>Email verified! 🎉</h2>
      <p>Hi ${firstName}, your email has been verified. Your ${role} account is now fully active.</p>
      <p>${role === 'freelancer'
        ? 'Start by completing your profile — add your skills, portfolio, and hourly rate to attract great clients.'
        : 'Start by posting your first project and find the perfect freelancer for your needs.'
      }</p>
      <p style="text-align:center;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
      </p>
    `),
  }),

  twoFactorCode: (firstName, code) => ({
    subject: 'Your 2-Step Verification Code',
    html: emailWrapper(`
      <h2>2-Step Verification</h2>
      <p>Hi ${firstName}, here is your login verification code:</p>
      <div class="token-box">${code}</div>
      <div class="warning">
        <p>⏰ This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      </div>
    `),
  }),
};

// ─── Send email function ──────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const { subject, html } = templates.verifyEmail(user.firstName, verificationUrl);
  return sendEmail({ to: user.email, subject, html });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const { subject, html } = templates.forgotPassword(user.firstName, resetUrl);
  return sendEmail({ to: user.email, subject, html });
};

const sendPasswordChangedEmail = async (user) => {
  const { subject, html } = templates.passwordChanged(user.firstName);
  return sendEmail({ to: user.email, subject, html });
};

const sendWelcomeEmail = async (user) => {
  const { subject, html } = templates.welcomeVerified(user.firstName, user.role);
  return sendEmail({ to: user.email, subject, html });
};

const sendTwoFactorCodeEmail = async (user, code) => {
  const { subject, html } = templates.twoFactorCode(user.firstName, code);
  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendTwoFactorCodeEmail,
};
