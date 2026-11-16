export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#457FFF" />
      <path d="M10 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4.5 3.5V21H10a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" fill="#fff" />
    </svg>
  );
}

/** Wordmark; the mark itself is shown in the nav rail on md+, so it only appears here on mobile. */
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="size-8 md:hidden" />
      <span className="font-display text-lg tracking-tight">
        <span className="font-bold">Quantum</span> Chat
      </span>
    </div>
  );
}
