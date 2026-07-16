"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { HouseAd } from "@/lib/ads/decision";

/**
 * Rendu d'une créa house ad + mesure (6.2 §5) :
 * impression = visible ≥ 50 % pendant ≥ 1 s (standard MRC), envoyée une fois ;
 * clic tracké au passage. Beacons anonymes (H101), best-effort.
 */

function beacon(name: "ad.impression" | "ad.click", props: Record<string, string>) {
  try {
    const payload = JSON.stringify({ name, props });
    const sent = navigator.sendBeacon?.("/api/events", new Blob([payload], { type: "application/json" }));
    if (!sent) {
      fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* la mesure n'interrompt jamais l'expérience */
  }
}

export function AdCreative({ ad, placement }: { ad: HouseAd; placement: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const sent = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || sent.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            if (!sent.current) {
              sent.current = true;
              beacon("ad.impression", { placement, campaignId: ad.campaignId });
              observer.disconnect();
            }
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ad.campaignId, placement]);

  return (
    <Link
      ref={ref}
      href={ad.href}
      onClick={() => beacon("ad.click", { placement, campaignId: ad.campaignId })}
      className="group flex h-full min-h-[inherit] items-stretch overflow-hidden rounded-(--radius-m)"
    >
      <div className="relative hidden w-56 shrink-0 md:block">
        <Image src={ad.artwork} alt="" fill sizes="224px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-5 pl-6">
        <p className="pt-4 text-lg font-bold md:pt-0 md:text-xl">{ad.headline}</p>
        <p className="text-sm leading-relaxed text-secondary">{ad.body}</p>
        <span className="mt-2 inline-flex w-fit items-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) group-hover:bg-brand-hover">
          {ad.cta} →
        </span>
      </div>
    </Link>
  );
}
