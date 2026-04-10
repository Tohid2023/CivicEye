const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection failed:", error.message);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error("Email recipient is required");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@civiceye.com";

  const mailData = {
    from,
    to,
    subject,
    text,
    html,
  };

  const result = await transporter.sendMail(mailData);
  return result;
};

const sendOtpEmail = async ({ to, otp, role }) => {
  if (!to) {
    throw new Error("OTP email recipient is required");
  }

  const subject = `CivicEye ${role === "helper" ? "Helper" : "User"} OTP Code`;
  const text = `Your CivicEye OTP is ${otp}. It expires in 5 minutes.\n\nIf you did not request this, ignore this message.`;
  const html = `<p>Hello,</p><p>Your CivicEye OTP is <strong>${otp}</strong>.</p><p>It expires in 5 minutes.</p>`;

  return sendMail({ to, subject, text, html });
};

module.exports = {
  sendMail,
  sendOtpEmail,
};