import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"The Reserve" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<h3>Welcome to The Reserve!</h3><p>${text}</p>`,
  });
};
