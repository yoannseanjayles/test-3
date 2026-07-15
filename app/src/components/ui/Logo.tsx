/** Logotype provisoire Ciné+ (le logomark définitif — play/aperture — arrive avec le lot médias reporté, D24). */
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg aria-hidden width="26" height="26" viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="12" fill="none" stroke="var(--accent-brand)" strokeWidth="2" />
        <path d="M10.5 8.5v9l7-4.5-7-4.5Z" fill="var(--accent-brand)" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-primary">
        Ciné<span className="text-brand">+</span>
      </span>
    </span>
  );
}
