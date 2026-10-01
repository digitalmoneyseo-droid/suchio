"use client";

import { serviceIcons as sharedServiceIcons } from "@/components/service-icons";
import { serviceStyles } from "@/components/service-styles";

import { ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, LoaderCircle } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import type { ServiceId } from "@/i18n/services";
import type { BudgetId } from "@/lib/contact-options";
import { useContactDraft, type ContactDraft } from "@/components/contact-draft";
import { retryAfterSeconds } from "@/lib/contact-response";
import { emailPattern, isHttpUrl } from "@/lib/contact-validation";
import { useHydrated } from "@/components/use-hydrated";

type FieldName = "name" | "email" | "companyUrl" | "service" | "budget" | "message";
type Errors = Partial<Record<FieldName | "form", string>>;
type Status = "idle" | "sending" | "success";

type ServiceOption = { id: ServiceId; name: string };
type ServiceChoiceId = ServiceId | "not-sure";

export type ContactFormCopy = {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  company: string;
  companyPlaceholder: string;
  companyUrl: string;
  companyUrlPlaceholder: string;
  companyOptional: string;
  service: string;
  selectedService: string;
  serviceUnsure: string;
  budget: string;
  budgetPlaceholder: string;
  budgetOptions: readonly { id: BudgetId; label: string }[];
  message: string;
  placeholder: string;
  submit: string;
  sending: string;
  required: string;
  requiredLabel: string;
  emailError: string;
  companyUrlError: string;
  messageError: string;
  note: string;
  error: string;
  successTitle: string;
  successCopy: string;
  another: string;
};

const fieldControlClass = "min-w-0 w-full rounded-control border-0 bg-surface-subtle px-4 text-ink shadow-surface transition-[background-color,box-shadow,scale] duration-150 ease-[var(--ease-out)] placeholder:text-subtle hover:bg-white hover:shadow-surface-hover focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:outline-2 aria-invalid:outline-error motion-reduce:transition-none";

const serviceOptionStyles: Record<ServiceChoiceId, { selected: string; icon: string }> = {
  ...serviceStyles,
  "not-sure": { selected: "peer-checked:bg-surface-selected peer-checked:text-ink peer-checked:shadow-surface-hover", icon: "bg-white text-subtle" },
};

const serviceIcons = { ...sharedServiceIcons, "not-sure": CircleHelp };

export function ContactForm({
  contactEmail,
  copy,
  locale,
  services,
  privacy,
}: {
  contactEmail: string;
  copy: ContactFormCopy;
  locale: Locale;
  services: ServiceOption[];
  privacy: { href: string; label: string };
}) {
  const { draft, setDraft } = useContactDraft();
  const formRef = useRef<HTMLFormElement>(null);
  const pendingRequest = useRef<AbortController | null>(null);
  const hydrated = useHydrated();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [retrySeconds, setRetrySeconds] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetSelection, setSelectedBudget] = useState<string>();
  const selectedBudget = budgetSelection ?? draft?.budget ?? "";
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceChoiceId>();
  const budgetControlRef = useRef<HTMLDivElement>(null);
  const budgetButtonRef = useRef<HTMLButtonElement>(null);
  const budgetMenuRef = useRef<HTMLDivElement>(null);
  const budgetSearch = useRef({ text: "", time: 0 });
  const [activeBudgetIndex, setActiveBudgetIndex] = useState(0);
  const serviceOptions: readonly { id: ServiceChoiceId; name: string }[] = [...services, { id: "not-sure", name: copy.serviceUnsure }];
  const selectedBudgetLabel = copy.budgetOptions.find(({ id }) => id === selectedBudget)?.label;
  const locationSearch = useSyncExternalStore(subscribeToLocation, getLocationSearch, getServerLocationSearch);
  const requestedServiceId = new URLSearchParams(locationSearch).get("service");
  const requestedService = services.find(({ id }) => id === requestedServiceId);
  const effectiveServiceId = selectedServiceId ?? draft?.service ?? requestedService?.id;
  const preselectedServiceLabel = selectedServiceId === undefined ? requestedService?.name : undefined;

  useEffect(() => () => pendingRequest.current?.abort(), []);

  useEffect(() => {
    if (!retrySeconds) return;
    const timer = window.setTimeout(() => setRetrySeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  function focusBudget(index: number) {
    setActiveBudgetIndex(index);
    setBudgetOpen(true);
  }

  useLayoutEffect(() => {
    if (budgetOpen) budgetMenuRef.current?.querySelectorAll<HTMLButtonElement>("[role='option']")[activeBudgetIndex]?.focus();
  }, [budgetOpen, activeBudgetIndex]);

  function openBudget(last = false) {
    budgetSearch.current = { text: "", time: 0 };
    const selectedIndex = copy.budgetOptions.findIndex(option => option.id === selectedBudget);
    focusBudget(selectedIndex >= 0 ? selectedIndex : last ? copy.budgetOptions.length - 1 : 0);
  }

  function saveDraft(changes: Partial<Pick<ContactDraft, "service" | "budget">> = {}) {
    const form = formRef.current;
    if (!form) return;
    const fields = new FormData(form);
    setDraft({
      name: String(fields.get("name") ?? ""),
      email: String(fields.get("email") ?? ""),
      company: String(fields.get("company") ?? ""),
      companyUrl: String(fields.get("companyUrl") ?? ""),
      message: String(fields.get("message") ?? ""),
      service: serviceOptions.find(({ id }) => id === fields.get("service"))?.id,
      budget: selectedBudget,
      submission: draft?.submission,
      ...changes,
    });
    setIsDirty(true);
  }

  useEffect(() => {
    if (!budgetOpen) return;
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!budgetControlRef.current?.contains(event.target as Node)) setBudgetOpen(false);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setBudgetOpen(false);
      budgetButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [budgetOpen]);

  useEffect(() => {
    if (!isDirty && !draft) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty, draft]);

  function clearError(field: FieldName) {
    setErrors((current) => current[field] || current.form ? { ...current, [field]: undefined, form: undefined } : current);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRequest.current || retrySeconds > 0) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const service = String(data.get("service") ?? "");
    const budget = String(data.get("budget") ?? "");
    const message = String(data.get("message") ?? "").trim();
    const companyUrl = String(data.get("companyUrl") ?? "").trim();
    const nextErrors: Errors = {};

    if (!name) nextErrors.name = copy.required;
    if (!emailPattern.test(email)) nextErrors.email = copy.emailError;
    if (companyUrl && !isHttpUrl(companyUrl)) nextErrors.companyUrl = copy.companyUrlError;
    if (!service) nextErrors.service = copy.required;
    if (!budget) nextErrors.budget = copy.required;
    if (message.length < 20) nextErrors.message = copy.messageError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstInvalidField = Object.keys(nextErrors)[0] as FieldName;
      if (firstInvalidField === "budget") budgetButtonRef.current?.focus();
      else form.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      return;
    }

    saveDraft();
    const requestData = { name, email, company: String(data.get("company") ?? "").trim(), companyUrl, service, budget, message, locale, website: String(data.get("website") ?? "") };
    const payload = JSON.stringify(requestData);
    const previousSubmission = draft?.submission;
    const submission = previousSubmission?.payload === payload ? previousSubmission : { payload, id: crypto.randomUUID() };
    setDraft((current) => current ? { ...current, submission } : current);
    const controller = new AbortController();
    pendingRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ ...requestData, submissionId: submission.id }),
      });

      if (response.status === 429) setRetrySeconds(retryAfterSeconds(response.headers.get("retry-after")));
      if (!response.ok) throw new Error("Contact request failed");
      const result: unknown = await response.json();
      if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true) throw new Error("Invalid contact response");
      setDraft(undefined);
      setSubmittedEmail(email);
      setStatus("success");
      setIsDirty(false);
      setSelectedBudget("");
      setSelectedServiceId(undefined);
      form.reset();
    } catch {
      setErrors({ form: copy.error });
      setStatus("idle");
    } finally {
      window.clearTimeout(timeout);
      pendingRequest.current = null;
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center text-center" role="status" aria-live="polite">
        <span className="mb-6 grid size-14 place-items-center rounded-pill bg-green-100 text-green-700" aria-hidden="true">
          <Check className="size-6" strokeWidth={2} />
        </span>
        <h2 tabIndex={-1} ref={heading => { heading?.focus(); }} className="m-0 max-w-[32rem] text-heading-lg text-ink">{copy.successTitle}</h2>
        <p className="mt-4 mb-0 max-w-[32rem] text-base/6 text-muted">
          {copy.successCopy.replace("{email}", submittedEmail)}
        </p>
        <button
          className="mt-8 min-h-11 rounded-control bg-interaction px-4 py-2 text-sm font-medium text-ink transition-[background-color,scale] duration-150 hover:bg-interaction-strong active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none motion-reduce:active:scale-100"
          type="button"
          onClick={() => setStatus("idle")}
        >
          {copy.another}
        </button>
      </div>
    );
  }

  const submitLabel = `${status === "sending" ? copy.sending : copy.submit}${retrySeconds > 0 ? ` (${new Intl.NumberFormat(locale, { style: "unit", unit: "second", unitDisplay: "narrow" }).format(retrySeconds)})` : ""}`;

  return (
    <form ref={formRef} className="grid min-w-0 gap-6" method="post" action="/api/contact" aria-busy={status === "sending"} noValidate onChange={() => saveDraft()} onSubmit={onSubmit}>
      {preselectedServiceLabel ? <p className="mt-0 mb-2 inline-flex max-w-full flex-wrap justify-self-start rounded-control bg-interaction px-3 py-2 text-sm text-muted"><span>{copy.selectedService}: </span>&nbsp;<strong className="font-semibold text-ink">{preselectedServiceLabel}</strong></p> : null}
      <div className="grid grid-cols-2 gap-4 max-narrow:grid-cols-1">
        <Field id="contact-name" label={copy.name} error={errors.name} required={copy.requiredLabel}>
          <input
            disabled={status === "sending"}
            id="contact-name"
            className={`min-h-12 ${fieldControlClass}`}
            name="name"
            defaultValue={draft?.name}
            autoComplete="name"
            placeholder={copy.namePlaceholder}
            maxLength={100}
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            onChange={() => clearError("name")}
          />
        </Field>
        <Field id="contact-email" label={copy.email} error={errors.email} required={copy.requiredLabel}>
          <input
            disabled={status === "sending"}
            id="contact-email"
            className={`min-h-12 ${fieldControlClass}`}
            type="email"
            name="email"
            defaultValue={draft?.email}
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            inputMode="email"
            maxLength={254}
            spellCheck={false}
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            onChange={() => clearError("email")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 max-narrow:grid-cols-1">
        <Field id="contact-company" label={copy.company} hint={copy.companyOptional}>
          <input
            disabled={status === "sending"}
            id="contact-company"
            className={`min-h-12 ${fieldControlClass}`}
            name="company"
            defaultValue={draft?.company}
            autoComplete="organization"
            placeholder={copy.companyPlaceholder}
            maxLength={120}
          />
        </Field>
        <Field id="contact-company-url" label={copy.companyUrl} hint={copy.companyOptional} error={errors.companyUrl}>
          <input
            disabled={status === "sending"}
            id="contact-company-url"
            className={`min-h-12 ${fieldControlClass}`}
            type="url"
            name="companyUrl"
            defaultValue={draft?.companyUrl}
            autoComplete="url"
            placeholder={copy.companyUrlPlaceholder}
            inputMode="url"
            maxLength={2048}
            spellCheck={false}
            aria-invalid={Boolean(errors.companyUrl)}
            aria-describedby={errors.companyUrl ? "contact-company-url-error" : undefined}
            onChange={() => clearError("companyUrl")}
          />
        </Field>
      </div>

      <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0" aria-describedby={errors.service ? "contact-service-error" : undefined}>
        <legend className={`mb-1 text-sm font-medium ${errors.service ? "text-error" : "text-ink"}`}>
          {copy.service}<RequiredMarker label={copy.requiredLabel} />
        </legend>
        <div className="grid grid-cols-2 gap-3 max-narrow:grid-cols-1">
          {serviceOptions.map((service) => {
            const Icon = serviceIcons[service.id];
            const styles = serviceOptionStyles[service.id];
            return (
            <label key={service.id} className="group relative cursor-pointer">
              <input
            disabled={status === "sending"}
                className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                type="radio"
                name="service"
                value={service.id}
                required
                checked={effectiveServiceId === service.id}
                onChange={() => {
                  setSelectedServiceId(service.id);
                  clearError("service");
                }}
              />
              <span className={`flex min-h-14 flex-wrap items-center gap-3 rounded-control bg-surface-subtle p-2 text-sm text-muted shadow-surface transition-[background-color,color,box-shadow,scale] duration-150 ease-[var(--ease-out)] group-hover:bg-white group-hover:shadow-surface-hover peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-active:scale-[.96] motion-reduce:transition-none motion-reduce:peer-active:scale-100 ${styles.selected}`}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-inset shadow-surface ${styles.icon}`} aria-hidden="true">
                  <Icon className="size-4.5" strokeWidth={1.7} />
                </span>
                <span className="min-w-[min(100%,8rem)] flex-1">{service.name}</span>
              </span>
            </label>
          );})}
        </div>
        {errors.service ? <span id="contact-service-error" className="text-sm text-error" role="alert">{errors.service}</span> : null}
      </fieldset>

      <Field id="contact-budget" label={copy.budget} error={errors.budget} required={copy.requiredLabel}>
        <div ref={budgetControlRef} className="relative min-w-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setBudgetOpen(false); }}>
          <input name="budget" type="hidden" value={selectedBudget} readOnly />
          <button
            ref={budgetButtonRef}
            id="contact-budget"
            className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-control border-0 bg-surface-subtle px-4 text-left text-sm shadow-surface transition-[background-color,box-shadow,scale] duration-150 ease-[var(--ease-out)] hover:bg-white hover:shadow-surface-hover active:scale-[.99] focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[invalid=true]:outline-2 data-[invalid=true]:outline-error motion-reduce:transition-none motion-reduce:active:scale-100 ${selectedBudgetLabel ? "text-ink" : "text-muted"}`}
            type="button"
            disabled={status === "sending"}
            aria-haspopup="listbox"
            aria-expanded={budgetOpen}
            aria-controls="contact-budget-menu"
            data-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? "contact-budget-error" : undefined}
            onClick={() => budgetOpen ? setBudgetOpen(false) : openBudget()}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              openBudget(event.key === "ArrowUp");
            }}
          >
            <span>{selectedBudgetLabel ?? copy.budgetPlaceholder}</span>
            <ChevronDown className={`size-4 shrink-0 text-subtle transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${budgetOpen ? "rotate-180" : ""}`} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <div
            ref={budgetMenuRef}
            id="contact-budget-menu"
            className={`absolute top-full right-0 left-0 z-20 pt-2 transition-[opacity,translate] duration-200 ease-[var(--ease-out)] motion-reduce:duration-0 ${budgetOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
            role="listbox"
            aria-label={copy.budget}
            aria-hidden={!budgetOpen}
            inert={!budgetOpen}
          >
            <div className="rounded-control bg-white p-1 shadow-floating">
              {copy.budgetOptions.map((option, index) => (
                <button
                  key={option.id}
                  className={`flex min-h-9 w-full cursor-pointer items-center justify-between gap-4 rounded-inset px-3 text-left text-sm transition-[background-color,scale] duration-150 hover:bg-interaction active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus motion-reduce:transition-none motion-reduce:active:scale-100 ${selectedBudget === option.id ? "bg-interaction text-ink" : "text-muted"}`}
                  type="button"
                  role="option"
                  aria-selected={selectedBudget === option.id}
                  tabIndex={budgetOpen && activeBudgetIndex === index ? 0 : -1}
                  onFocus={() => setActiveBudgetIndex(index)}
                  onClick={() => {
                    setSelectedBudget(option.id);
                    saveDraft({ budget: option.id });
                    clearError("budget");
                    setBudgetOpen(false);
                    budgetButtonRef.current?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                      event.preventDefault();
                      focusBudget(event.key === "Home" ? 0 : event.key === "End" ? copy.budgetOptions.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + copy.budgetOptions.length) % copy.budgetOptions.length);
                    } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
                      event.preventDefault();
                      const now = performance.now();
                      const text = (now - budgetSearch.current.time < 700 ? budgetSearch.current.text : "") + event.key.toLocaleLowerCase(locale);
                      budgetSearch.current = { text, time: now };
                      const match = copy.budgetOptions.findIndex(option => option.label.toLocaleLowerCase(locale).startsWith(text));
                      if (match >= 0) focusBudget(match);
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {selectedBudget === option.id ? <Check className="size-4" strokeWidth={1.8} aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Field>

      <Field id="contact-message" label={copy.message} error={errors.message} required={copy.requiredLabel}>
        <textarea
          disabled={status === "sending"}
          id="contact-message"
          className={`min-h-44 resize-y p-4 ${fieldControlClass}`}
          name="message"
          defaultValue={draft?.message}
          autoComplete="off"
          placeholder={copy.placeholder}
          minLength={20}
          maxLength={5000}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-form-note"}
          onChange={() => clearError("message")}
        />
      </Field>

      <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <button
          className="pill-button pill-button--dark inline-flex min-h-[52px] min-w-0 max-w-full flex-wrap items-center gap-3.5 rounded-pill bg-inverse-surface py-2 pr-2.5 pl-4 text-ui font-semibold text-white shadow-dark-surface disabled:cursor-wait disabled:opacity-65 max-narrow:w-full max-narrow:justify-between"
          type="submit"
          disabled={!hydrated || status === "sending" || retrySeconds > 0}
        >
          <span className="block min-w-[min(100%,8rem)] overflow-hidden leading-control">
            <span className="pill-button__label-track grid">
              <span className="col-start-1 row-start-1 flex items-center gap-2" aria-live="polite">
                {status === "sending" ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
                {submitLabel}
              </span>
              <span className="col-start-1 row-start-1 block translate-y-full" aria-hidden="true">{submitLabel}</span>
            </span>
          </span>
          <span className="pill-button__icon relative size-8 flex-none overflow-hidden rounded-pill bg-white text-ink" aria-hidden="true">
            <ArrowRight className="pill-button__arrow pill-button__arrow--right absolute inset-[7px] size-[18px]" strokeWidth={1.7} />
            <ArrowUpRight className="pill-button__arrow pill-button__arrow--up-right absolute inset-[7px] size-[18px] opacity-0 [transform:translate(-6px,6px)_scale(.8)]" strokeWidth={1.7} />
          </span>
        </button>
        <p id="contact-form-note" className="mt-4 mb-0 max-w-[36rem] text-sm text-muted">
          {copy.note}
          {" "}<a href={privacy.href} className="underline underline-offset-2">{privacy.label}</a>
        </p>
        {errors.form ? <p className="mt-4 mb-0 text-sm text-error" role="alert">{errors.form} <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>{contactEmail}</a></p> : null}
      </div>
    </form>
  );
}

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return "";
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <label className={`flex flex-wrap items-baseline gap-2 text-sm font-medium ${error ? "text-error" : "text-ink"}`} htmlFor={id}>
        <span>{label}{required ? <RequiredMarker label={required} /> : null}</span>
        {hint ? <span className="font-normal italic text-muted">({hint})</span> : null}
      </label>
      {children}
      {error ? <span id={`${id}-error`} className="text-sm text-error" role="alert">{error}</span> : null}
    </div>
  );
}

function RequiredMarker({ label }: { label: string }) {
  return <span className="ml-1 text-error"><span aria-hidden="true">*</span><span className="sr-only"> {label}</span></span>;
}
