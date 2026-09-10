export function EditorialHero({ title, copy, children }: { title: string; copy?: string; children?: React.ReactNode }) {
  return (
    <section className="editorial-hero grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] [place-items:start_center] px-page pt-page-title pb-section-compact">
      <div className="editorial-hero-grid reveal flex min-w-0 w-full flex-col items-center gap-4 text-center max-nav:gap-6" data-reveal>
        <h1 className="m-0 mx-auto w-full max-w-[18ch] text-display-sm text-balance">{title}</h1>
        {copy && <p className="mx-auto max-w-[48rem] text-lead text-muted text-balance">{copy}</p>}
        {children}
      </div>
    </section>
  );
}
