"use client";

import { useReducedMotion } from "motion/react";
import { useHydrated } from "@/components/use-hydrated";

export function useHydratedReducedMotion() {
  const hydrated = useHydrated();
  const prefersReducedMotion = useReducedMotion();
  return hydrated && Boolean(prefersReducedMotion);
}
