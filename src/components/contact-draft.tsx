"use client";

import { useSyncExternalStore, type SetStateAction } from "react";
import type { ServiceId } from "@/i18n/services";

export type ContactDraft = {
  name: string;
  email: string;
  company: string;
  companyUrl: string;
  message: string;
  service?: ServiceId | "not-sure";
  budget: string;
  submission?: { payload: string; id: string };
};

// Browser memory survives router/layout remounts. Server snapshots are always empty;
// updates can only occur in browser events. No cookies or persistent storage.
let browserDraft: ContactDraft | undefined;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function getSnapshot() { return browserDraft; }
function getServerSnapshot() { return undefined; }
function setDraft(action: SetStateAction<ContactDraft | undefined>) {
  if (typeof window === "undefined") throw new Error("Contact drafts are browser-only.");
  browserDraft = typeof action === "function" ? action(browserDraft) : action;
  listeners.forEach((listener) => listener());
}
export function useContactDraft() {
  const draft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { draft, setDraft };
}
