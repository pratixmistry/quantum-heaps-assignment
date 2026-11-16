import type { Attachment } from '@/types/chat';
import { createId } from '@/utils/id';

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
/** Images up to this size are inlined as data URLs so previews survive a reload via LocalStorage. */
const INLINE_IMAGE_BYTES = 1.5 * 1024 * 1024;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export async function toAttachment(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith('image/');
  const base = { id: createId('a'), name: file.name, size: file.size, mimeType: file.type || 'application/octet-stream' };
  if (isImage && file.size <= INLINE_IMAGE_BYTES) return { ...base, kind: 'image', url: await readAsDataUrl(file) };
  return { ...base, kind: 'file' };
}
