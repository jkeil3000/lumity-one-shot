import type { ActivityEvent } from '../data/mock';

export interface StreakCalendarDay {
  key: string;
  label: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isComplete: boolean;
  isGraceEligible: boolean;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  completedDays: Set<string>;
  calendarDays: StreakCalendarDay[];
  graceEligibleDateKey: string | null;
  todayKey: string;
  monthLabel: string;
}

const QUALIFYING_TYPES = new Set<ActivityEvent['type']>([
  'save_item',
  'share_item',
  'create_thought',
  'open_item',
  'comment_post',
  'grace_restore',
]);

function atLocalNoon(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

export function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function addDays(date: Date, amount: number) {
  const next = atLocalNoon(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function diffDays(a: Date, b: Date) {
  const aMid = atLocalNoon(a).getTime();
  const bMid = atLocalNoon(b).getTime();
  return Math.round((aMid - bMid) / 86400000);
}

export function getCompletedDays(events: ActivityEvent[]) {
  const completedDays = new Set<string>();

  events.forEach(event => {
    if (!QUALIFYING_TYPES.has(event.type)) return;
    const effectiveDateKey = event.effectiveDateKey ?? formatLocalDateKey(new Date(event.timestamp));
    completedDays.add(effectiveDateKey);
  });

  return completedDays;
}

function getLongestStreak(sortedKeys: string[]) {
  if (sortedKeys.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedKeys.length; index += 1) {
    const currentDate = fromDateKey(sortedKeys[index]);
    const previousDate = fromDateKey(sortedKeys[index - 1]);
    const consecutive = diffDays(currentDate, previousDate) === 1;

    current = consecutive ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
}

function buildCalendarDays(completedDays: Set<string>, graceEligibleDateKey: string | null, today: Date) {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12, 0, 0, 0);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const trailingDays = 6 - monthEnd.getDay();
  const gridEnd = addDays(monthEnd, trailingDays);
  const calendarDays: StreakCalendarDay[] = [];

  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const key = formatLocalDateKey(cursor);
    calendarDays.push({
      key,
      label: String(cursor.getDate()),
      isCurrentMonth: cursor.getMonth() === today.getMonth(),
      isToday: key === formatLocalDateKey(today),
      isComplete: completedDays.has(key),
      isGraceEligible: key === graceEligibleDateKey,
    });
  }

  return calendarDays;
}

export function calculateStreakSummary(events: ActivityEvent[], now = new Date()): StreakSummary {
  const today = atLocalNoon(now);
  const todayKey = formatLocalDateKey(today);
  const yesterdayKey = formatLocalDateKey(addDays(today, -1));
  const completedDays = getCompletedDays(events);

  const graceEligibleDateKey = !completedDays.has(yesterdayKey) ? yesterdayKey : null;

  let currentStreak = 0;
  let cursor = today;
  while (completedDays.has(formatLocalDateKey(cursor))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  const sortedKeys = [...completedDays].sort();
  const longestStreak = getLongestStreak(sortedKeys);
  const calendarDays = buildCalendarDays(completedDays, graceEligibleDateKey, today);
  const monthLabel = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return {
    currentStreak,
    longestStreak,
    completedDays,
    calendarDays,
    graceEligibleDateKey,
    todayKey,
    monthLabel,
  };
}
