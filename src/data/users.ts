import type { PresenceStatus } from '@/types/chat';

export const CURRENT_USER_ID = 'u-me';

export interface SeedUser {
  id: string;
  name: string;
  title: string;
  avatar: number; // i.pravatar.cc image index
  status: PresenceStatus;
  lastSeenMinutesAgo: number;
  timezone: string;
}

export const seedUsers: SeedUser[] = [
  { id: 'u-me', name: 'Alex Morgan', title: 'Senior Product Designer', avatar: 12, status: 'online', lastSeenMinutesAgo: 0, timezone: 'Europe/London' },
  { id: 'u-priya', name: 'Priya Sharma', title: 'Engineering Manager', avatar: 47, status: 'online', lastSeenMinutesAgo: 0, timezone: 'Asia/Kolkata' },
  { id: 'u-marcus', name: 'Marcus Chen', title: 'Staff Frontend Engineer', avatar: 59, status: 'online', lastSeenMinutesAgo: 0, timezone: 'America/Los_Angeles' },
  { id: 'u-sofia', name: 'Sofia Alvarez', title: 'Product Manager', avatar: 32, status: 'away', lastSeenMinutesAgo: 18, timezone: 'Europe/Madrid' },
  { id: 'u-daniel', name: 'Daniel Okafor', title: 'Data Scientist', avatar: 68, status: 'offline', lastSeenMinutesAgo: 95, timezone: 'Africa/Lagos' },
  { id: 'u-emma', name: 'Emma Larsson', title: 'UX Researcher', avatar: 44, status: 'online', lastSeenMinutesAgo: 0, timezone: 'Europe/Stockholm' },
  { id: 'u-kenji', name: 'Kenji Watanabe', title: 'DevOps Lead', avatar: 53, status: 'offline', lastSeenMinutesAgo: 1600, timezone: 'Asia/Tokyo' },
  { id: 'u-amara', name: 'Amara Nwosu', title: 'Head of Customer Success', avatar: 45, status: 'online', lastSeenMinutesAgo: 0, timezone: 'Europe/London' },
  { id: 'u-liam', name: 'Liam O’Brien', title: 'Backend Engineer', avatar: 33, status: 'online', lastSeenMinutesAgo: 0, timezone: 'Europe/Dublin' },
  { id: 'u-hana', name: 'Hana Kim', title: 'Brand Designer', avatar: 26, status: 'away', lastSeenMinutesAgo: 7, timezone: 'Asia/Seoul' },
  { id: 'u-noah', name: 'Noah Fischer', title: 'VP Engineering', avatar: 15, status: 'offline', lastSeenMinutesAgo: 240, timezone: 'Europe/Berlin' },
];
