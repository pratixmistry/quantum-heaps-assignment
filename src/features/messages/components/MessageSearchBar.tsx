import { useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { SearchInput } from '@/features/search/components/SearchInput';

interface MessageSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  count: number;
  index: number;
  hasQuery: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function MessageSearchBar({ value, onChange, onClose, count, index, hasQuery, onNext, onPrev }: MessageSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2">
      <SearchInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        label="Search messages"
        placeholder="Search in conversation"
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.shiftKey ? onPrev : onNext)();
          if (e.key === 'Escape' && !value) {
            e.preventDefault(); // handled here; the global Esc handler skips prevented events
            onClose();
          }
        }}
      />
      <span className="w-16 shrink-0 text-center text-xs text-fg-muted tabular-nums" aria-live="polite">
        {hasQuery ? (count ? `${index + 1} of ${count}` : 'No results') : ''}
      </span>
      <IconButton label="Newer match" size="sm" onClick={onPrev} disabled={count < 2}>
        <ChevronDown />
      </IconButton>
      <IconButton label="Older match" size="sm" onClick={onNext} disabled={count < 2}>
        <ChevronUp />
      </IconButton>
      <IconButton label="Close search" size="sm" onClick={onClose}>
        <X />
      </IconButton>
    </div>
  );
}
