import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function Disclosure({ id, group, title, children, compact = false, defaultOpen = false }: {
  id: string;
  group: string;
  title: string;
  children: ReactNode;
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  const Heading = compact ? "h4" : "h3";
  return (
    <details id={id} name={group} open={defaultOpen} className="group/disclosure border-t border-line last:border-b">
      <summary className={`cursor-pointer list-none rounded-inset px-2 text-left transition-colors duration-150 hover:bg-interaction [&::-webkit-details-marker]:hidden ${compact ? "py-4" : "py-5"}`}>
        <Heading className={`m-0 grid grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-4 ${compact ? "min-h-8 text-base/6 font-semibold" : "min-h-11 text-heading-sm max-narrow:min-h-8"}`}>
          <span>{title}</span>
          <ChevronRight aria-hidden="true" className="size-5 justify-self-end transition-transform duration-200 group-open/disclosure:rotate-90 motion-reduce:transition-none" strokeWidth={1.7} />
        </Heading>
      </summary>
      <div className="max-w-reading px-2 pb-6 text-base/6 text-muted">{children}</div>
    </details>
  );
}
