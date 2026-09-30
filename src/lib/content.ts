import { hasLocale, type Locale } from "@/i18n/config";
import { loadContentRepository, type Faq } from "@/lib/content-core";

const content = loadContentRepository();

export async function getFaqs(locale: Locale): Promise<Faq[]> {
  const faqs = (await content).faqs[locale];
  if (!faqs || !hasLocale(locale)) throw new Error(`FAQ content is unavailable for locale: ${locale}.`);
  return faqs;
}
