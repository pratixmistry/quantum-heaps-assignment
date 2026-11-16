import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '@/services/mockApi/db';
import { initialChatState, useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { Composer } from './Composer';

const conversation = () => useChatStore.getState().conversations['c-emma']!;
const messages = () => useChatStore.getState().messages['c-emma'] ?? [];

beforeEach(async () => {
  resetDb();
  useChatStore.setState({ ...initialChatState });
  useUiStore.setState({ composerContext: null });
  await useChatStore.getState().bootstrap();
});

describe('<Composer />', () => {
  it('sends on Enter and clears the input', async () => {
    render(<Composer conversation={conversation()} />);
    const input = screen.getByLabelText('Message') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Hi Emma!' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(messages().at(-1)).toMatchObject({ text: 'Hi Emma!', status: 'sent' }));
    expect(input.value).toBe('');
  });

  it('does not send on Shift+Enter or when empty', () => {
    render(<Composer conversation={conversation()} />);
    const input = screen.getByLabelText('Message');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: 'draft' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(messages()).toHaveLength(0);
  });

  it('edits the last own message via ArrowUp', async () => {
    await useChatStore.getState().sendMessage({ conversationId: 'c-emma', text: 'Frist' });
    render(<Composer conversation={conversation()} />);
    const input = screen.getByLabelText('Message') as HTMLTextAreaElement;
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await waitFor(() => expect(input.value).toBe('Frist'));
    expect(screen.getByText('Editing message')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'First' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(messages().at(-1)).toMatchObject({ text: 'First', editedAt: expect.any(Number) }));
    expect(messages()).toHaveLength(1);
  });
});
