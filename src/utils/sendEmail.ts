import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  "b3b65c716bd542b2949d78c1fb705aed",
  "e860d30cbbf965d5868cb88415f1d1ed",
);

export const sendEmail = async () => {
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
