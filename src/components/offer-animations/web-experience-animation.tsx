"use client";

import { useEffect, useId, useRef } from "react";
import type { WebExperienceAnimationCopy } from "@/i18n/services";

type SceneVariant = "desktop" | "phone";
type RectGeometry = { x: number; y: number; width: number; height: number };
type SceneGeometry = {
  device: RectGeometry & { rx: number };
  divider: RectGeometry;
  urlCenterY: number;
  accent: RectGeometry;
  headline: { x: number; y: number };
  primaryLine: RectGeometry;
  secondaryLine: RectGeometry;
  cta: { x: number; y: number };
  imageBounds: RectGeometry;
  cards: {
    back: RectGeometry;
    middle: RectGeometry;
    front: RectGeometry;
  };
  frontCard: {
    innerX: number;
    innerY: number;
    innerWidth: number;
    blueHeight: number;
    firstLineY: number;
    secondLineY: number;
    firstLineWidth: number;
    secondLineWidth: number;
  };
};

const SCENES: Record<SceneVariant, SceneGeometry> = {
  desktop: {
    device: { x: 20, y: 54, width: 460, height: 342, rx: 14 },
    divider: { x: 20, y: 88.2, width: 460, height: 1 },
    urlCenterY: 71.1,
    accent: { x: 52.5, y: 162, width: 37, height: 6 },
    headline: { x: 52.5, y: 204 },
    primaryLine: { x: 52.5, y: 247.5, width: 142.5, height: 6 },
    secondaryLine: { x: 52.5, y: 263.25, width: 105, height: 6 },
    cta: { x: 52.5, y: 290 },
    imageBounds: { x: 277.5, y: 148.5, width: 157.5, height: 162 },
    cards: {
      back: { x: 327.9, y: 158.22, width: 100.8, height: 110.16 },
      middle: { x: 283.8, y: 193.86, width: 100.8, height: 110.16 },
      front: { x: 312.15, y: 171.18, width: 100.8, height: 116.64 },
    },
    frontCard: {
      innerX: 322.15,
      innerY: 183.18,
      innerWidth: 80.8,
      blueHeight: 36,
      firstLineY: 225,
      secondLineY: 235,
      firstLineWidth: 63,
      secondLineWidth: 45,
    },
  },
  phone: {
    device: { x: 170, y: 22.5, width: 160, height: 405, rx: 34 },
    divider: { x: 170, y: 63, width: 160, height: 1 },
    urlCenterY: 42.75,
    accent: { x: 190, y: 94.5, width: 37, height: 6 },
    headline: { x: 190, y: 128 },
    primaryLine: { x: 190, y: 162, width: 120, height: 6 },
    secondaryLine: { x: 190, y: 180, width: 100, height: 6 },
    cta: { x: 190, y: 208 },
    imageBounds: { x: 190, y: 261, width: 120, height: 123.3 },
    cards: {
      back: { x: 228.4, y: 268.4, width: 76.8, height: 83.84 },
      middle: { x: 194.8, y: 295.52, width: 76.8, height: 83.84 },
      front: { x: 216.4, y: 278.26, width: 76.8, height: 88.78 },
    },
    frontCard: {
      innerX: 224.4,
      innerY: 287.26,
      innerWidth: 60.8,
      blueHeight: 27,
      firstLineY: 319,
      secondLineY: 327,
      firstLineWidth: 47,
      secondLineWidth: 34,
    },
  },
};

const TIMELINE_DURATION = 2_800;
const FRAME_BUILT = 0.13;
const MORPH_START = 0.39;
const INITIAL_DEVICE = { x: 210, y: 202.5, width: 80, height: 45, rx: 8 };
const REVEALS = [
  { selector: '[data-web-experience-reveal="chrome"]', delay: 364, duration: 180 },
  { selector: '[data-web-experience-part="accent"]', delay: 364, duration: 336 },
  { selector: '[data-web-experience-card="back"]', delay: 364, duration: 336 },
  { selector: '[data-web-experience-part="headline"]', delay: 476, duration: 336 },
  { selector: '[data-web-experience-card="middle"]', delay: 532, duration: 336 },
  { selector: '[data-web-experience-part="primary-line"]', delay: 644, duration: 336 },
  { selector: '[data-web-experience-card="front"]', delay: 700, duration: 336 },
  { selector: '[data-web-experience-part="secondary-line"]', delay: 756, duration: 336 },
  { selector: '[data-web-experience-part="cta"]', delay: 840, duration: 252 },
] as const;

export function WebExperienceAnimation({ copy }: { copy: WebExperienceAnimationCopy }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clipId = `web-experience-${useId().replaceAll(":", "")}`;

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!container) return;

    let observer: IntersectionObserver | undefined;
    let started = false;

    const finishForReducedMotion = ({ matches }: MediaQueryListEvent) => {
      if (!matches) return;
      started = true;
      observer?.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      renderFrame(container, 1);
    };

    const start = () => {
      if (started) return;
      started = true;
      observer?.disconnect();
      if (reducedMotion.matches) {
        renderFrame(container, 1);
        return;
      }

      let startedAt: number | null = null;
      const tick = (timestamp: number) => {
        startedAt ??= timestamp;
        const progress = Math.min((timestamp - startedAt) / TIMELINE_DURATION, 1);
        renderFrame(container, progress);
        animationFrameRef.current = progress < 1 ? requestAnimationFrame(tick) : null;
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      start();
    } else {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
      }, { rootMargin: "120px 0px", threshold: 0.15 });
      observer.observe(container);
    }

    reducedMotion.addEventListener("change", finishForReducedMotion);
    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener("change", finishForReducedMotion);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="isolate relative h-full min-h-0 w-full overflow-hidden"
    >
      <Scene clipId={clipId} copy={copy} />
    </div>
  );
}

function renderFrame(container: HTMLDivElement, progress: number) {
  const desktop = SCENES.desktop;
  const phone = SCENES.phone;
  const morphProgress = progress <= MORPH_START
    ? 0
    : easeInOut((progress - MORPH_START) / (1 - MORPH_START));
  const scene = interpolateScene(desktop, phone, morphProgress);
  const device = progress < FRAME_BUILT
    ? interpolateDevice(INITIAL_DEVICE, desktop.device, easeOut(progress / FRAME_BUILT))
    : progress <= MORPH_START
      ? desktop.device
      : scene.device;

  setRect(find(container, "[data-web-experience-device]"), device);
  setRect(find(container, "[data-web-experience-clip]"), device);
  setRect(find(container, "[data-web-experience-divider]"), scene.divider);
  setRect(find(container, '[data-web-experience-part="accent"] rect'), scene.accent);
  setRect(find(container, '[data-web-experience-part="primary-line"] rect'), scene.primaryLine);
  setRect(find(container, '[data-web-experience-part="secondary-line"] rect'), scene.secondaryLine);
  setRect(find(container, "[data-web-experience-image-bounds]"), scene.imageBounds);
  setRect(find(container, '[data-web-experience-card="back"] rect'), scene.cards.back);
  setRect(find(container, '[data-web-experience-card="middle"] rect'), scene.cards.middle);

  const headline = find(container, "[data-web-experience-headline]");
  setAttribute(headline, "x", scene.headline.x);
  setAttribute(headline, "y", scene.headline.y);
  container.querySelectorAll<SVGTSpanElement>("[data-web-experience-headline] tspan")
    .forEach((line) => setAttribute(line, "x", scene.headline.x));

  const urlBoxY = scene.urlCenterY - 5;
  const urlBaselineY = scene.urlCenterY + 2.45;
  setAttribute(find(container, "[data-web-experience-url-box]"), "y", urlBoxY);
  container.querySelectorAll<SVGTextElement>("[data-web-experience-url] text")
    .forEach((text) => setAttribute(text, "y", urlBaselineY));

  setAttribute(find(container, "[data-web-experience-cta-bg]"), "x", scene.cta.x);
  setAttribute(find(container, "[data-web-experience-cta-bg]"), "y", scene.cta.y);
  setAttribute(find(container, "[data-web-experience-cta-label]"), "x", scene.cta.x + 46);
  setAttribute(find(container, "[data-web-experience-cta-label]"), "y", scene.cta.y + 12);

  const frontRects = container.querySelectorAll<SVGRectElement>('[data-web-experience-card="front"] rect');
  setRect(frontRects.item(0), scene.cards.front);
  setRect(frontRects.item(1), {
    x: scene.frontCard.innerX,
    y: scene.frontCard.innerY,
    width: scene.frontCard.innerWidth,
    height: scene.frontCard.blueHeight,
  });
  setRect(frontRects.item(2), {
    x: scene.frontCard.innerX,
    y: scene.frontCard.firstLineY,
    width: scene.frontCard.firstLineWidth,
    height: 5,
  });
  setRect(frontRects.item(3), {
    x: scene.frontCard.innerX,
    y: scene.frontCard.secondLineY,
    width: scene.frontCard.secondLineWidth,
    height: 5,
  });

  const elapsed = progress * TIMELINE_DURATION;
  for (const { selector, delay, duration } of REVEALS) {
    const element = container.querySelector(selector);
    if (element instanceof SVGElement) {
      element.style.opacity = String(easeOut(clamp((elapsed - delay) / duration)));
    }
  }

  const desktopControls = find(container, "[data-web-experience-desktop-controls]");
  const phoneControls = container.querySelectorAll<SVGElement>(
    "[data-web-experience-notch], [data-web-experience-home-indicator]",
  );
  if (desktopControls) desktopControls.style.opacity = String(1 - easeInOut(clamp((progress - 0.35) / 0.04)));
  phoneControls.forEach((element) => {
    element.style.opacity = String(easeInOut(clamp((progress - 0.72) / 0.28)));
  });
}

function interpolateScene(from: SceneGeometry, to: SceneGeometry, progress: number): SceneGeometry {
  return {
    device: interpolateDevice(from.device, to.device, progress),
    divider: interpolateRect(from.divider, to.divider, progress),
    urlCenterY: interpolate(from.urlCenterY, to.urlCenterY, progress),
    accent: interpolateRect(from.accent, to.accent, progress),
    headline: {
      x: interpolate(from.headline.x, to.headline.x, progress),
      y: interpolate(from.headline.y, to.headline.y, progress),
    },
    primaryLine: interpolateRect(from.primaryLine, to.primaryLine, progress),
    secondaryLine: interpolateRect(from.secondaryLine, to.secondaryLine, progress),
    cta: {
      x: interpolate(from.cta.x, to.cta.x, progress),
      y: interpolate(from.cta.y, to.cta.y, progress),
    },
    imageBounds: interpolateRect(from.imageBounds, to.imageBounds, progress),
    cards: {
      back: interpolateRect(from.cards.back, to.cards.back, progress),
      middle: interpolateRect(from.cards.middle, to.cards.middle, progress),
      front: interpolateRect(from.cards.front, to.cards.front, progress),
    },
    frontCard: {
      innerX: interpolate(from.frontCard.innerX, to.frontCard.innerX, progress),
      innerY: interpolate(from.frontCard.innerY, to.frontCard.innerY, progress),
      innerWidth: interpolate(from.frontCard.innerWidth, to.frontCard.innerWidth, progress),
      blueHeight: interpolate(from.frontCard.blueHeight, to.frontCard.blueHeight, progress),
      firstLineY: interpolate(from.frontCard.firstLineY, to.frontCard.firstLineY, progress),
      secondLineY: interpolate(from.frontCard.secondLineY, to.frontCard.secondLineY, progress),
      firstLineWidth: interpolate(from.frontCard.firstLineWidth, to.frontCard.firstLineWidth, progress),
      secondLineWidth: interpolate(from.frontCard.secondLineWidth, to.frontCard.secondLineWidth, progress),
    },
  };
}

function interpolateDevice(
  from: SceneGeometry["device"],
  to: SceneGeometry["device"],
  progress: number,
): SceneGeometry["device"] {
  return {
    ...interpolateRect(from, to, progress),
    rx: interpolate(from.rx, to.rx, progress),
  };
}

function interpolateRect(from: RectGeometry, to: RectGeometry, progress: number): RectGeometry {
  return {
    x: interpolate(from.x, to.x, progress),
    y: interpolate(from.y, to.y, progress),
    width: interpolate(from.width, to.width, progress),
    height: interpolate(from.height, to.height, progress),
  };
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOut(progress: number) {
  return 1 - (1 - clamp(progress)) ** 3;
}

function easeInOut(progress: number) {
  const value = clamp(progress);
  return value * value * (3 - 2 * value);
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function find(container: HTMLDivElement, selector: string) {
  return container.querySelector<SVGElement>(selector);
}

function setRect(element: SVGElement | null, geometry: RectGeometry & { rx?: number }) {
  setAttribute(element, "x", geometry.x);
  setAttribute(element, "y", geometry.y);
  setAttribute(element, "width", geometry.width);
  setAttribute(element, "height", geometry.height);
  if (geometry.rx !== undefined) setAttribute(element, "rx", geometry.rx);
}

function setAttribute(element: SVGElement | null, name: string, value: number) {
  element?.setAttribute(name, String(value));
}

function Scene({ clipId, copy }: { clipId: string; copy: WebExperienceAnimationCopy }) {
  const scene = SCENES.desktop;
  const { device } = scene;

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      viewBox="0 0 500 450"
    >
      <defs>
        <clipPath id={clipId}>
          <rect data-web-experience-clip {...device} />
        </clipPath>
      </defs>

      <rect
        data-web-experience-device
        fill="white"
        stroke="var(--color-line-strong)"
        vectorEffect="non-scaling-stroke"
        {...device}
      />

      <g clipPath={`url(#${clipId})`}>
        <HeroScene copy={copy} scene={scene} />
      </g>

      <BrowserChrome scene={scene} />
    </svg>
  );
}

function BrowserChrome({ scene }: { scene: SceneGeometry }) {
  const urlBoxY = scene.urlCenterY - 5;
  const urlBaselineY = scene.urlCenterY + 2.45;

  return (
    <g data-web-experience-reveal="chrome" style={{ opacity: 0 }}>
      <rect data-web-experience-divider fill="var(--color-line)" {...scene.divider} />

      <g data-web-experience-desktop-controls>
        {[40, 48, 56].map((cx) => <circle cx={cx} cy="71.1" fill="var(--color-neutral-200)" key={cx} r="3" />)}
      </g>

      <g data-web-experience-url>
        <rect data-web-experience-url-box fill="transparent" height="10" width="76" x="212" y={urlBoxY} />
        <text fill="var(--color-neutral-400)" fontFamily="inherit" fontSize="10" textAnchor="middle" x="250" y={urlBaselineY}>suchio</text>
      </g>

      <rect data-web-experience-notch fill="var(--color-neutral-900)" height="4" rx="2" style={{ opacity: 0 }} width="22.5" x="238.75" y="28.6" />
      <rect data-web-experience-home-indicator fill="var(--color-neutral-900)" height="2" rx="1" style={{ opacity: 0 }} width="32.5" x="233.75" y="420.5" />
    </g>
  );
}

function HeroScene({ copy, scene }: { copy: WebExperienceAnimationCopy; scene: SceneGeometry }) {
  const words = copy.headline.trim().split(/\s+/);
  const secondLine = words.pop() ?? "";
  const firstLine = words.join(" ");

  return (
    <g>
      <g data-web-experience-part="accent" style={{ opacity: 0 }}>
        <rect fill="var(--color-brand-400)" rx="3" {...scene.accent} />
      </g>

      <g data-web-experience-part="headline" style={{ opacity: 0 }}>
        <text data-web-experience-headline fill="var(--color-neutral-900)" fontFamily="inherit" fontSize="18.4" fontWeight="600" x={scene.headline.x} y={scene.headline.y}>
          <tspan x={scene.headline.x}>{firstLine}</tspan>
          <tspan dy="1.03em" x={scene.headline.x}>{secondLine}</tspan>
        </text>
      </g>

      <IllustrationLine geometry={scene.primaryLine} part="primary-line" />
      <IllustrationLine geometry={scene.secondaryLine} part="secondary-line" />
      <InquiryCta copy={copy} geometry={scene.cta} />
      <CardStack scene={scene} />
    </g>
  );
}

function IllustrationLine({ geometry, part }: { geometry: RectGeometry; part: string }) {
  return (
    <g data-web-experience-part={part} style={{ opacity: 0 }}>
      <rect fill="var(--color-neutral-200)" rx="3" {...geometry} />
    </g>
  );
}

function InquiryCta({ copy, geometry }: { copy: WebExperienceAnimationCopy; geometry: { x: number; y: number } }) {
  const width = 92;
  const height = 24;

  return (
    <g data-web-experience-part="cta" style={{ opacity: 0 }}>
      <rect data-web-experience-cta-bg fill="var(--color-neutral-900)" height={height} rx="12" width={width} x={geometry.x} y={geometry.y} />
      <text
        data-web-experience-cta-label
        dominantBaseline="middle"
        fill="white"
        fontFamily="inherit"
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
        textRendering="optimizeLegibility"
        x={geometry.x + width / 2}
        y={geometry.y + height / 2}
      >
        {copy.cta}
      </text>
    </g>
  );
}

function CardStack({ scene }: { scene: SceneGeometry }) {

  return (
    <g data-web-experience-part="image">
      <rect data-web-experience-image-bounds fill="transparent" {...scene.imageBounds} />
      <g data-web-experience-card="back" style={{ opacity: 0 }}>
        <SvgCard fill="var(--color-neutral-100)" geometry={scene.cards.back} stroke="var(--color-neutral-300)" />
      </g>
      <g data-web-experience-card="middle" style={{ opacity: 0 }}>
        <SvgCard fill="white" geometry={scene.cards.middle} stroke="var(--color-line-strong)" />
      </g>
      <g data-web-experience-card="front" style={{ opacity: 0 }}>
        <FrontCard geometry={scene.cards.front} values={scene.frontCard} />
      </g>
    </g>
  );
}

function SvgCard({ fill, geometry, stroke }: { fill: string; geometry: RectGeometry; stroke: string }) {
  return <rect fill={fill} rx="8" stroke={stroke} vectorEffect="non-scaling-stroke" {...geometry} />;
}

function FrontCard({ geometry, values }: { geometry: RectGeometry; values: SceneGeometry["frontCard"] }) {
  return (
    <>
      <rect fill="white" rx="8" stroke="var(--color-brand-400)" vectorEffect="non-scaling-stroke" {...geometry} />
      <rect fill="var(--color-brand-400)" height={values.blueHeight} rx="6" width={values.innerWidth} x={values.innerX} y={values.innerY} />
      <rect fill="var(--color-neutral-200)" height="5" rx="2.5" width={values.firstLineWidth} x={values.innerX} y={values.firstLineY} />
      <rect fill="var(--color-neutral-200)" height="5" rx="2.5" width={values.secondLineWidth} x={values.innerX} y={values.secondLineY} />
    </>
  );
}
