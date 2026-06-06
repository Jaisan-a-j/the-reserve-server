export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
): Promise<void> => {
  try {
    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: to,
        reply_to: process.env.EMAIL_USER,
        message_content: htmlContent,
      },
    };

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const resultText = await response.text();

    if (!response.ok) {
      throw new Error(
        `EmailJS API responded with status ${response.status}: ${resultText}`,
      );
    }

    console.log(
      "✅ Email sent globally via native HTTP Fetch Bridge!",
      resultText,
    );
  } catch (error) {
    console.error("❌ Native HTTP Email Dispatch Failed:", error);
    throw error;
  }
};
