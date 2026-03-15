import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Configured for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.error(
      "❌ Email failed: EMAIL_USER or EMAIL_PASSWORD not set in .env",
    );
    return;
  }

  const confirmLink = `${APP_URL}/api/auth/verify?token=${token}`;

  console.log(`📧 Sending verification email via Nodemailer to: ${email}...`);

  try {
    await transporter.sendMail({
      from: `"KTC Scanner" <${user}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; text-align: center;">Welcome to KTC Scanner</h2>
          <p style="color: #475569; font-size: 16px;">Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:<br>${confirmLink}</p>
        </div>
      `,
    });
    console.log("✅ Verification email sent successfully via Nodemailer");
  } catch (err) {
    console.error("❌ Nodemailer Error:", err);
    throw err;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.error(
      "❌ Email failed: EMAIL_USER or EMAIL_PASSWORD not set in .env",
    );
    return;
  }

  const resetLink = `${APP_URL}/reset-password?token=${token}`;

  console.log(`📧 Sending password reset email via Nodemailer to: ${email}...`);

  try {
    await transporter.sendMail({
      from: `"KTC Scanner" <${user}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; text-align: center;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px;">You requested to reset your password. Click the button below to set a new one. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log("✅ Password reset email sent successfully via Nodemailer");
  } catch (err) {
    console.error("❌ Nodemailer Error:", err);
    throw err;
  }
}
