import { useRef, useState } from 'react';
import { Copy, MoreHorizontal, Pencil, Reply, SmilePlus, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
import { cn } from '@/utils/cn';
import { QUICK_REACTIONS } from '../constants';
import type { useMessageActions } from '../hooks/useMessageActions';

interface MessageToolbarProps {
  actions: ReturnType<typeof useMessageActions>;
  hasText: boolean;
  visible: boolean;
}

/** Hover / tap toolbar: react, reply, and an overflow menu. Pops upward unless near the top of the viewport. */
export function MessageToolbar({ actions, hasText, visible }: MessageToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [placeUp, setPlaceUp] = useState(true);
  const [picking, setPicking] = useState(false);
  const { isOwn } = actions;

  const measure = () => setPlaceUp((ref.current?.getBoundingClientRect().top ?? 999) > 280);
  const popup = cn(placeUp ? 'bottom-full mb-1' : 'top-full mt-1', isOwn ? 'right-0' : 'left-0');

  return (
    <div
      ref={ref}
      onPointerEnter={measure}
      onFocus={measure}
      onBlur={(e) => !ref.current?.contains(e.relatedTarget) && setPicking(false)}
      className={cn(
        'absolute -top-4 z-20 flex items-center rounded-full border border-line bg-surface p-0.5 shadow-lg transition-opacity',
        isOwn ? 'right-1' : 'left-1',
        visible || picking ? 'opacity-100' : 'pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100',
      )}
    >
      <div className="relative">
        <IconButton label="Add reaction" size="sm" onClick={() => setPicking((p) => !p)} aria-expanded={picking}>
          <SmilePlus />
        </IconButton>
        {picking && (
          <div role="group" aria-label="Pick a reaction" className={cn('animate-slide-up absolute z-30 flex gap-0.5 rounded-full border border-line bg-surface p-1 shadow-xl', popup)}>
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`React with ${emoji}`}
                onClick={() => {
                  actions.react(emoji);
                  setPicking(false);
                }}
                className="flex size-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-110 hover:bg-elevated"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      <IconButton label="Reply" size="sm" onClick={actions.reply}>
        <Reply />
      </IconButton>
      <Menu
        popupClassName={popup}
        items={[
          { label: 'Copy text', icon: <Copy />, onSelect: actions.copy, hidden: !hasText },
          { label: 'Edit', icon: <Pencil />, onSelect: actions.edit, hidden: !actions.canEdit },
          { label: 'Delete', icon: <Trash2 />, onSelect: actions.remove, destructive: true, hidden: !isOwn },
        ]}
        trigger={(props) => (
          <IconButton label="More message actions" size="sm" {...props}>
            <MoreHorizontal />
          </IconButton>
        )}
      />
    </div>
  );
}
