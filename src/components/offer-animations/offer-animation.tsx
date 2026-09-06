"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
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
    <div ref={containerRef} className="h-full min-h-0 w-full">
      {ready ? <Suspense fallback={null}>{renderDeferredAnimation(animation, locale)}</Suspense> : null}
    </div>
  );
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
