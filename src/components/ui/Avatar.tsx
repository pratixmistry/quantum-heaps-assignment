import { useState } from 'react';
import { Users } from 'lucide-react';
import type { PresenceStatus } from '@/types/chat';
import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-24 text-2xl',
} as const;

const DOT = { sm: 'size-2.5', md: 'size-3', lg: 'size-3.5', xl: 'size-5' } as const;

const STATUS_COLOR: Record<PresenceStatus, string> = {
  online: 'bg-online',
  away: 'bg-highlight',
  offline: 'bg-fg-muted/60',
};

interface AvatarProps {
  name: string;
  src?: string;
  size?: keyof typeof SIZES;
  status?: PresenceStatus;
  isGroup?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = 'md', status, isGroup, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden font-semibold select-none',
          isGroup ? 'rounded-xl bg-accent/15 text-accent' : 'rounded-full bg-elevated text-fg-muted',
          SIZES[size],
        )}
      >
        {showImage ? (
          <img src={src} alt="" className="size-full object-cover" loading="lazy" onError={() => setFailed(true)} />
        ) : isGroup ? (
          <Users className="size-1/2" aria-hidden />
        ) : (
          initials(name)
        )}
      </span>
      {status && (
        <span
          className={cn('absolute right-0 bottom-0 rounded-full ring-2 ring-surface', DOT[size], STATUS_COLOR[status])}
          role="img"
          aria-label={status}
        />
      )}
    </span>
  );
}
