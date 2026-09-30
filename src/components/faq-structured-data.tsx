import { StructuredData } from "@/components/structured-data";
import type { Faq } from "@/lib/content-core";

export function FaqStructuredData({ items }: { items: readonly Pick<Faq, "question" | "answer">[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <StructuredData value={schema} />;
}
