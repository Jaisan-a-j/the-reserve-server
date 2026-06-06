import nodemailer from "nodemailer";
import dns from "dns";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  dns.setDefaultResultOrder("ipv4first");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },

    requireTLS: true,

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: `"The Reserve" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <h3>Welcome to The Reserve!</h3>
      <p>${text}</p>
    `,
  });
};
