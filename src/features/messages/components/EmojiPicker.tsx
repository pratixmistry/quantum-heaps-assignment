import { useEffect, useRef } from 'react';
import { EMOJIS } from '../constants';

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

/** Dependency-free emoji grid; a full picker library would be overkill for this scope. */
export function EmojiPicker({ onPick, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => !ref.current?.parentElement?.contains(e.target as Node) && onClose();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Emoji picker"
      className="animate-slide-up absolute bottom-full left-0 z-30 mb-2 grid w-[min(20rem,calc(100vw-2rem))] grid-cols-8 gap-0.5 rounded-2xl border border-line bg-surface p-2 shadow-xl"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={emoji}
          onClick={() => onPick(emoji)}
          className="flex aspect-square items-center justify-center rounded-lg text-xl hover:bg-elevated"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
