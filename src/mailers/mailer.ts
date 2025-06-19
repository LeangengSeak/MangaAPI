import { config } from "../config/app.config";
import { transporter } from "./resendClient";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender =
  config.NODE_ENV === "development"
    ? `no-reply <onboarding@resend.dev>`
    : `no-reply <${config.MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) =>
{
 try {
  const info = await transporter.sendMail({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html
  })
  return info;
 } catch (error) {
  console.error("Error sending email:", error);
  throw new Error("Failed to send email");
 }
}
