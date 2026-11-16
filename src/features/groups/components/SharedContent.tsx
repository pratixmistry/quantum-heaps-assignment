import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import type { Attachment, Message } from '@/types/chat';
import { formatBytes } from '@/utils/format';

const EMPTY: Message[] = [];

/** Shared media and files, derived from loaded messages (newest first). */
export function SharedContent({ conversationId }: { conversationId: string }) {
  const messages = useChatStore((s) => s.messages[conversationId] ?? EMPTY);

  const { media, files } = useMemo(() => {
    const all: Attachment[] = messages.filter((m) => !m.deleted).flatMap((m) => m.attachments ?? []).reverse();
    return { media: all.filter((a) => a.kind === 'image' && a.url), files: all.filter((a) => !(a.kind === 'image' && a.url)) };
  }, [messages]);

  return (
    <>
      <section className="border-t border-line p-5">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-fg-muted uppercase">Shared media · {media.length}</h3>
        {media.length ? (
          <div className="grid grid-cols-3 gap-1.5">
            {media.map((a) => (
              <img key={a.id} src={a.url} alt={a.name} title={a.name} loading="lazy" className="aspect-square w-full rounded-lg border border-line object-cover" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">No photos shared yet.</p>
        )}
      </section>
      <section className="border-t border-line p-5">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-fg-muted uppercase">Shared files · {files.length}</h3>
        {files.length ? (
          <ul className="space-y-2">
            {files.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <FileText className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{a.name}</span>
                  <span className="text-xs text-fg-muted">{formatBytes(a.size)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">No files shared yet.</p>
        )}
      </section>
    </>
  );
}
