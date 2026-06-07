import { Resend } from "resend";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "jaisanaj1999@gmail.com",
    subject,
    html: `<h3>Welcome to The Reserve!</h3><p>${text}</p>`,
  });

  console.log(response);
};
