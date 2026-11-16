import { Modal } from '@/components/ui/Modal';
import { SHORTCUTS } from '@/hooks/useGlobalShortcuts';
import { useUiStore } from '@/store/uiStore';

export function ShortcutsDialog() {
  const open = useUiStore((s) => s.shortcutsOpen);
  const setOpen = useUiStore((s) => s.setShortcutsOpen);
  return (
    <Modal open={open} title="Keyboard shortcuts" onClose={() => setOpen(false)}>
      <dl className="divide-y divide-line text-sm">
        {SHORTCUTS.map(([keys, description]) => (
          <div key={keys} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-fg-muted">{description}</dt>
            <dd>
              <kbd className="rounded-md border border-line bg-elevated px-2 py-0.5 font-sans text-xs font-medium whitespace-nowrap">{keys}</kbd>
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
