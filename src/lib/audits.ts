import data from "@/content/audits.json";
import type { Locale } from "@/i18n/config";

interface AuditContent {
  title: string;
  summary: string;
  findings: string[][];
  steps: string[][];
  flow: string[];
  cta: string;
  methodextra: string;
  methodology?: string;
  searchNote?: string;
  measurementNote?: string;
  evidenceNote?: string;
}

export interface Audit {
  id: string;
  code: string;
  company: string;
  url: string;
  measuredAt: string;
  lighthouseVersion: string;
  scores: number[] | null;
  metrics: number[] | null;
  sources: string[][];
  content: Record<Locale, AuditContent>;
}

export const audits: Audit[] = data;
export function getAudit(code: string): Audit | undefined {
  return audits.find(audit => audit.code === code);
}
