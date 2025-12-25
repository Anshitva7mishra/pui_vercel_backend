import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const getWelcomeEmailHtml = (username) => {
  const primaryColor = "#6366f1";
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to ProjectUI</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .wrapper { width: 100%; padding: 40px 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .header { padding: 28px 40px; border-bottom: 1px solid #f1f5f9; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.4px; }
    .body { padding: 40px; }
    .body p { font-size: 15px; line-height: 1.65; margin-bottom: 18px; color: #475569; }
    .highlight { background-color: #f1f5ff; border-left: 4px solid ${primaryColor}; padding: 14px 18px; border-radius: 6px; margin: 24px 0; font-size: 14px; color: #1e293b; }
    .section { margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 24px; }
    .item { margin-bottom: 20px; }
    .item-title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 6px; }
    .item-desc { font-size: 14px; color: #64748b; line-height: 1.6; }
    .btn { display: inline-block; margin-top: 28px; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 6px; font-size: 14px; font-weight: 600; }
    .footer { background-color: #f8fafc; padding: 26px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
    .link { color: ${primaryColor}; text-decoration: none; font-weight: 500; }
    @media (max-width: 600px) { .body, .header, .footer { padding: 24px; } }
  </style>
</head>
<body>
<table class="wrapper" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <table class="container" cellpadding="0" cellspacing="0">
        <tr>
          <td class="header">
            <h1>ProjectUI</h1>
          </td>
        </tr>
        <tr>
          <td class="body">
            <p>Dear ${username},</p>
            <p>Welcome to <strong>ProjectUI (PUI)</strong>. We’re excited to have you join a platform built specifically for <strong>students and future frontend developers</strong>.</p>
            <div class="highlight">PUI exists to remove unnecessary friction from frontend development — no confusion, no repeated back-and-forth, just clean UI building.</div>
            <p>Whether you're building college projects, personal portfolios, or learning modern frontend workflows, ProjectUI is designed to support you at every step.</p>
            <div class="section">
              <div class="item">
                <div class="item-title">Free Frontend Component Library</div>
                <div class="item-desc">A growing open-source collection of reusable React components, built for real-world frontend development — completely free.</div>
              </div>
              <div class="item">
                <div class="item-title">Student-Friendly Templates</div>
                <div class="item-desc">For faster delivery, explore ready-made templates available at minimal cost — optimized for students and early developers.</div>
              </div>
              <div class="item">
                <div class="item-title">Personal Guidance & Support</div>
                <div class="item-desc">Need one-on-one guidance, project help, or custom solutions? Our team is here to help. <a href="${clientUrl}/contact" class="link">Contact us</a>.</div>
              </div>
            </div>
            <p>At ProjectUI, learning and building should feel smooth — not stressful. We’re glad to have you with us.</p>
            <a href="${clientUrl}" class="btn">Go to Dashboard</a>
          </td>
        </tr>
        <tr>
          <td class="footer"><p>© ${currentYear} ProjectUI. All rights reserved.</p></td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
      throw new Error("Missing Email Credentials in .env file");
    }

    await transporter.sendMail({
      from: `"ProjectUI Team" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to ProjectUI",
      html: getWelcomeEmailHtml(username),
    });

    logger.info(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    logger.error(`❌ Email sending failed: ${error.message}`);
  }
};
