import type { Message } from '@/types/chat';
import { formatDayLabel, isSameDay } from '@/utils/date';

const RUN_GAP_MS = 5 * 60_000;

export interface MessageRow {
  message: Message;
  /** First message of a same-sender run — shows avatar and name in groups. */
  startsRun: boolean;
}

export interface DaySection {
  key: string;
  label: string;
  rows: MessageRow[];
}

/** Splits a chronologically sorted list into day sections and same-sender runs. */
export function groupMessagesByDay(messages: Message[], now = Date.now()): DaySection[] {
  const sections: DaySection[] = [];
  let prev: Message | undefined;

  for (const message of messages) {
    if (!prev || !isSameDay(prev.createdAt, message.createdAt)) {
      sections.push({ key: `d-${message.id}`, label: formatDayLabel(message.createdAt, now), rows: [] });
      prev = undefined;
    }
    const startsRun = !prev || prev.senderId !== message.senderId || message.createdAt - prev.createdAt > RUN_GAP_MS;
    sections[sections.length - 1]!.rows.push({ message, startsRun });
    prev = message;
  }
  return sections;
}
