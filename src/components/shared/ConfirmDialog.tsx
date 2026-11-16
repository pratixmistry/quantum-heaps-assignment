import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useFeedbackStore } from '@/store/feedbackStore';

/** Renders the single global confirmation requested via `confirm()` from feedbackStore. */
export function ConfirmDialog() {
  const request = useFeedbackStore((s) => s.confirmRequest);
  const resolve = useFeedbackStore((s) => s.resolveConfirm);

  return (
    <Modal open={!!request} title={request?.title ?? ''} onClose={() => resolve(false)}>
      {request?.description && <p className="mb-5 text-sm text-fg-muted">{request.description}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => resolve(false)} autoFocus>
          Cancel
        </Button>
        <Button variant={request?.destructive ? 'danger' : 'primary'} size="sm" onClick={() => resolve(true)}>
          {request?.confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}
