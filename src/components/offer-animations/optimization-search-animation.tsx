"use client";

import { Crown, Search } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getOptimizationScene, OPTIMIZATION_FLIGHT_DELAY_MS, OPTIMIZATION_FLIGHT_DURATION_MS, OPTIMIZATION_RESULTS_DELAY_MS, OPTIMIZATION_TYPING_DELAY_MS, type OptimizationScene } from "@/components/offer-animations/optimization-scene";
import { useHydratedReducedMotion } from "@/components/offer-animations/use-hydrated-reduced-motion";
import type { OptimizationAnimationCopy } from "@/i18n/services";
import { OFFER_EASE_OUT } from "@/components/offer-animations/motion-tokens";

const WINNER_BADGE_HEIGHT = 32;
const WINNER_BADGE_DURATION = 0.45;
const WINNER_CONFETTI_OPTIONS = {
  particleCount: 58, angle: 90, spread: 82, startVelocity: 28, decay: 0.92, gravity: 0.85, scalar: 0.72, ticks: 105,
  origin: { x: 0.5, y: 0.58 }, colors: ["#e6b85c", "#e9c7a0", "#afc3d5", "#d47a4a", "#95b59a"],
};

function useOptimizationScene(active: boolean, reducedMotion: boolean, queryLength: number): OptimizationScene {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (reducedMotion || !active) return;

    const startedAt = performance.now();
    const sceneEnd = queryLength * OPTIMIZATION_TYPING_DELAY_MS + OPTIMIZATION_RESULTS_DELAY_MS + OPTIMIZATION_FLIGHT_DELAY_MS + OPTIMIZATION_FLIGHT_DURATION_MS;
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(sceneEnd, now - startedAt);
      setElapsedMs(previous => {
        const before = getOptimizationScene(previous, queryLength);
        const after = getOptimizationScene(elapsed, queryLength);
        return before.typedLength === after.typedLength && before.resultsVisible === after.resultsVisible && before.flightStarted === after.flightStarted && before.rank === after.rank && before.complete === after.complete ? previous : elapsed;
      });
      if (elapsed < sceneEnd) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, queryLength, reducedMotion]);

  return getOptimizationScene(reducedMotion ? Number.POSITIVE_INFINITY : elapsedMs, queryLength);
}

const resultNames = [
  "Nova Growth", "Brightline Digital", "Ascend Lab", "Northstar Digital", "Signal House", "Orbit Studio", "Growthline", "Peak & Co.", "Kindred Digital", "Verve Labs",
  "Momentum", "Scale Works", "Foundry Digital", "Launchpad", "Metric Studio", "Horizon Growth", "Pathway", "Good Signal", "Elevate",
];
const resultSites = [
  "novagrowth.co", "brightline.digital", "ascendlab.co", "northstar.digital", "signalhouse.co", "orbit.studio", "growthline.co", "peakandco.com", "kindred.digital", "vervelabs.co",
  "momentum.studio", "scaleworks.co", "foundry.digital", "launchpad.agency", "metric.studio", "horizongrowth.co", "pathway.digital", "goodsignal.co", "elevate.agency",
];

export function OptimizationSearchAnimation({ copy }: { copy: OptimizationAnimationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const resultsViewportRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.55 });
  const reducedMotion = useHydratedReducedMotion();
  const scene = useOptimizationScene(isInView, reducedMotion, copy.query.length);
  const [resultsHeight, setResultsHeight] = useState(0);
  const { typedLength, resultsVisible, flightStarted, rank: currentRank } = scene;
  const winnerLanded = currentRank === 1;

  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas || !winnerLanded || reducedMotion) return;

    let disposed = false;
    let reset: (() => void) | undefined;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (disposed) return;
      const instance = confetti.create(canvas, { resize: true, useWorker: false });
      reset = instance.reset;
      void instance(WINNER_CONFETTI_OPTIONS);
    }).catch(() => console.error(JSON.stringify({ event: "illustration.confetti_unavailable" })));
    return () => {
      disposed = true;
      reset?.();
    };
  }, [reducedMotion, winnerLanded]);

  useEffect(() => {
    const viewport = resultsViewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const nextHeight = viewport.getBoundingClientRect().height;
      setResultsHeight((currentHeight) => currentHeight === 0 || !winnerLanded ? nextHeight : currentHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [winnerLanded]);

  const resultGap = 6;
  const baseResultHeight = Math.min(70, Math.max(32, (resultsHeight - resultGap * 3) / 4));
  const resultStride = baseResultHeight + resultGap;
  const resultStackOffset = resultStride * 16;
  const winnerStartOffset = resultStride * 3;
  const resultsReady = resultsVisible && resultsHeight > 0;

  return <div ref={containerRef} data-optimization-animation className="relative grid h-full min-h-0 min-w-0 w-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)]">
    {winnerLanded && !reducedMotion ? <canvas ref={confettiRef} data-optimization-confetti aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -inset-y-10 z-40 h-[calc(100%+5rem)] w-[calc(100%+5rem)]" /> : null}
    <div>
      <div className="flex min-w-0 min-h-11 items-center gap-3 rounded-full border border-line bg-white px-4 shadow-[0_2px_8px_rgb(0_0_0/.06)] max-[640px]:min-h-9 max-[640px]:gap-2 max-[640px]:px-3">
        <Search className="size-4 shrink-0 text-neutral-400" strokeWidth={1.8} />
        <span className="min-w-0 truncate text-[clamp(.72rem,1.25vw,.875rem)] text-neutral-900">
          {copy.query.slice(0, typedLength)}
          {typedLength < copy.query.length ? <motion.span className="ml-px inline-block h-[1em] w-px translate-y-[.12em] bg-brand-500" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} /> : null}
        </span>
      </div>
      <motion.div className="mt-3 flex items-center justify-between px-1 text-[clamp(.58rem,1vw,.7rem)] text-neutral-400 max-[640px]:mt-2" initial={false} animate={{ opacity: resultsVisible ? 1 : 0 }} transition={{ duration: 0.24 }}><span>{copy.resultLabel}</span><span>{copy.rankLabel}</span></motion.div>
    </div>

    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <motion.div data-optimization-top-ranked className="relative min-h-0 shrink-0 overflow-visible text-[clamp(.5rem,.85vw,.64rem)] font-semibold uppercase tracking-[.16em] text-[#b9780d]" initial={false} animate={{ height: winnerLanded ? WINNER_BADGE_HEIGHT : 0 }} transition={{ height: { duration: reducedMotion ? 0 : WINNER_BADGE_DURATION, ease: OFFER_EASE_OUT } }}>
        <motion.div className="pointer-events-none absolute inset-x-1 top-0 flex h-8 items-end gap-2 pt-1 max-[640px]:gap-1.5" initial={false} animate={{ opacity: winnerLanded ? 1 : 0 }} transition={{ delay: reducedMotion ? 0 : 0.24, duration: reducedMotion ? 0 : 0.2, ease: OFFER_EASE_OUT }}>
          <span className="mb-1.5 h-px min-w-3 flex-1 bg-[#e8c77f] max-[640px]:mb-1" />
          <span className="flex shrink-0 flex-col items-center leading-none"><Crown data-optimization-top-ranked-icon className="size-4 text-[#b9780d] max-[640px]:size-3.5" strokeWidth={1.8} aria-hidden="true" /><span data-optimization-top-ranked-label className="mt-0.5 whitespace-nowrap">{copy.topRankedLabel}</span></span>
          <span className="mb-1.5 h-px min-w-3 flex-1 bg-[#e8c77f] max-[640px]:mb-1" />
        </motion.div>
      </motion.div>
      <motion.div ref={resultsViewportRef} data-optimization-results className="relative mt-2 min-h-0 min-w-0 w-full flex-1 overflow-hidden" initial={false} animate={{ opacity: resultsReady ? 1 : 0, y: resultsReady ? 0 : 6 }} transition={{ duration: 0.32, ease: OFFER_EASE_OUT }}>
        <div className="absolute inset-y-0 inset-x-px min-w-0 overflow-hidden">
          <motion.ol className="absolute inset-x-0 top-0 m-0 grid min-w-0 list-none gap-1.5 overflow-hidden p-0 transform-gpu will-change-transform [backface-visibility:hidden]" initial={false} animate={{ y: flightStarted ? 0 : -resultStackOffset }} transition={{ y: { duration: reducedMotion || !flightStarted ? 0 : OPTIMIZATION_FLIGHT_DURATION_MS / 1000, ease: [0.9, 0, 0.1, 1] } }}>
            {Array.from({ length: 20 }, (_, index) => {
              const placement = currentRank === 1 && index === 1 ? "bg-[#f3f6fb] shadow-[inset_0_0_0_1px_#cbd4e1]" : currentRank === 1 && index === 2 ? "bg-[#fff5ef] shadow-[inset_0_0_0_1px_#efb993]" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]";
              const badge = currentRank === 1 && index === 1 ? "bg-[#dce4ef] text-[#18345f] shadow-[inset_0_0_0_1px_#bcc8d8]" : currentRank === 1 && index === 2 ? "bg-[#f5dfd2] text-[#8f3e1c] shadow-[inset_0_0_0_1px_#e8b99f]" : "bg-neutral-100 text-neutral-400";
              const primaryText = currentRank === 1 && index === 1 ? "text-[#18345f]" : currentRank === 1 && index === 2 ? "text-[#49372e]" : "text-neutral-600";
              const secondaryText = currentRank === 1 && index === 1 ? "text-[#53667f]" : currentRank === 1 && index === 2 ? "text-[#76594b]" : "text-neutral-500";
              return <li className={`grid min-w-0 grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-3 overflow-hidden rounded-lg px-3 py-2 transition-[height,background,box-shadow,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] max-[640px]:grid-cols-[minmax(0,1fr)_2rem] max-[640px]:gap-2 max-[640px]:py-0 ${placement} ${index === 19 || (winnerLanded && index === 0) ? "opacity-0" : ""}`} style={{ height: baseResultHeight }} key={index}>
                <span className="min-w-0 overflow-hidden"><span className="flex min-w-0 items-baseline gap-2 max-[640px]:gap-1.5"><span className={`min-w-0 truncate text-[clamp(.76rem,1.3vw,.92rem)] leading-tight font-semibold max-[640px]:text-[.68rem] ${primaryText}`}>{resultNames[index] ?? "Suchio"}</span><span className={`max-w-[45%] shrink-0 truncate text-[clamp(.55rem,.85vw,.64rem)] leading-tight font-normal max-[640px]:max-w-[42%] max-[640px]:text-[.5rem] ${secondaryText}`}>{resultSites[index] ?? "suchio"}</span></span><span data-optimization-description className={`mt-1 block truncate text-[clamp(.62rem,1vw,.72rem)] leading-tight max-[640px]:hidden ${secondaryText}`}>{copy.descriptions[index % copy.descriptions.length]}</span></span>
                <span className={`grid size-9 place-items-center rounded-full font-mono text-[clamp(.62rem,1vw,.72rem)] tabular-nums transition-colors duration-300 max-[640px]:size-8 ${badge}`}>{index + 1}</span>
              </li>;
            })}
          </motion.ol>
        </div>

        <motion.div data-optimization-winner className="absolute inset-x-px top-0 z-10 min-w-0 transform-gpu will-change-transform [backface-visibility:hidden]" initial={false} animate={{ y: flightStarted ? 0 : winnerStartOffset }} style={{ height: baseResultHeight }} transition={{ y: { duration: reducedMotion || !flightStarted ? 0 : OPTIMIZATION_FLIGHT_DURATION_MS / 1000, ease: [0.9, 0, 0.1, 1] } }}>
          <div className={`absolute inset-0 z-10 rounded-lg border transition-[background,border-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${winnerLanded ? "border-[#e3cfaa] bg-[#fdf7eb]" : "border-line-strong bg-white"}`} />
          <div className="absolute inset-0 z-30 grid min-w-0 grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-3 overflow-hidden px-3 py-2 transition-[padding] duration-500 ease-[cubic-bezier(.16,1,.3,1)] max-[640px]:grid-cols-[minmax(0,1fr)_2rem] max-[640px]:gap-2 max-[640px]:py-0">
            <div className="min-w-0 overflow-hidden"><div className="flex min-w-0 items-baseline gap-2"><span className={`truncate text-[clamp(.76rem,1.3vw,.92rem)] font-semibold transition-colors duration-300 max-[640px]:text-[.7rem] ${winnerLanded ? "text-[#342a1f]" : "text-neutral-900"}`}>Suchio</span><span className={`truncate text-[clamp(.62rem,1vw,.72rem)] transition-colors duration-300 max-[640px]:text-[.55rem] ${winnerLanded ? "text-[#796b58]" : "text-neutral-500"}`}>suchio</span></div><p className={`mt-1 mb-0 truncate leading-tight transition-colors duration-300 max-[640px]:hidden ${winnerLanded ? "text-[#796b58] text-[clamp(.64rem,1vw,.74rem)]" : "text-neutral-500 text-[clamp(.62rem,1vw,.72rem)]"}`}>{copy.winnerDescription}</p></div>
            <span className={`grid size-9 place-items-center rounded-full font-mono text-[clamp(.68rem,1.1vw,.78rem)] font-medium tabular-nums transition-[color,background,box-shadow] duration-300 max-[640px]:size-8 ${winnerLanded ? "bg-[#f0dfbf] text-[#5f4727] shadow-[inset_0_0_0_1px_#d4b984]" : "bg-neutral-100 text-neutral-500"}`}>{currentRank}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </div>;
}
