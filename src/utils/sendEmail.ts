import nodemailer from "nodemailer";
import dns from "dns";
import net from "net";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
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
    },
    lookup: (
      hostname: string,
      options: dns.LookupOptions & { all?: boolean },
      callback: (
        err: NodeJS.ErrnoException | null,
        address: string | dns.LookupAddress[],
        family: number,
      ) => void,
    ) => {
      dns.lookup(hostname, { ...options, family: 4 }, callback as any);
    },
  } as any);

  await transporter.sendMail({
    from: `"The Reserve" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<h3>Welcome to The Reserve!</h3><p>${text}</p>`,
  });
};
