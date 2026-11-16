import type { ConversationType } from '@/types/chat';

const D = 1440; // minutes per day

export interface SeedAttachment {
  kind: 'image' | 'file';
  name: string;
  size: number;
  mimeType: string;
  url?: string;
}

export interface SeedMessage {
  from: string;
  text: string;
  /** Minutes before the seed anchor time. */
  ago: number;
  /** Index of the replied-to message within the same script. */
  replyTo?: number;
  reactions?: Record<string, string[]>;
  attachments?: SeedAttachment[];
  status?: 'delivered' | 'read';
}

export interface SeedConversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  memberIds: string[];
  unreadCount: number;
  muted?: boolean;
  createdDaysAgo: number;
  /** Number of generated older messages, used to demo infinite scroll. */
  fillerCount?: number;
  script: SeedMessage[];
}

const img = (seed: string, name: string): SeedAttachment => ({
  kind: 'image', name, size: 240_000, mimeType: 'image/jpeg', url: `https://picsum.photos/seed/${seed}/640/420`,
});
const file = (name: string, size: number, mimeType = 'application/pdf'): SeedAttachment => ({ kind: 'file', name, size, mimeType });

export const fillerLines = [
  'Quick sync on the roadmap later?',
  'Sounds good to me.',
  'I left some comments on the doc.',
  'Can you take a look when you get a chance?',
  'Pushed the fix, should be live in a few minutes.',
  'Let’s keep this scoped to the MVP for now.',
  'Agreed — we can revisit after the launch.',
  'Do we have numbers on that yet?',
  'I’ll follow up with the team.',
  'Thanks for the heads up!',
  'That makes sense. Updating the ticket.',
  'Can we move this to tomorrow morning?',
  'Works for me 👍',
  'Shared the recording in the drive.',
  'Nice catch, I missed that edge case.',
  'Let me check with legal and get back to you.',
];

export const replyLines = [
  'Sounds good!',
  'Got it, thanks.',
  'Let me look into that and get back to you.',
  'Makes sense 👍',
  'Can we discuss this in standup tomorrow?',
  'Great, I’ll update the doc.',
  'Perfect, that unblocks me.',
  'Haha, fair point.',
  'On it.',
  'Nice work!',
];

export const seedConversations: SeedConversation[] = [
  {
    id: 'c-design', type: 'group', name: 'Design Systems',
    description: 'Tokens, components and the road to v3 of our design system.',
    memberIds: ['u-me', 'u-hana', 'u-emma', 'u-sofia', 'u-marcus'],
    unreadCount: 2, createdDaysAgo: 40, fillerCount: 45,
    script: [
      { from: 'u-hana', text: 'Morning! Pushed the updated colour tokens to Figma — dark surfaces now use #141414 and #1F242E.', ago: D + 300 },
      { from: 'u-emma', text: 'Looks great. Does secondary text pass AA now?', ago: D + 290 },
      { from: 'u-me', text: 'Yes — #A0A0A0 on pure black is roughly 8.6:1, we’re comfortably fine.', ago: D + 282, reactions: { '👍': ['u-hana', 'u-emma'] } },
      { from: 'u-sofia', text: 'Can we get the component audit by Thursday? Leadership wants a status update.', ago: D + 120 },
      { from: 'u-hana', text: 'Latest button exploration 👇', ago: 95, attachments: [img('qc-buttons', 'button-exploration.jpg')] },
      { from: 'u-marcus', text: 'Love the pill shape. Do we keep the 8px radius for inputs?', ago: 88 },
      { from: 'u-me', text: 'Inputs move to 10px, buttons go full pill. I’ll share a spec shortly.', ago: 80, replyTo: 5, reactions: { '🔥': ['u-marcus'] } },
      { from: 'u-emma', text: 'Research synthesis from the onboarding interviews is attached.', ago: 42, attachments: [file('Onboarding-Research-Synthesis.pdf', 2_480_000)] },
      { from: 'u-sofia', text: 'Thursday works for the audit review — I’ll send the invite.', ago: 12 },
    ],
  },
  {
    id: 'c-priya', type: 'direct', memberIds: ['u-me', 'u-priya'],
    unreadCount: 1, createdDaysAgo: 60, fillerCount: 90,
    script: [
      { from: 'u-priya', text: 'Hey Alex, do you have a minute to look at the sprint board?', ago: 2 * D + 30 },
      { from: 'u-me', text: 'Sure, give me five.', ago: 2 * D + 26 },
      { from: 'u-priya', text: 'The composer tests are flaky on CI again 😅', ago: 35 },
      { from: 'u-me', text: 'Saw that. It’s the typing-indicator timer — I’ll switch those tests to fake timers.', ago: 30 },
      { from: 'u-priya', text: 'Perfect. Can you also pair with Liam on the reactions API this afternoon?', ago: 26, reactions: { '✅': ['u-me'] } },
      { from: 'u-me', text: 'Absolutely. 3pm?', ago: 24 },
      { from: 'u-priya', text: '3pm works 👍', ago: 5 },
    ],
  },
  {
    id: 'c-eng', type: 'group', name: 'Engineering',
    description: 'Platform, infrastructure and release coordination.',
    memberIds: ['u-me', 'u-priya', 'u-marcus', 'u-kenji', 'u-liam', 'u-noah', 'u-daniel'],
    unreadCount: 4, createdDaysAgo: 120,
    script: [
      { from: 'u-kenji', text: 'Heads up: staging deploy at 14:00 UTC. Expect ~5 minutes of downtime.', ago: 3 * D },
      { from: 'u-liam', text: 'Migration for message reactions is merged.', ago: 3 * D - 60 },
      { from: 'u-noah', text: 'Great work this sprint, everyone. Release notes go out Friday.', ago: D + 100, reactions: { '🎉': ['u-me', 'u-priya', 'u-liam'], '🙌': ['u-marcus'] } },
      { from: 'u-marcus', text: 'Bundle size is down 18% after the icon tree-shaking fix 🚀', ago: 180 },
      { from: 'u-kenji', text: 'CI is green again. Quarantined the flaky e2e test.', ago: 64 },
      { from: 'u-daniel', text: 'Dashboard latency p95 dropped from 420ms to 180ms after the cache change.', ago: 50, attachments: [img('qc-latency', 'latency-p95.png')] },
      { from: 'u-liam', text: 'Nice! Is that across all regions or just us-east?', ago: 47, replyTo: 5 },
      { from: 'u-daniel', text: 'All regions as of this morning.', ago: 45 },
    ],
  },
  {
    id: 'c-marcus', type: 'direct', memberIds: ['u-me', 'u-marcus'],
    unreadCount: 0, createdDaysAgo: 90,
    script: [
      { from: 'u-marcus', text: 'Could you review my PR for the virtualised message list?', ago: 4 * D },
      { from: 'u-me', text: 'On it. Left a few comments about scroll anchoring.', ago: 4 * D - 30 },
      { from: 'u-marcus', text: 'Thanks — addressed all of them.', ago: 4 * D - 80 },
      { from: 'u-me', text: 'Approved ✅', ago: 4 * D - 90, status: 'read' },
      { from: 'u-marcus', text: 'Perf trace from the 10k-message test', ago: D + 20, attachments: [file('trace-10k-messages.json', 842_000, 'application/json')] },
      { from: 'u-me', text: 'Steady 60fps, nice. Ship it.', ago: D + 10, status: 'read' },
    ],
  },
  {
    id: 'c-launch', type: 'group', name: 'Q4 Launch War Room',
    description: 'Go/no-go, comms and customer rollout for the Q4 enterprise launch.',
    memberIds: ['u-me', 'u-sofia', 'u-amara', 'u-noah', 'u-daniel', 'u-hana'],
    unreadCount: 0, muted: true, createdDaysAgo: 30,
    script: [
      { from: 'u-sofia', text: 'Launch checklist is at 92%. Remaining: pricing page copy and SSO docs.', ago: 2 * D + 200 },
      { from: 'u-amara', text: 'Customer advisory board is briefed. Three design partners are ready for day one.', ago: 2 * D + 150 },
      { from: 'u-hana', text: 'Final launch visuals', ago: 2 * D + 100, attachments: [img('qc-launch', 'launch-hero.jpg'), img('qc-launch-2', 'launch-social.jpg')] },
      { from: 'u-noah', text: 'Go/no-go meeting moved to Wednesday 10am.', ago: 2 * D },
      { from: 'u-me', text: 'In-app announcement modal will be ready by Tuesday.', ago: 2 * D - 10, reactions: { '👏': ['u-sofia', 'u-noah'] } },
      { from: 'u-amara', text: 'Can we add a “Book a demo” CTA to that modal?', ago: 7 * 60, replyTo: 4 },
      { from: 'u-me', text: 'Yes, adding it now.', ago: 6 * 60, status: 'read' },
    ],
  },
  {
    id: 'c-sofia', type: 'direct', memberIds: ['u-me', 'u-sofia'],
    unreadCount: 1, createdDaysAgo: 75,
    script: [
      { from: 'u-sofia', text: 'Do you have the latest roadmap deck?', ago: 5 * D },
      { from: 'u-me', text: 'Sending it over now.', ago: 5 * D - 3 },
      { from: 'u-me', text: '', ago: 5 * D - 2, attachments: [file('Roadmap-H1-2027.pdf', 5_120_000)] },
      { from: 'u-sofia', text: 'Thanks! Reviewing tonight.', ago: 5 * D - 20 },
      { from: 'u-sofia', text: 'Customers loved the new onboarding flow on yesterday’s call 🙌', ago: 140 },
    ],
  },
  {
    id: 'c-daniel', type: 'direct', memberIds: ['u-me', 'u-daniel'],
    unreadCount: 0, createdDaysAgo: 50,
    script: [
      { from: 'u-daniel', text: 'The A/B test results are in.', ago: 6 * D },
      { from: 'u-daniel', text: 'Variant B increased activation by 12.4% at 95% confidence.', ago: 6 * D - 1 },
      { from: 'u-me', text: 'That’s huge. Let’s present it at the all-hands.', ago: 6 * D - 15, status: 'delivered' },
    ],
  },
  {
    id: 'c-leadership', type: 'group', name: 'Leadership Sync',
    description: 'Weekly priorities and cross-team decisions.',
    memberIds: ['u-me', 'u-noah', 'u-amara', 'u-sofia', 'u-priya'],
    unreadCount: 0, createdDaysAgo: 200,
    script: [
      { from: 'u-noah', text: 'Agenda for Monday: hiring plan, Q1 OKRs, design system budget.', ago: 8 * D },
      { from: 'u-priya', text: 'Adding: on-call rotation changes.', ago: 8 * D - 20 },
      { from: 'u-me', text: 'I’ll bring the design system ROI numbers.', ago: 8 * D - 45, status: 'read' },
    ],
  },
  {
    id: 'c-kenji', type: 'direct', memberIds: ['u-me', 'u-kenji'],
    unreadCount: 0, createdDaysAgo: 20,
    script: [
      { from: 'u-kenji', text: 'Your VPN access request is approved.', ago: 12 * D },
      { from: 'u-me', text: 'Thanks Kenji!', ago: 12 * D - 5, status: 'read' },
    ],
  },
  {
    id: 'c-emma', type: 'direct', memberIds: ['u-me', 'u-emma'],
    unreadCount: 0, createdDaysAgo: 1, script: [],
  },
];
