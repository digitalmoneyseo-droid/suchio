import { defaultLocale, locales, type Locale } from "../i18n/config";
import de01 from "../content/faqs/de/01.json";
import de02 from "../content/faqs/de/02.json";
import de03 from "../content/faqs/de/03.json";
import de04 from "../content/faqs/de/04.json";
import de05 from "../content/faqs/de/05.json";
import en01 from "../content/faqs/en/01.json";
import en02 from "../content/faqs/en/02.json";
import en03 from "../content/faqs/en/03.json";
import en04 from "../content/faqs/en/04.json";
import en05 from "../content/faqs/en/05.json";
import fr01 from "../content/faqs/fr/01.json";
import fr02 from "../content/faqs/fr/02.json";
import fr03 from "../content/faqs/fr/03.json";
import fr04 from "../content/faqs/fr/04.json";
import fr05 from "../content/faqs/fr/05.json";

export interface Faq {
  translationKey: string;
  locale: Locale;
  slug: string;
  order: number;
  question: string;
  answer: string;
}

interface ContentRepository {
  faqs: Record<Locale, Faq[]>;
}

function record(value: unknown, source: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid content object in ${source}.`);
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, field: string, source: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${field} in ${source}.`);
  return value;
}

function slugValue(value: unknown, source: string): string {
  const slug = stringValue(value, "slug", source);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid slug in ${source}: ${slug}.`);
  return slug;
}

function orderValue(value: unknown, source: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) throw new Error(`Invalid order in ${source}.`);
  return value;
}

function localeValue(value: unknown, source: string): Locale {
  const locale = stringValue(value, "locale", source);
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)) throw new Error(`Invalid locale in ${source}.`);
  return locale as Locale;
}

function parseFaq(value: unknown, source: string): Faq {
  const data = record(value, source);
  return {
    translationKey: stringValue(data.translationKey, "translationKey", source),
    locale: localeValue(data.locale, source),
    slug: slugValue(data.slug, source),
    order: orderValue(data.order, source),
    question: stringValue(data.question, "question", source),
    answer: stringValue(data.answer, "answer", source),
  };
}

const faqFiles: Record<Locale, readonly (readonly [id: string, value: unknown])[]> = {
  de: [["01", de01], ["02", de02], ["03", de03], ["04", de04], ["05", de05]],
  en: [["01", en01], ["02", en02], ["03", en03], ["04", en04], ["05", en05]],
  fr: [["01", fr01], ["02", fr02], ["03", fr03], ["04", fr04], ["05", fr05]],
};

function readFaqs(locale: Locale): Faq[] {
  const entries = faqFiles[locale]
    .map(([id, value]) => {
      const source = `src/content/faqs/${locale}/${id}.json`;
      const data = parseFaq(value, source);
      if (data.locale !== locale) throw new Error(`Wrong locale in ${source}.`);
      return data;
    })
    .sort((a, b) => a.order - b.order);

  for (const field of ["translationKey", "slug", "order"] as const) {
    const values = entries.map((entry) => entry[field]);
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${field} in faqs/${locale}.`);
  }
  return entries;
}

function signature(entries: Faq[]): string[] {
  return entries.map((data) => `${data.translationKey}|${data.slug}|${data.order}`);
}

export async function loadContentRepository(): Promise<ContentRepository> {
  const faqs = Object.fromEntries(locales.map((locale) => [locale, readFaqs(locale)] as const)) as Record<Locale, Faq[]>;
  const referenceSignature = JSON.stringify(signature(faqs[defaultLocale]));

  for (const locale of locales) {
    if (JSON.stringify(signature(faqs[locale])) !== referenceSignature) {
      throw new Error(`faqs ${defaultLocale} and ${locale} entries do not match.`);
    }
  }

  return { faqs };
}
