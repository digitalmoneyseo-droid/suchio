import { ContactForm, type ContactFormCopy } from "@/components/contact-form";
import { EditorialHero } from "@/components/editorial-hero";
import { getServiceCopy } from "@/i18n/services";
import { publicContactEmail } from "@/lib/contact";
import { budgetOptions } from "@/lib/contact-options";
import { localizePath, t, type Locale } from "@/lib/i18n";
import { serviceOrder } from "@/lib/service-catalog";

export function ContactPage({ locale }: { locale: Locale }) {
  const services = serviceOrder.map((id) => ({ id, name: getServiceCopy(locale, id).name }));
  const formCopy = {
    name: t(locale, "contact.formName"),
    namePlaceholder: t(locale, "contact.formNamePlaceholder"),
    email: t(locale, "contact.formEmail"),
    emailPlaceholder: t(locale, "contact.formEmailPlaceholder"),
    company: t(locale, "contact.formCompany"),
    companyPlaceholder: t(locale, "contact.formCompanyPlaceholder"),
    companyUrl: t(locale, "contact.formCompanyUrl"),
    companyUrlPlaceholder: t(locale, "contact.formCompanyUrlPlaceholder"),
    companyOptional: t(locale, "contact.formOptional"),
    service: t(locale, "contact.formService"),
    selectedService: t(locale, "contact.selectedService"),
    serviceUnsure: t(locale, "contact.formServiceUnsure"),
    budget: t(locale, "contact.formBudget"),
    budgetPlaceholder: t(locale, "contact.formBudgetPlaceholder"),
    budgetOptions: budgetOptions.map(({ id, messageKey }) => ({ id, label: t(locale, messageKey) })),
    message: t(locale, "contact.formMessage"),
    placeholder: t(locale, "contact.formPlaceholder"),
    submit: t(locale, "contact.formSubmit"),
    sending: t(locale, "contact.formSending"),
    required: t(locale, "contact.formRequired"),
    requiredLabel: t(locale, "contact.formRequiredLabel"),
    emailError: t(locale, "contact.formEmailError"),
    companyUrlError: t(locale, "contact.formCompanyUrlError"),
    messageError: t(locale, "contact.formMessageError"),
    note: t(locale, "contact.formNote"),
    error: t(locale, "contact.formError"),
    successTitle: t(locale, "contact.formSuccessTitle"),
    successCopy: t(locale, "contact.formSuccessCopy"),
    another: t(locale, "contact.formAnother"),
  } satisfies ContactFormCopy;

  return (
    <main id="main-content">
      <EditorialHero
        title={t(locale, "contact.title")}
        copy={t(locale, "contact.copy")}
      />
      <section className="px-page pb-section">
        <div className="reveal mx-auto max-w-[50rem]" data-reveal>
          <div className="rounded-shell bg-white p-10 shadow-surface max-narrow:p-card-padding">
            <ContactForm contactEmail={publicContactEmail} copy={formCopy} locale={locale} services={services} privacy={{ href: localizePath("/privacy", locale), label: t(locale, "footer.privacy") }} />
          </div>
        </div>
      </section>
    </main>
  );
}
