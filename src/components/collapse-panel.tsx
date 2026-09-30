import type { ReactNode } from "react";

type CollapsePanelProps = {
  children: ReactNode;
  expanded: boolean;
  id: string;
  labelledBy: string;
};

export function CollapsePanel({
  children,
  expanded,
  id,
  labelledBy,
}: CollapsePanelProps) {
  return (
    <div
      aria-labelledby={labelledBy}
      className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      id={id}
      inert={!expanded}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
