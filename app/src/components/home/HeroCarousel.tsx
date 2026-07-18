"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

export interface HeroSlide {
  href: string;
  title: string;
  backdropUrl: string;
  overview: string;
  meta: string | null;
}

const ROTATE_MS = 7000;

/**
 * Hero dynamique de l'accueil — plusieurs titres en rotation (au lieu d'un
 * seul figé pour toute la fenêtre ISR), avec navigation manuelle par points,
 * pause au survol/focus et à l'arrêt si `prefers-reduced-motion`.
 * Rendu serveur : la 1re diapositive s'affiche immédiatement (SEO/LCP intacts),
 * la rotation ne démarre qu'après hydratation.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const announceRef = useRef<HTMLParagraphElement>(null);
  const mounted = useRef(false);

  const goTo = useCallback((i: number) => setIndex(((i % slides.length) + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  // Annonce la diapositive active pour les lecteurs d'écran, sans spammer au montage.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (announceRef.current) {
      announceRef.current.textContent = `Diapositive ${index + 1} sur ${slides.length} : ${slides[index]?.title ?? ""}`;
    }
  }, [index, slides]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-label="À la une"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p ref={announceRef} aria-live="polite" className="sr-only" />
      <div className="relative aspect-[21/9] min-h-[320px] w-full overflow-hidden md:max-h-[560px]">
        {slides.map((slide, i) => (
          <div
            key={slide.href}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-(--ease-enter) ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <Image
              src={slide.backdropUrl}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
      </div>

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 md:px-6 md:pb-12">
        <p className="text-sm font-medium text-brand">À la une cette semaine</p>
        <h1 className="mt-1 max-w-xl text-3xl font-bold md:text-5xl">{slides[index].title}</h1>
        {slides[index].meta && <p className="mt-2 text-sm text-secondary">{slides[index].meta}</p>}
        <p className="mt-2 max-w-lg text-sm text-secondary md:text-base">
          {slides[index].overview.length > 180 ? `${slides[index].overview.slice(0, 180).trimEnd()}…` : slides[index].overview}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="flex gap-3">
            <ButtonLink size="lg" href={slides[index].href}>
              Voir la fiche
            </ButtonLink>
            <ButtonLink size="lg" variant="secondary" href="/tendances">
              Explorer les tendances
            </ButtonLink>
          </div>
          {slides.length > 1 && (
            <div role="tablist" aria-label="Choisir une diapositive" className="flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.href}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Diapositive ${i + 1} sur ${slides.length} : ${slide.title}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-(--duration-fast) ${
                    i === index ? "w-6 bg-brand" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
