import { healthResponse } from "@/lib/health";

export function GET() {
  return healthResponse({ apiKey: process.env.RESEND_API_KEY, to: process.env.CONTACT_EMAIL_TO, from: process.env.CONTACT_EMAIL_FROM });
}
