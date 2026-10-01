"use client";

import { serviceIcons } from "@/components/service-icons";
import { serviceStyles } from "@/components/service-styles";

import { ArrowUpRight, ChevronDown, ChevronRight, Languages, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { BrandMark } from "@/components/brand-mark";
import { CollapsePanel } from "@/components/collapse-panel";
import { defaultLocale, localeConfig, locales, type Locale } from "@/i18n/config";
import type { ServiceId } from "@/i18n/services";
import { alternatePath, localizePath } from "@/lib/locale-path";
import { requestRouteScrollTop, scrollToPageTopSmoothly } from "@/lib/route-scroll";
import { rememberLocale } from "@/lib/locale-preference";
import { useHydrated } from "@/components/use-hydrated";

export type SiteHeaderCopy = {
  about: string;
  brandHome: string;
  closeMenu: string;
  contact: string;
  mainMenu: string;
  openMenu: string;
  selectLocale: string;
  services: string;
  siteMenu: string;
};

type SiteHeaderService = {
  id: ServiceId;
  name: string;
  navDescription: string;
  href: string;
};



export function localeSwitchPath(pathname: string, currentLocale: Locale, candidate: Locale) {
  const path = alternatePath(pathname, candidate);
  if (candidate !== defaultLocale || currentLocale === defaultLocale) return path;
  return path === "/" ? `/${defaultLocale}` : `/${defaultLocale}${path}`;
}

function scrollToPageTop(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;

  const destination = new URL(event.currentTarget.href);
  const current = new URL(window.location.href);
  if (destination.pathname === current.pathname && destination.search === current.search && destination.hash === current.hash) {
    event.preventDefault();
    scrollToPageTopSmoothly();
    return;
  }

  requestRouteScrollTop();
}

function LanguageMenu({ dark = false, id, locale, mobile = false, onSelect, pathname, selectLocaleLabel }: { dark?: boolean; id: string; locale: Locale; mobile?: boolean; onSelect?: () => void; pathname: string; selectLocaleLabel: string }) {
  const [open, setOpen] = useState(false);
  const openedByHover = useRef(false);
  const [highlightedLocale, setHighlightedLocale] = useState<Locale | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewLocale = highlightedLocale ?? locale;
  const previewing = previewLocale !== locale;

  return (
    <div
      className={`relative ${mobile ? "ml-auto nav:hidden" : "max-nav:hidden"}`}
      onPointerEnter={mobile ? undefined : (event) => { if (event.pointerType !== "mouse") return; openedByHover.current = !open; setOpen(true); }}
      onPointerLeave={mobile ? undefined : () => { setOpen(false); setHighlightedLocale(null); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setHighlightedLocale(null); } }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }}
    >
      <button
        ref={buttonRef}
        className={`header-language inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-control px-3 max-narrow:gap-1 max-narrow:px-2 text-sm font-medium transition-transform duration-150 active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100 ${dark ? "menu-language bg-transparent text-white shadow-dark-surface" : "bg-white text-subtle shadow-surface"}`}
        type="button"
        aria-label={`${selectLocaleLabel}: ${localeConfig[locale].shortLabel}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => { const keepOpen = openedByHover.current; openedByHover.current = false; setOpen((current) => keepOpen || !current); }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          setOpen(true);
          window.setTimeout(() => menuRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus(), 0);
        }}
      >
        <span className={`relative size-[19px] flex-none overflow-hidden ${dark ? "text-white" : "text-ink"}`} aria-hidden="true">
          <Languages className="header-language__icon header-language__icon--out absolute inset-0 size-[19px]" strokeWidth={1.7} />
          <Languages className="header-language__icon header-language__icon--in absolute inset-0 size-[19px] opacity-0 [transform:translate(-6px,6px)_scale(.8)]" strokeWidth={1.7} />
        </span>
        <span className={`relative grid w-[2ch] overflow-hidden font-medium ${dark ? "text-white" : "text-ink"}`} aria-hidden="true">
          <span className={`header-language__code col-start-1 row-start-1 ${previewing ? "opacity-0 [transform:translate(6px,-6px)_scale(.8)]" : "opacity-100"}`}>{localeConfig[locale].shortLabel}</span>
          {previewing ? <span key={previewLocale} className="header-language__code-preview col-start-1 row-start-1">{localeConfig[previewLocale].shortLabel}</span> : null}
        </span>
        <ChevronDown className={`size-3.5 max-narrow:hidden transition-transform duration-200 motion-reduce:transition-none ${dark ? "text-white/60" : "text-subtle"} ${open ? "rotate-180" : ""}`} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <div
        id={id}
        ref={menuRef}
        className={`absolute top-full left-1/2 w-44 -translate-x-1/2 pt-2 transition-[opacity,translate] duration-200 ease-[var(--ease-out)] motion-reduce:duration-0 ${open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className={`rounded-control p-1 ${dark ? "bg-inverse-surface-raised shadow-dark-surface" : "bg-white shadow-floating"}`}>
          {locales.map((candidate) => {
            const active = candidate === locale;
            const highlighted = highlightedLocale === null ? active : highlightedLocale === candidate;
            return <a key={candidate} className={`flex h-9 items-center justify-between gap-6 rounded-inset px-3 text-sm font-medium transition-[background-color,scale] duration-150 active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100 ${dark ? highlighted ? "bg-white/8 text-white" : "text-inverse-muted" : highlighted ? "bg-interaction text-ink" : "text-muted"}`} href={localeSwitchPath(pathname, locale, candidate)} aria-current={active ? "page" : undefined} onPointerEnter={() => setHighlightedLocale(candidate)} onPointerLeave={() => setHighlightedLocale(null)} onFocus={() => setHighlightedLocale(candidate)} onBlur={() => setHighlightedLocale(null)} onClick={(event) => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) rememberLocale(candidate); scrollToPageTop(event); setOpen(false); onSelect?.(); }}><span>{localeConfig[candidate].name}</span><span className={`text-meta font-normal ${dark ? "text-inverse-muted" : "text-subtle"}`} aria-hidden="true">{localeConfig[candidate].shortLabel}</span></a>;
          })}
        </div>
      </div>
    </div>
  );
}



export function SiteHeader({ contactEmail, copy, locale, services, pathname: renderedPathname }: { contactEmail: string; copy: SiteHeaderCopy; locale: Locale; services: readonly SiteHeaderService[]; pathname: string }) {
  // A prerendered error document can be served at any missing URL. Preserve
  // that URL when switching language, just as on the regular static pages.
  const hydrated = useHydrated();
  const pathname = hydrated ? window.location.pathname : renderedPathname;

  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const mobileServicesButtonRef = useRef<HTMLButtonElement>(null);
  const servicesOpenedByHover = useRef(false);
  const closeServicesTimer = useRef<number | undefined>(undefined);
  const isActive = (href: string) => {
    const localized = localizePath(href, locale);
    return pathname === localized || pathname.startsWith(`${localized}/`);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px)");
    const closeOnDesktop = () => {
      if (!desktop.matches) return;
      setOpen(false);
      setMobileServicesOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => {
      const dialog = document.getElementById("site-menu");
      if (!dialog?.contains(document.activeElement)) closeRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (open && mobileServicesOpen) {
          setMobileServicesOpen(false);
          mobileServicesButtonRef.current?.focus();
          return;
        }
        if (servicesOpen) {
          setServicesOpen(false);
          servicesButtonRef.current?.focus();
          return;
        }
        if (!open) return;
        setOpen(false);
        openRef.current?.focus();
        return;
      }
      if (open && event.key === "Tab") {
        const dialog = document.getElementById("site-menu");
        if (!dialog) return;
        const focusables = dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (servicesOpen && !servicesRef.current?.contains(event.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      if (closeServicesTimer.current !== undefined) window.clearTimeout(closeServicesTimer.current);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileServicesOpen, open, servicesOpen]);

  const openServices = () => {
    if (closeServicesTimer.current !== undefined) window.clearTimeout(closeServicesTimer.current);
    setServicesOpen(true);
  };
  const scheduleServicesClose = () => {
    closeServicesTimer.current = window.setTimeout(() => setServicesOpen(false), 120);
  };

  const navItems = [
    { href: "/about", label: copy.about },
    { href: "/contact", label: copy.contact },
  ];
  const servicesActive = pathname.startsWith(localizePath("/services/", locale));
  return (
    <>
      <header data-navigation-enhanced className="fixed left-1/2 z-50 flex w-max -translate-x-1/2 items-center gap-2 max-nav:right-4 max-nav:left-4 max-nav:w-auto max-nav:[translate:none] max-narrow:gap-1" style={{ top: "max(1.5rem, env(safe-area-inset-top))" }}>
        <a href={localizePath("/", locale)} onClick={scrollToPageTop} className="group/brand inline-flex min-w-0 h-11 items-center justify-center rounded-control bg-white px-4.5 max-narrow:px-2 shadow-surface transition-[transform,box-shadow] duration-150 hover:shadow-surface-hover active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100" aria-label={copy.brandHome}><BrandMark /></a>
        <nav className="relative inline-flex h-11 items-center justify-center gap-px rounded-control bg-white p-1 shadow-surface max-nav:hidden" aria-label={copy.mainMenu}>
          <div
            ref={servicesRef}
            className="relative"
            onPointerEnter={(event) => { if (event.pointerType !== "mouse") return; servicesOpenedByHover.current = !servicesOpen; openServices(); }}
            onPointerLeave={scheduleServicesClose}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setServicesOpen(false); }}
          >
            <button
              ref={servicesButtonRef}
              className={`relative z-1 inline-flex h-9 cursor-pointer items-center gap-1 rounded-inset px-3.5 text-sm font-medium transition-[color,background-color,scale] duration-150 active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100 ${servicesActive || servicesOpen ? "bg-interaction text-ink" : "text-muted hover:bg-interaction hover:text-ink"}`}
              type="button"
              aria-expanded={servicesOpen}
              aria-controls="services-menu"
              onClick={() => { const keepOpen = servicesOpenedByHover.current; servicesOpenedByHover.current = false; setServicesOpen((current) => keepOpen || !current); }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setServicesOpen(true);
                  window.setTimeout(() => servicesRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus(), 0);
                }
              }}
            >
              {copy.services}
              <ChevronDown className={`size-3.5 max-narrow:hidden transition-transform duration-200 motion-reduce:transition-none ${servicesOpen ? "rotate-180" : ""}`} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div
              id="services-menu"
              className={`absolute top-full left-1/2 w-[35rem] -translate-x-1/2 pt-3 transition-[opacity,translate] duration-200 ease-[var(--ease-out)] will-change-[opacity,translate] motion-reduce:duration-0 ${servicesOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
              aria-hidden={!servicesOpen}
              inert={!servicesOpen}
            >
              <div className="grid grid-cols-2 gap-1.5 rounded-shell bg-white p-2 shadow-floating">
                {services.map((service) => {
                  const Icon = serviceIcons[service.id];
                  const active = pathname === service.href;
                  const styles = serviceStyles[service.id];
                  return <a className={`group/service flex min-w-0 gap-3 rounded-inset p-3.5 transition-colors duration-150 ${active ? styles.background : "hover:bg-interaction"}`} href={service.href} aria-current={active ? "page" : undefined} onClick={(event) => { scrollToPageTop(event); setServicesOpen(false); }} key={service.id}><span className={`grid size-9 shrink-0 place-items-center rounded-inset transition-colors duration-150 ${active ? styles.activeIcon : styles.icon}`}><Icon className="size-4.5" strokeWidth={1.7} aria-hidden="true" /></span><span className="min-w-0"><strong className="block text-sm font-semibold text-ink">{service.name}</strong><span className="mt-1 block text-meta leading-snug text-muted">{service.navDescription}</span></span></a>;
                })}
              </div>
            </div>
          </div>
          {navItems.map((item) => <a key={item.href} href={localizePath(item.href, locale)} onClick={scrollToPageTop} className={`relative z-1 inline-flex h-9 items-center rounded-inset px-3.5 text-sm font-medium transition-[color,background-color,scale] duration-150 active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100 ${isActive(item.href) ? "bg-interaction text-ink" : "text-muted hover:bg-interaction hover:text-ink"}`} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</a>)}
        </nav>
        <LanguageMenu id="desktop-language-menu" locale={locale} pathname={pathname} selectLocaleLabel={copy.selectLocale} />
        <LanguageMenu id="mobile-language-menu" locale={locale} mobile pathname={pathname} selectLocaleLabel={copy.selectLocale} />
        <button ref={openRef} className="inline-flex size-[44px] shrink-0 items-center justify-center rounded-control bg-white shadow-surface transition-[transform,box-shadow] duration-150 hover:shadow-surface-hover active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100 nav:hidden" type="button" onClick={() => { setMobileServicesOpen(false); setOpen(true); }} aria-label={copy.openMenu} aria-expanded={open} aria-controls="site-menu"><Menu className="w-[17px]" strokeWidth={1.7} aria-hidden="true" /></button>
      </header>
      <div id="site-menu" className={`fixed inset-0 z-100 flex flex-col overscroll-contain bg-inverse-surface text-white transition-[opacity,translate] duration-300 ease-[var(--ease-out)] will-change-[opacity,translate] nav:hidden max-nav:overflow-y-auto motion-reduce:transition-none ${open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`} style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))", paddingRight: "max(var(--spacing-menu), env(safe-area-inset-right))", paddingBottom: "max(2rem, env(safe-area-inset-bottom))", paddingLeft: "max(var(--spacing-menu), env(safe-area-inset-left))" }} aria-hidden={!open} inert={!open} role="dialog" aria-modal="true" aria-label={copy.siteMenu}>
        <div className="menu-top fixed right-4 left-4 z-2 flex items-center gap-2" style={{ top: "max(1.5rem, env(safe-area-inset-top))" }}>
          <a href={localizePath("/", locale)} onClick={(event) => { scrollToPageTop(event); setOpen(false); }} className="group/brand inline-flex min-w-0 h-11 items-center rounded-control bg-inverse-surface px-4.5 shadow-dark-surface transition-[background-color,scale] duration-150 hover:bg-white/8 active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100"><BrandMark inverse /></a>
          <LanguageMenu dark id="mobile-menu-language-menu" locale={locale} mobile onSelect={() => setOpen(false)} pathname={pathname} selectLocaleLabel={copy.selectLocale} />
          <button ref={closeRef} type="button" className="grid size-11 place-items-center rounded-control bg-transparent text-white shadow-dark-surface transition-[background-color,scale] duration-150 hover:bg-white/8 active:scale-[.96] motion-reduce:transition-none motion-reduce:active:scale-100" onClick={() => { setMobileServicesOpen(false); setOpen(false); openRef.current?.focus(); }} aria-label={copy.closeMenu}><X className="w-[19px]" strokeWidth={1.7} aria-hidden="true" /></button>
        </div>
        <nav className="menu-links my-auto flex flex-col self-stretch py-24 max-nav:w-full max-nav:max-w-[44rem]" aria-label={copy.mainMenu}>
          <div>
            <button
              ref={mobileServicesButtonRef}
              id="mobile-services-button"
              className="grid min-h-16 w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center border-b border-inverse-line bg-transparent px-0 py-2.5 text-left text-heading-md transition-colors duration-150 hover:bg-white/8"
              type="button"
              aria-expanded={mobileServicesOpen}
              aria-controls="mobile-services-menu"
              onClick={() => setMobileServicesOpen((current) => !current)}
              tabIndex={open ? 0 : -1}
            >
              <span className="text-meta tabular-nums text-inverse-muted" aria-hidden="true">01</span>
              <span>{copy.services}</span>
              <span className="grid size-6 place-items-center justify-self-end" aria-hidden="true">
                <ChevronRight className={`size-5 transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${mobileServicesOpen ? "rotate-90" : ""}`} strokeWidth={1.7} />
              </span>
            </button>
            <CollapsePanel id="mobile-services-menu" labelledBy="mobile-services-button" expanded={mobileServicesOpen}>
              {services.map((service) => {
                const active = pathname === service.href;
                return <a key={service.id} className="group/menu-link grid min-h-14 grid-cols-[minmax(0,1fr)_1.5rem] items-center border-b border-inverse-line py-2 pl-8 text-heading-sm transition-colors duration-150 hover:bg-white/8" href={service.href} aria-current={active ? "page" : undefined} onClick={(event) => { scrollToPageTop(event); setMobileServicesOpen(false); setOpen(false); }} tabIndex={open && mobileServicesOpen ? 0 : -1}><span>{service.name}</span><ArrowUpRight className="w-5 justify-self-end transition-transform duration-250 ease-[var(--ease-out)] group-hover/menu-link:translate-x-1 group-hover/menu-link:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none" strokeWidth={1.7} aria-hidden="true" /></a>;
              })}
            </CollapsePanel>
          </div>
          {navItems.map((item, index) => <a key={item.href} className="group/menu-link grid min-h-16 grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center border-b border-inverse-line py-2.5 text-heading-md transition-colors duration-150 hover:bg-white/8" href={localizePath(item.href, locale)} onClick={(event) => { scrollToPageTop(event); setMobileServicesOpen(false); setOpen(false); }} tabIndex={open ? 0 : -1}><span className="text-meta tabular-nums text-inverse-muted">{String(index + 2).padStart(2, "0")}</span><span>{item.label}</span><ArrowUpRight className="w-6 justify-self-end transition-transform duration-250 ease-[var(--ease-out)] group-hover/menu-link:translate-x-1 group-hover/menu-link:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none" strokeWidth={1.7} aria-hidden="true" /></a>)}
        </nav>
        <div className="menu-bottom flex items-center justify-end text-meta text-inverse-muted max-narrow:flex-col max-narrow:items-start max-narrow:gap-5"><a className="transition-colors duration-150 hover:text-white" href={`mailto:${contactEmail}`}>{contactEmail}</a></div>
      </div>
    </>
  );
}
