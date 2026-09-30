"use client";

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import type { ServiceAnimation as ServiceAnimationDefinition } from "@/lib/service-catalog";
import type { Locale } from "@/lib/i18n";

const WebExperienceAnimation = lazy(() => import("@/components/offer-animations/web-experience-animation").then(({ WebExperienceAnimation: Component }) => ({ default: Component })));
const OptimizationSearchAnimation = lazy(() => import("@/components/offer-animations/optimization-search-animation").then(({ OptimizationSearchAnimation: Component }) => ({ default: Component })));
const CampaignGrowthAnimation = lazy(() => import("@/components/offer-animations/campaign-growth-animation").then(({ CampaignGrowthAnimation: Component }) => ({ default: Component })));
const AutomationFlowAnimation = lazy(() => import("@/components/offer-animations/automation-flow-animation").then(({ AutomationFlowAnimation: Component }) => ({ default: Component })));

export function OfferAnimation({ animation, locale }: { animation: ServiceAnimationDefinition; locale: Locale }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin: "400px 0px" });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      <AnimationBoundary key={animation.type} type={animation.type}>
        {ready ? <Suspense fallback={<StaticOfferVisual type={animation.type} />}>{renderDeferredAnimation(animation, locale)}</Suspense> : <StaticOfferVisual type={animation.type} />}
      </AnimationBoundary>
    </div>
  );
}

class AnimationBoundary extends Component<{ children: ReactNode; type: ServiceAnimationDefinition["type"] }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {
    console.error(JSON.stringify({ event: "illustration.failed", illustration: this.props.type }));
  }
  render() {
    return this.state.failed ? <StaticOfferVisual type={this.props.type} failed /> : this.props.children;
  }
}

// Inline geometry remains available without JavaScript or downloaded illustration chunks.
function StaticOfferVisual({ type, failed = false }: { type: ServiceAnimationDefinition["type"]; failed?: boolean }) {
  return <svg data-offer-fallback={type} data-failed={failed} className="h-full w-full text-brand-500" viewBox="0 0 320 240" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
    {type === "campaign" ? <><path className="text-line-strong" d="M32 32v176h256" /><path d="m40 184 46-18 48 8 48-64 48 12 50-70" /><circle cx="280" cy="52" r="5" /></> :
      type === "automation" ? <><path d="M76 120h40m88 0h40" /><rect x="24" y="94" width="52" height="52" rx="12" /><rect x="116" y="76" width="88" height="88" rx="16" /><rect x="244" y="94" width="52" height="52" rx="12" /><path d="m144 120 12 12 24-24" /></> :
      type === "optimization" ? <><rect x="32" y="32" width="256" height="40" rx="20" /><circle cx="54" cy="50" r="7" /><path d="m59 56 5 5M88 52h136" />{[96, 144, 192].map(y => <g key={y}><rect className="text-line-strong" x="32" y={y} width="256" height="32" rx="8" /><path d={`M48 ${y + 16}h${y === 96 ? 160 : 112}`} /></g>)}</> :
      <><rect className="text-line-strong" x="24" y="36" width="272" height="168" rx="12" /><path d="M24 68h272M44 52h28M48 104h100M48 124h76" /><rect x="48" y="152" width="64" height="24" rx="12" /><rect x="184" y="92" width="88" height="84" rx="8" /></>}
  </svg>;
}

function renderDeferredAnimation(animation: ServiceAnimationDefinition, locale: Locale) {
  switch (animation.type) {
    case "web-experience": return <WebExperienceAnimation copy={animation.copy} />;
    case "optimization": return <OptimizationSearchAnimation copy={animation.copy} />;
    case "campaign": return <CampaignGrowthAnimation copy={animation.copy} locale={locale} />;
    case "automation": return <AutomationFlowAnimation copy={animation.copy} />;
    default: {
      const exhaustive: never = animation;
      return exhaustive;
    }
  }
}
