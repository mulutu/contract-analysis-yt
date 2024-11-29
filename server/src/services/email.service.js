import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  throw new Error("Resend API key is not defined in environment variables.");
}

const resend = new Resend(RESEND_API_KEY);

export async function sendPremiumConfirmationEmail(userEmail, userName) {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: userEmail,
      subject: "Welcome to Premium",
      html: `<p>Hi ${userName},</p><p>Welcome to Premium. You're now a Premium user!</p>`,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
