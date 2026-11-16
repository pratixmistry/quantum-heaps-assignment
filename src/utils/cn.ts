/** Tiny className joiner — avoids pulling in clsx for a one-liner. */
export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
