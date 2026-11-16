export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="animate-typing-dot size-1.5 rounded-full bg-current" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}

/** Floating pill above the composer; absolutely positioned so it never shifts the message list. */
export function TypingIndicator({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <div role="status" className="pointer-events-none absolute -top-9 left-4 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-fg-muted shadow-sm">
      <TypingDots />
      {label}
    </div>
  );
}
