import type { Challenge, User, Friend, DayStatus } from './types';

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function subDays(base: Date, days: number): Date {
  return addDays(base, -days);
}

function createDayRecords(
  duration: number,
  startDate: Date,
): { date: string; status: DayStatus }[] {
  const today = new Date();
  const days: { date: string; status: DayStatus }[] = [];
  for (let i = 0; i < duration; i++) {
    const date = addDays(startDate, i);
    const isPast =
      date < today && formatDateYYYYMMDD(date) !== formatDateYYYYMMDD(today);
    let status: DayStatus = 'empty';
    if (isPast) {
      const r = Math.random();
      status = r > 0.8 ? 'failed' : r > 0.2 ? 'done' : 'skip';
    }
    days.push({ date: formatDateYYYYMMDD(date), status });
  }
  return days;
}

const today = new Date();
const startDate1 = subDays(today, 15);
const startDate2 = subDays(today, 25);

export const seedChallenges: Challenge[] = [
  {
    id: '1',
    name: 'Wake Up Early',
    duration: 30,
    startDate: formatDateYYYYMMDD(startDate1),
    createdAt: formatDateYYYYMMDD(startDate1),
    isShared: true,
    sharedWith: ['friend1'],
    dailyNotes: 'Wake up at 6am',
    days: createDayRecords(30, startDate1),
    category: 'health',
  },
  {
    id: '2',
    name: 'Read 30 Minutes',
    duration: 45,
    startDate: formatDateYYYYMMDD(startDate2),
    createdAt: formatDateYYYYMMDD(startDate2),
    isShared: false,
    sharedWith: [],
    dailyNotes: 'Read any book',
    days: createDayRecords(45, startDate2),
    category: 'learning',
  },
];

export const seedUser: User = {
  id: 'user123',
  username: 'you',
  name: 'You',
  darkMode: false,
  friends: ['friend1'],
};

export const seedFriends: Friend[] = [
  {
    id: 'friend1',
    username: 'alex',
    name: 'Alex Chen',
    avatar: '👤',
    mutualChallenges: ['1'],
  },
];
