"use client";

import { ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

export function Disclosure({ id, group, title, children, compact = false, defaultOpen = false }: {
  id: string;
  group: string;
  title: string;
  children: ReactNode;
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const onSummaryClick = useRef<((event: ReactMouseEvent<HTMLElement>) => void) | null>(null);
  useLayoutEffect(() => {
    const details = detailsRef.current;
    const summary = details?.querySelector("summary");
    const content = details?.querySelector<HTMLElement>("[data-disclosure-content]");
    if (!details || !summary || !content || !details.animate) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    let expanded = details.open;
    // Native grouping is retained without JS. Enhanced grouping lets both panels animate.
    details.removeAttribute("name");
    function finish() {
      animation?.cancel();
      animation = undefined;
      details!.open = expanded;
      details!.style.removeProperty("overflow");
    }
    function setExpanded(next: boolean) {
      if (next === expanded) return;
      const start = details!.getBoundingClientRect().height;
      animation?.cancel();
      expanded = next;
      summary!.setAttribute("aria-expanded", String(next));
      content!.inert = !next;
      details!.open = true;
      const border = parseFloat(getComputedStyle(details!).borderTopWidth) + parseFloat(getComputedStyle(details!).borderBottomWidth);
      const end = next ? details!.getBoundingClientRect().height : summary!.getBoundingClientRect().height + border;
      if (motion.matches) { finish(); return; }
      details!.style.overflow = "hidden";
      animation = details!.animate({ height: [`${start}px`, `${end}px`] }, { duration: 240, easing: "cubic-bezier(.16,1,.3,1)" });
      animation.onfinish = finish;
    }
    function onClick(event: ReactMouseEvent<HTMLElement>) {
      event.preventDefault();
      const next = !expanded;
      if (next) document.dispatchEvent(new CustomEvent("suchio:disclosure-open", { detail: { group, id } }));
      setExpanded(next);
    }
    function onGroupOpen(event: Event) {
      const detail: unknown = event instanceof CustomEvent ? event.detail : undefined;
      if (detail && typeof detail === "object" && "group" in detail && "id" in detail && detail.group === group && detail.id !== id) setExpanded(false);
    }
    function onMotionChange() { if (motion.matches) finish(); }
    // React replays an early click after hydration; a DOM listener can lose that click.
    onSummaryClick.current = onClick;
    document.addEventListener("suchio:disclosure-open", onGroupOpen);
    motion.addEventListener("change", onMotionChange);
    return () => {
      finish();
      details.setAttribute("name", group);
      summary.removeAttribute("aria-expanded");
      content.inert = false;
      onSummaryClick.current = null;
      document.removeEventListener("suchio:disclosure-open", onGroupOpen);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [group, id]);
  const Heading = compact ? "h4" : "h3";
  return (
    <details ref={detailsRef} id={id} name={group} open={defaultOpen} className="group/disclosure border-t border-line last:border-b">
      <summary onClick={event => onSummaryClick.current?.(event)} className={`cursor-pointer list-none rounded-inset px-2 text-left transition-colors duration-150 hover:bg-interaction [&::-webkit-details-marker]:hidden ${compact ? "py-4" : "py-5"}`}>
        <Heading className={`m-0 grid grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-4 ${compact ? "min-h-8 text-base/6 font-semibold" : "min-h-11 text-heading-sm max-narrow:min-h-8"}`}>
          <span>{title}</span>
          <ChevronRight aria-hidden="true" className="size-5 justify-self-end transition-transform duration-200 group-open/disclosure:rotate-90 motion-reduce:transition-none" strokeWidth={1.7} />
        </Heading>
      </summary>
      <div data-disclosure-content className="max-w-reading px-2 pb-6 text-base/6 text-muted">{children}</div>
    </details>
  );
}
