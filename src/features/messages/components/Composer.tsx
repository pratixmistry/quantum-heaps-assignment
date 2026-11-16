import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Paperclip, Pencil, Reply, SendHorizontal, Smile, X } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { useChatStore } from '@/store/chatStore';
import { toast } from '@/store/feedbackStore';
import { useUiStore } from '@/store/uiStore';
import type { Attachment, Conversation } from '@/types/chat';
import { formatBytes } from '@/utils/format';
import { MAX_ATTACHMENT_BYTES, toAttachment } from '../services/attachments';
import { EmojiPicker } from './EmojiPicker';
import { ReplyQuote } from './MessageParts';

interface ComposerForm {
  text: string;
}

export const COMPOSER_ID = 'message-composer';
const MAX_ATTACHMENTS = 5;

export function Composer({ conversation }: { conversation: Conversation }) {
  const { register, handleSubmit, reset, setValue, getValues, watch, setFocus } = useForm<ComposerForm>({ defaultValues: { text: '' } });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const context = useUiStore((s) => (s.composerContext?.conversationId === conversation.id ? s.composerContext : null));
  const setContext = useUiStore((s) => s.setComposerContext);
  const target = useChatStore((s) => (context ? s.messages[conversation.id]?.find((m) => m.id === context.messageId) : undefined));
  const { sendMessage, editMessage } = useChatStore.getState();

  const text = watch('text');
  const canSubmit = text.trim().length > 0 || (context?.mode !== 'edit' && attachments.length > 0);

  // Auto-grow the textarea up to ~6 lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Entering edit mode pre-fills the draft; any context change focuses the input.
  useEffect(() => {
    if (context?.mode === 'edit' && target) setValue('text', target.text);
    if (context) setFocus('text');
  }, [context, target?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancelContext = useCallback(() => {
    if (context?.mode === 'edit') reset();
    setContext(null);
  }, [context, reset, setContext]);

  const onSubmit = handleSubmit(async ({ text: value }) => {
    if (!canSubmit) return;
    if (context?.mode === 'edit') {
      setContext(null);
      reset();
      if (target && value.trim() !== target.text) {
        try {
          await editMessage(conversation.id, target.id, value);
        } catch {
          toast.error('Couldn’t edit message');
        }
      }
      return;
    }
    const replyToId = context?.mode === 'reply' ? context.messageId : undefined;
    const files = attachments;
    reset();
    setAttachments([]);
    setContext(null);
    await sendMessage({ conversationId: conversation.id, text: value, replyToId, attachments: files });
  });

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void onSubmit();
    } else if (e.key === 'Escape' && context) {
      e.stopPropagation();
      cancelContext();
    } else if (e.key === 'ArrowUp' && !getValues('text')) {
      // Slack-style: ↑ in an empty composer edits your last message.
      const { messages, currentUserId } = useChatStore.getState();
      const last = [...(messages[conversation.id] ?? [])].reverse().find((m) => m.senderId === currentUserId && !m.deleted && m.text && m.status !== 'failed');
      if (last) {
        e.preventDefault();
        setContext({ conversationId: conversation.id, mode: 'edit', messageId: last.id });
      }
    }
  };

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = '';
    const tooBig = files.filter((f) => f.size > MAX_ATTACHMENT_BYTES);
    if (tooBig.length) toast.error(`${tooBig.map((f) => f.name).join(', ')} exceeds ${formatBytes(MAX_ATTACHMENT_BYTES)}`);
    const accepted = files.filter((f) => f.size <= MAX_ATTACHMENT_BYTES).slice(0, MAX_ATTACHMENTS - attachments.length);
    try {
      const next = await Promise.all(accepted.map(toAttachment));
      setAttachments((prev) => [...prev, ...next]);
    } catch {
      toast.error('Couldn’t read the selected file');
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    const value = getValues('text');
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    setValue('text', value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const { ref: registerRef, ...textField } = register('text');

  return (
    <form onSubmit={onSubmit} className="shrink-0 px-3 pt-1 pb-3 sm:px-4 sm:pb-4">
      <div className="rounded-2xl border border-line bg-surface focus-within:border-accent/60">
        {context && (
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            {context.mode === 'reply' ? <Reply className="size-4 shrink-0 text-accent" aria-hidden /> : <Pencil className="size-4 shrink-0 text-accent" aria-hidden />}
            <div className="min-w-0 flex-1">
              {context.mode === 'reply' ? <ReplyQuote message={target} /> : <p className="text-xs font-semibold text-accent">Editing message</p>}
            </div>
            <IconButton label={context.mode === 'reply' ? 'Cancel reply' : 'Cancel edit'} size="sm" onClick={cancelContext}>
              <X />
            </IconButton>
          </div>
        )}

        {attachments.length > 0 && (
          <ul className="flex gap-2 overflow-x-auto border-b border-line p-3" aria-label="Attachments">
            {attachments.map((a) => (
              <li key={a.id} className="relative shrink-0">
                {a.kind === 'image' && a.url ? (
                  <img src={a.url} alt={a.name} className="size-16 rounded-lg border border-line object-cover" />
                ) : (
                  <div className="flex h-16 w-40 items-center gap-2 rounded-lg border border-line bg-bg p-2">
                    <FileText className="size-4 shrink-0 text-accent" aria-hidden />
                    <span className="min-w-0 text-xs">
                      <span className="block truncate font-medium">{a.name}</span>
                      <span className="text-fg-muted">{formatBytes(a.size)}</span>
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                  className="absolute -top-1.5 -right-1.5 rounded-full border border-line bg-surface p-0.5 text-fg-muted hover:text-fg"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-end gap-1 p-1.5">
          <div className="relative">
            <IconButton label="Insert emoji" active={emojiOpen} onClick={() => setEmojiOpen((o) => !o)}>
              <Smile />
            </IconButton>
            {emojiOpen && <EmojiPicker onPick={insertEmoji} onClose={() => setEmojiOpen(false)} />}
          </div>
          <IconButton label="Attach files" onClick={() => fileRef.current?.click()} disabled={context?.mode === 'edit' || attachments.length >= MAX_ATTACHMENTS}>
            <Paperclip />
          </IconButton>
          <input ref={fileRef} type="file" multiple hidden onChange={onFiles} />

          <textarea
            id={COMPOSER_ID}
            {...textField}
            ref={(el) => {
              registerRef(el);
              textareaRef.current = el;
            }}
            rows={1}
            onKeyDown={onKeyDown}
            aria-label="Message"
            placeholder={conversation.type === 'group' ? `Message ${conversation.name}` : 'Write a message…'}
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-fg placeholder:text-fg-muted focus:outline-none"
          />

          <IconButton label={context?.mode === 'edit' ? 'Save edit' : 'Send message'} type="submit" disabled={!canSubmit} className="bg-accent text-white hover:bg-accent/90 hover:text-white disabled:bg-elevated disabled:text-fg-muted">
            <SendHorizontal />
          </IconButton>
        </div>
      </div>
      <p className="mt-1.5 hidden px-2 text-[11px] text-fg-muted sm:block">
        <kbd className="font-sans font-semibold">Enter</kbd> to send · <kbd className="font-sans font-semibold">Shift + Enter</kbd> for a new line · <kbd className="font-sans font-semibold">↑</kbd> to edit your last message
      </p>
    </form>
  );
}
