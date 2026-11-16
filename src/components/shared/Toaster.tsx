import { useEffect } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useFeedbackStore, type Toast } from '@/store/feedbackStore';
import { cn } from '@/utils/cn';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useFeedbackStore((s) => s.dismissToast);
  const Icon = ICONS[toast.tone];

  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="animate-slide-up pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-surface py-2.5 pr-2 pl-3.5 text-sm shadow-xl"
    >
      <Icon
        className={cn('size-4 shrink-0', toast.tone === 'success' && 'text-online', toast.tone === 'error' && 'text-red-500', toast.tone === 'info' && 'text-accent')}
        aria-hidden
      />
      <span className="flex-1">{toast.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)} className="rounded-full p-1 text-fg-muted hover:bg-elevated hover:text-fg">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useFeedbackStore((s) => s.toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-20 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
