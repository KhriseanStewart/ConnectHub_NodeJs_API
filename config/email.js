import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_FROM = "ConnectHub <noreply@connecthub.local>";

function getTransport() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const user = process.env.MAILTRAP_USER;
    const pass = process.env.MAILTRAP_PASS;
    if (!user || !pass) {
      throw new Error("MAIL_USER and MAIL_PASS are required in .env (Mailtrap SMTP settings)");
    }
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
      port: Number(process.env.MAILTRAP_PORT) || 2525,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export class Email {
  constructor(data) {
    this.to = data.email;
    this.from = process.env.EMAIL_FROM || DEFAULT_FROM;
    this.subject = data.subject;
    this.fullname = data.full_name;
    this.resetCode = data.resetCode;
  }

  async sendPasswordReset() {
    const transport = getTransport();
    if (process.env.NODE_ENV !== "production") {
      await transport.verify();
    }
    await transport.sendMail({
      from: this.from,
      to: this.to,
      subject: "Reset your password",
      html: this._resetHtml(),
    });
  }

  async sendPasswordChangeEmail() {
    const transport = getTransport();
    await transport.sendMail({
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this._passwordChangedHtml(),
    });
  }

  _footer() {
    return `<p style="color:#666;font-size:12px;">ConnectHub – please do not reply.</p>`;
  }

  _resetHtml() {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#667EEA;">Password reset</h2>
        <p>Hello ${this.fullname},</p>
        <p>Use this code to reset your password:</p>
        <div style="background:#f4f6ff;padding:15px;text-align:center;font-size:24px;letter-spacing:4px;font-weight:bold;color:#333;border-radius:8px;">
          ${this.resetCode}
        </div>
        <p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>
        <hr style="border:1px solid #eee;margin:20px 0;">
        ${this._footer()}
      </div>
    `;
  }

  _passwordChangedHtml() {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#667EEA;">Password changed</h2>
        <p>Hello ${this.fullname},</p>
        <p>Your password was changed successfully.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p>If you didn't do this, contact support.</p>
        <hr style="border:1px solid #eee;margin:20px 0;">
        ${this._footer()}
      </div>
    `;
  }
}
