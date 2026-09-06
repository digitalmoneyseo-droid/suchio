"use client";

import { Bot, BrainCircuit, Database, GitBranch, ListTodo, Search, UserRoundPlus, Webhook } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { OFFER_EASE_IN_OUT, OFFER_EASE_OUT, OFFER_VIEWPORT } from "@/components/offer-animations/motion-tokens";
import { useHydratedReducedMotion } from "@/components/offer-animations/use-hydrated-reduced-motion";
import type { AutomationAnimationCopy } from "@/i18n/services";

const tools = [
  { key: "model", Icon: BrainCircuit },
  { key: "context", Icon: Database },
  { key: "research", Icon: Search },
] as const;

const nodeVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function TriggerPulse({ running }: { running: boolean }) {
  return (
    <motion.span
      data-flow-pulse="trigger"
      className="pointer-events-none absolute inset-0 rounded-full border border-brand-500"
      initial={false}
      animate={running
        ? { opacity: [0, 0.42, 0], transform: ["scale(0.8)", "scale(1.35)", "scale(1.35)"] }
        : { opacity: 0, transform: "scale(0.8)" }}
      transition={running
        ? { duration: 1.5, ease: OFFER_EASE_OUT }
        : { duration: 0.15 }}
      aria-hidden="true"
    />
  );
}

function ProcessEmphasis({ running, delay }: { running: boolean; delay: number }) {
  return (
    <motion.span
      data-flow-card-pulse
      className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-inset ring-brand-500"
      initial={false}
      animate={running
        ? { opacity: [0, 0.36, 0], transform: ["scale(0.995)", "scale(1.01)", "scale(1.018)"] }
        : { opacity: 0, transform: "scale(1)" }}
      transition={running
        ? { duration: 0.8, delay, ease: OFFER_EASE_IN_OUT }
        : { duration: 0.15 }}
      aria-hidden="true"
    />
  );
}

function LineSignal({
  running,
  delay,
  duration,
  direction,
  name,
}: {
  running: boolean;
  delay: number;
  duration: number;
  direction: "forward" | "reverse" | "down";
  name: string;
}) {
  const startTransform = direction === "forward"
    ? "translateX(-100%)"
    : direction === "reverse"
      ? "translateX(100%)"
      : "translateY(-100%)";
  const endTransform = direction === "down" ? "translateY(0%)" : "translateX(0%)";
  const bubblePosition = direction === "forward"
    ? "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
    : direction === "reverse"
      ? "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
      : "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";

  return (
    <motion.span
      data-flow-signal={name}
      className="pointer-events-none absolute inset-0 z-10 block overflow-visible"
      initial={false}
      animate={running
        ? {
            opacity: [0, 1, 1, 0],
            transform: [startTransform, startTransform, endTransform, endTransform],
          }
        : { opacity: 0, transform: startTransform }}
      transition={running
        ? {
            duration,
            delay,
            times: [0, 0.08, 0.9, 1],
            ease: "linear",
          }
        : { duration: 0.15 }}
      aria-hidden="true"
    >
      <span className={`absolute size-1.5 rounded-full bg-white ring-2 ring-brand-500 ${bubblePosition}`} />
    </motion.span>
  );
}

export function AutomationFlowAnimation({ copy }: { copy: AutomationAnimationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, OFFER_VIEWPORT);
  const noMotion = useHydratedReducedMotion();
  const active = noMotion || isInView;
  const loopActive = !noMotion && isInView;

  return (
    <motion.div
      ref={containerRef}
      data-automation-flow
      className="grid h-full min-h-0 w-full place-items-center"
      initial={false}
      animate={active ? "visible" : "hidden"}
    >
      <div className="w-full max-w-md">
        <div className="grid grid-cols-[minmax(5rem,.7fr)_1rem_minmax(0,1.5fr)] items-stretch">
          <motion.div
            data-flow-node="trigger"
            className="relative grid min-w-0 place-items-center rounded-xl bg-white p-3 text-center shadow-surface max-[600px]:p-2"
            variants={nodeVariants}
            transition={{ delay: noMotion ? 0 : 0.08, duration: noMotion ? 0 : 0.35, ease: OFFER_EASE_OUT }}
          >
            <ProcessEmphasis running={loopActive} delay={2.15} />
            <span className="min-w-0">
              <span className="relative mx-auto grid size-7 place-items-center">
                <TriggerPulse running={loopActive} />
                <Webhook className="relative size-5 text-brand-600" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="mt-2 block text-xs font-semibold text-pretty [overflow-wrap:normal] hyphens-none">{copy.trigger}</span>
            </span>
          </motion.div>

          <motion.span
            data-flow-connector="trigger-agent"
            className="relative my-auto block h-0.5 origin-left bg-brand-500"
            variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
            transition={{ delay: noMotion ? 0 : 0.3, duration: noMotion ? 0 : 0.3, ease: OFFER_EASE_IN_OUT }}
            aria-hidden="true"
          >
            <LineSignal running={loopActive} delay={2.42} duration={0.28} direction="forward" name="trigger-agent" />
          </motion.span>

          <motion.div
            data-flow-node="agent"
            className="relative min-w-0 rounded-xl bg-brand-50 p-3 shadow-accent-surface max-[600px]:p-2"
            variants={nodeVariants}
            transition={{ delay: noMotion ? 0 : 0.42, duration: noMotion ? 0 : 0.38, ease: OFFER_EASE_OUT }}
          >
            <ProcessEmphasis running={loopActive} delay={2.7} />
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-900 text-white">
                <Bot className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-pretty [overflow-wrap:normal] hyphens-none">{copy.agent}</span>
                <span className="block text-xs text-pretty text-neutral-400 [overflow-wrap:normal] hyphens-none max-[400px]:hidden">{copy.extract}</span>
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 max-[600px]:mt-2 max-[600px]:gap-1">
              {tools.map(({ key, Icon }) => (
                <span className="grid min-w-0 place-items-center gap-1 rounded-lg bg-white p-2 text-center shadow-surface max-[600px]:p-1" key={key}>
                  <Icon className="size-3.5 text-neutral-500" strokeWidth={1.8} aria-hidden="true" />
                  <span className="text-xs font-medium text-neutral-500">{copy[key]}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.span
          data-flow-connector="agent-condition"
          className="relative mx-auto block h-8 w-0.5 origin-top bg-brand-500 max-[600px]:h-3"
          variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1 } }}
          transition={{ delay: noMotion ? 0 : 0.84, duration: noMotion ? 0 : 0.28, ease: OFFER_EASE_IN_OUT }}
          aria-hidden="true"
        >
          <LineSignal running={loopActive} delay={2.93} duration={0.32} direction="down" name="agent-condition" />
        </motion.span>

        <motion.div
          data-flow-node="condition"
          className="relative mx-auto flex w-full max-w-xs min-w-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-center shadow-surface max-[600px]:px-3 max-[600px]:py-2"
          variants={nodeVariants}
          transition={{ delay: noMotion ? 0 : 1.06, duration: noMotion ? 0 : 0.35, ease: OFFER_EASE_OUT }}
        >
          <ProcessEmphasis running={loopActive} delay={3.25} />
          <GitBranch className="size-5 shrink-0 text-brand-600" strokeWidth={1.9} aria-hidden="true" />
          <span className="text-xs font-semibold text-pretty [overflow-wrap:normal] hyphens-none">{copy.condition}</span>
        </motion.div>

        <div
          data-flow-connector="condition-outcomes"
          className="relative grid h-12 w-full grid-cols-2 gap-3 max-[600px]:h-6"
          aria-hidden="true"
        >
          <motion.span
            data-flow-segment="stem"
            className="absolute top-0 left-1/2 h-3 w-0.5 -translate-x-1/2 origin-top bg-brand-500"
            variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1 } }}
            transition={{ delay: noMotion ? 0 : 1.3, duration: noMotion ? 0 : 0.12, ease: OFFER_EASE_IN_OUT }}
          >
            <LineSignal running={loopActive} delay={3.5} duration={0.12} direction="down" name="branch-stem" />
          </motion.span>

          <div className="relative">
            <motion.span
              data-flow-segment="left-rail"
              className="absolute top-3 right-[-0.375rem] left-1/2 h-0.5 origin-right bg-brand-500"
              variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
              transition={{ delay: noMotion ? 0 : 1.42, duration: noMotion ? 0 : 0.2, ease: OFFER_EASE_IN_OUT }}
            >
              <LineSignal running={loopActive} delay={3.62} duration={0.18} direction="reverse" name="left-rail" />
            </motion.span>
            <motion.span
              data-flow-segment="left-leg"
              className="absolute top-3 bottom-0 left-1/2 w-0.5 -translate-x-1/2 origin-top bg-brand-500"
              variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1 } }}
              transition={{ delay: noMotion ? 0 : 1.62, duration: noMotion ? 0 : 0.2, ease: OFFER_EASE_IN_OUT }}
            >
              <LineSignal running={loopActive} delay={3.8} duration={0.2} direction="down" name="left-leg" />
            </motion.span>
          </div>

          <div className="relative">
            <motion.span
              data-flow-segment="right-rail"
              className="absolute top-3 right-1/2 left-[-0.375rem] h-0.5 origin-left bg-brand-500"
              variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
              transition={{ delay: noMotion ? 0 : 1.42, duration: noMotion ? 0 : 0.2, ease: OFFER_EASE_IN_OUT }}
            >
              <LineSignal running={loopActive} delay={3.62} duration={0.18} direction="forward" name="right-rail" />
            </motion.span>
            <motion.span
              data-flow-segment="right-leg"
              className="absolute top-3 right-1/2 bottom-0 w-0.5 translate-x-1/2 origin-top bg-brand-500"
              variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1 } }}
              transition={{ delay: noMotion ? 0 : 1.62, duration: noMotion ? 0 : 0.2, ease: OFFER_EASE_IN_OUT }}
            >
              <LineSignal running={loopActive} delay={3.8} duration={0.2} direction="down" name="right-leg" />
            </motion.span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            data-flow-node="success"
            className="relative flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 shadow-surface max-[600px]:p-2"
            variants={nodeVariants}
            transition={{ delay: noMotion ? 0 : 1.78, duration: noMotion ? 0 : 0.35, ease: OFFER_EASE_OUT }}
          >
            <ProcessEmphasis running={loopActive} delay={4} />
            <UserRoundPlus className="size-5 shrink-0 text-brand-600" strokeWidth={1.8} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-brand-600">{copy.yes}</span>
              <span className="block text-xs font-semibold text-pretty [overflow-wrap:normal] hyphens-none">{copy.success}</span>
            </span>
          </motion.div>
          <motion.div
            data-flow-node="fallback"
            className="relative flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 shadow-surface max-[600px]:p-2"
            variants={nodeVariants}
            transition={{ delay: noMotion ? 0 : 1.86, duration: noMotion ? 0 : 0.35, ease: OFFER_EASE_OUT }}
          >
            <ProcessEmphasis running={loopActive} delay={4} />
            <ListTodo className="size-5 shrink-0 text-neutral-500" strokeWidth={1.8} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-neutral-400">{copy.review}</span>
              <span className="block text-xs font-semibold text-pretty [overflow-wrap:normal] hyphens-none">{copy.fallback}</span>
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
