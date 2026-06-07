import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  // Configured for Mailtrap SMTP - Uses standard web port routing
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io", // Change to "live.smtp.mailtrap.io" for production
    port: 2525, // Mailtrap allows alternative ports that bypass standard blocks
    auth: {
      user: process.env.MAILTRAP_SMTP_USER, // Grab these from your Mailtrap Integration tab
      pass: process.env.MAILTRAP_SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"The Reserve" <bookings@yourdomain.com>`, // Use your verified Mailtrap domain email
    to,
    subject,
    html: `<h3>Welcome to The Reserve!</h3><p>${text}</p>`,
  });
};
