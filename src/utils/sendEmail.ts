import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ConnectionOptions } from "tls";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  type CustomSMTPOptions = SMTPTransport.Options & {
    tls?: ConnectionOptions & { family?: number };
  };

  const mailOptions: CustomSMTPOptions = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    requireTLS: true,

    tls: {
      rejectUnauthorized: false,
      family: 4,
    },
  };

  const transporter = nodemailer.createTransport(mailOptions as any);

  await transporter.sendMail({
    from: `"The Reserve" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<h3>Welcome to The Reserve!</h3><p>${text}</p>`,
  });
};
