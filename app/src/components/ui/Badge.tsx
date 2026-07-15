type Tone = "free" | "new" | "neutral" | "license";

const tones: Record<Tone, string> = {
  free: "bg-brand text-on-brand",
  new: "bg-violet text-white",
  neutral: "bg-surface-overlay text-secondary",
  license: "bg-surface-overlay text-secondary",
};

/** Badges de cartes et fiches : Gratuit ▶, Nouveau, licence… (D25 §3) */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-(--radius-s) px-1.5 py-0.5 text-[11px] font-semibold leading-4 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
