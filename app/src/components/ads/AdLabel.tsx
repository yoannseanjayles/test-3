/** Étiquette publicitaire non masquable (D25 §4) — contraste AA, position fixe. */
export function AdLabel({ text = "Publicité" }: { text?: "Publicité" | "Sponsorisé" }) {
  return (
    <span className="absolute left-2 top-2 rounded-(--radius-s) bg-ad-label-bg px-1.5 py-0.5 text-[11px] font-semibold text-ad-label-text">
      {text}
    </span>
  );
}
