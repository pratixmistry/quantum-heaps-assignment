import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '@/services/mockApi/db';
import { initialChatState, useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { ConversationList } from './ConversationList';

const list = () => within(screen.getByRole('navigation', { name: 'Conversations' }));

beforeEach(async () => {
  resetDb();
  useChatStore.setState({ ...initialChatState });
  useUiStore.setState({ filter: 'all' });
  await useChatStore.getState().bootstrap();
});

describe('<ConversationList />', () => {
  it('renders conversations with unread badges', () => {
    render(<ConversationList />);
    expect(list().getByText('Design Systems')).toBeTruthy();
    expect(list().getByLabelText('4 unread messages')).toBeTruthy();
  });

  it('filters by search query after debounce', async () => {
    render(<ConversationList />);
    fireEvent.change(screen.getByLabelText('Search conversations'), { target: { value: 'kenji' } });
    // Before the debounce settles the full list is still shown.
    expect(list().getByText('Design Systems')).toBeTruthy();
    const marks = await list().findAllByText((_, el) => el?.tagName === 'MARK' && el.textContent === 'Kenji');
    expect(marks.length).toBeGreaterThan(0);
    expect(list().queryByText('Design Systems')).toBeNull();
  });

  it('shows only unread conversations under the Unread filter', () => {
    useUiStore.setState({ filter: 'unread' });
    render(<ConversationList />);
    expect(list().queryByText('Marcus Chen')).toBeNull();
    expect(list().getByText('Engineering')).toBeTruthy();
  });

  it('switches conversation and clears its unread count on click', () => {
    render(<ConversationList />);
    fireEvent.click(list().getByText('Engineering'));
    expect(useChatStore.getState().activeConversationId).toBe('c-eng');
    expect(useChatStore.getState().conversations['c-eng']!.unreadCount).toBe(0);
    expect(list().queryByLabelText('4 unread messages')).toBeNull();
  });
});
