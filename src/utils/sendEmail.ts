import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  const mailOptions: SMTPTransport.Options = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    ...({ family: 4 } as any),
  };

  const transporter = nodemailer.createTransport(mailOptions);

  await transporter.sendMail({
    from: `"The Reserve" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<h3>Welcome to The Reserve!</h3><p>${text}</p>`,
  });
};
