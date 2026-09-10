import { LegalPage } from "@/components/pages/legal-page";
import { noIndexPageMetadata } from "@/lib/site";
export const dynamic = "force-static";
export const metadata = noIndexPageMetadata({ locale: "de", pathname: "/privacy", title: "Datenschutzerklärung", description: "Datenschutz beim Websitebesuch, bei Kontaktanfragen und bei unserer Briefwerbung." });
export default function Page() { return <LegalPage locale="de" kind="privacy"/>; }
