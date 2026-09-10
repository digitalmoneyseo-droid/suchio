import { publicBusinessAddress, publicContactEmail, publicContactPhone } from "@/lib/contact";
import { locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export function SiteStructuredData() {
  const organizationId = absoluteUrl("/#organization");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Suchio",
        url: absoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/apple-touch-icon.png"),
          width: 180,
          height: 180,
        },
        email: publicContactEmail,
        telephone: publicContactPhone,
        address: {
          "@type": "PostalAddress",
          ...publicBusinessAddress,
        },
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: "Suchio",
        inLanguage: locales,
        publisher: { "@id": organizationId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
