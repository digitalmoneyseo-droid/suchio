"use client";

import { useRef, useState } from "react";
import { useHydrated } from "@/components/use-hydrated";
import { measurementCopy, measurementConsentVersion } from "@/i18n/audit-measurement";
import type { Locale } from "@/i18n/config";

export function AuditVisitChoice(props: { code: string; locale: Locale }) {
  const hydrated = useHydrated();
  return hydrated ? <BrowserVisitChoice key={props.code} {...props} /> : null;
}

function readChoice(storageKey: string): { state: "preview" | "accepted" | "choice"; receipt: string | null } {
  if (new URLSearchParams(location.search).has("audit_preview")) return { state: "preview", receipt: null };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (stored && typeof stored.receipt === "string" && /^[a-f0-9]{64}$/.test(stored.receipt) && Number.isFinite(stored.expires) && stored.expires > Date.now()) {
      return { state: stored.confirmed === true ? "accepted" : "choice", receipt: stored.receipt };
    }
    if (stored) localStorage.removeItem(storageKey);
  } catch { /* Unavailable storage never implies consent. */ }
  return { state: "choice", receipt: null };
}

function BrowserVisitChoice({ code, locale }: { code: string; locale: Locale }) {
  const copy = measurementCopy[locale];
  const storageKey = `suchio:audit-consent:${code}`;
  const [initial] = useState(() => readChoice(storageKey));
  const [state, setState] = useState<"choice" | "accepted" | "declined" | "preview">(initial.state);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const receipt = useRef<string | null>(initial.receipt);

  async function update(withdraw: boolean) {
    if (busy) return;
    setBusy(true); setError(false);
    try {
      if (!withdraw && !receipt.current) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        const token = Array.from(bytes, n => n.toString(16).padStart(2, "0")).join("");
        localStorage.setItem(storageKey, JSON.stringify({ receipt: token, expires: Date.now() + 30 * 86400000 }));
        receipt.current = token;
      }
      if (!receipt.current) throw new Error("No receipt");
      const response = await fetch("/api/audit-visits", { method: withdraw ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ code, receipt: receipt.current, consent: !withdraw, version: measurementConsentVersion }) });
      if (!response.ok) throw new Error("Unavailable");
      if (withdraw) { localStorage.removeItem(storageKey); receipt.current = null; setState("declined"); }
      else {
        const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        localStorage.setItem(storageKey, JSON.stringify({ ...stored, receipt: receipt.current, confirmed: true }));
        setState("accepted");
      }
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  const button = "min-h-12 rounded-card border border-line px-4 py-3 text-sm font-medium hover:bg-surface disabled:opacity-60";
  const privacy = `${locale === "de" ? "/datenschutz" : `/${locale}/privacy`}#audit-auswertung`;
  return <section aria-label={copy.title} className="mx-auto mb-10 max-w-layout rounded-card border border-line p-card-padding">
    {state === "choice" && <><h2 className="m-0 text-heading-sm">{copy.title}</h2><p className="mt-3 max-w-reading text-sm/6 text-muted">{copy.explanation}</p>
      <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={busy} onClick={() => void update(false)}>{copy.accept}</button><button type="button" className={button} disabled={busy} onClick={() => { if (receipt.current) void update(true); else setState("declined"); }}>{copy.decline}</button></div></>}
    {state === "accepted" && <><p className="m-0 text-sm/6">{copy.accepted}</p><button type="button" className={`${button} mt-3`} disabled={busy} onClick={() => void update(true)}>{copy.withdraw}</button></>}
    {(state === "preview" || state === "declined") && <p className="m-0 text-sm/6">{state === "preview" ? copy.preview : copy.declined}</p>}
    {error && <p role="alert" className="mt-3 text-sm/6">{copy.error}</p>}
    <a href={privacy} className="mt-3 inline-block text-sm text-accent underline underline-offset-4">{copy.privacy}</a>
  </section>;
}
