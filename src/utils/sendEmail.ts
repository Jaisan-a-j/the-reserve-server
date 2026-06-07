import Mailjet from "node-mailjet";

export const sendEmail = async () => {
  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY!,
    process.env.MAILJET_SECRET_KEY!,
  );

  const result = await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "jaisanaj1999@gmail.com",
          Name: "Test App",
        },
        To: [
          {
            Email: "bixifa1230@fanchatu.com",
          },
        ],
        Subject: "Mailjet Test",
        TextPart: "Mailjet is working!",
      },
    ],
  });

  console.log(result.body);
};
