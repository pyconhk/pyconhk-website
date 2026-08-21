import rawSessions from './sessions.json';

export type RoomKey =
  | 'main-am'
  | 'main-pm'
  | 'track-a-sessions'
  | 'track-a-workshop'
  | 'track-b'
  | 'track-c';

export type TrackKey = 'main' | 'track-a' | 'track-b' | 'track-c';

export type ScheduleItem = {
  id: string;
  title: string;
  speakers: string[];
  room: string;
  roomKey: RoomKey;
  trackKey: TrackKey;
  sessionType: string;
  day: 'day-1' | 'day-2';
  dayLabel: string;
  dateString: string; // "2025-10-11"
  startTime: string; // "10:25"
  endTime: string; // "10:55"
  time12: string; // "10:25"
  amPm: 'AM' | 'PM';
  duration: number; // minutes
  abstract: string;
  description: string;
  tags: string[];
  language: string;
  isBreak: boolean;
  topPx: number;
  heightPx: number;
  speakerAvatar?: string;
  accentColor: string;
  badgeBg: string;
};

export type RoomMeta = {
  key: RoomKey;
  trackKey: TrackKey;
  label: string;
  subtitle: string;
  accentColor: string;
  borderColor: string;
};

export const roomColumns: RoomMeta[] = [
  {
    key: 'main-am',
    trackKey: 'main',
    label: 'Main Track (Morning)',
    subtitle: 'LT-18',
    accentColor: '#d71920',
    borderColor: 'border-[#d71920]',
  },
  {
    key: 'main-pm',
    trackKey: 'main',
    label: 'Main Track (Afternoon)',
    subtitle: 'LT-13',
    accentColor: '#d71920',
    borderColor: 'border-[#d71920]',
  },
  {
    key: 'track-a-sessions',
    trackKey: 'track-a',
    label: 'Track A (Sessions)',
    subtitle: 'LT-15',
    accentColor: '#2f559a',
    borderColor: 'border-[#2f559a]',
  },
  {
    key: 'track-a-workshop',
    trackKey: 'track-a',
    label: 'Track A (Workshop)',
    subtitle: 'LT-15',
    accentColor: '#2f559a',
    borderColor: 'border-[#2f559a]',
  },
  {
    key: 'track-b',
    trackKey: 'track-b',
    label: 'Track B',
    subtitle: 'LT-14',
    accentColor: '#0f6a49',
    borderColor: 'border-[#0f6a49]',
  },
  {
    key: 'track-c',
    trackKey: 'track-c',
    label: 'Track C',
    subtitle: 'LT-16',
    accentColor: '#b45309',
    borderColor: 'border-[#b45309]',
  },
];

// Generous pixel coordinates so no text or speaker names are ever clipped or cropped
const timeToPxMap: Record<string, number> = {
  '09:00': 40,
  '09:15': 70,
  '09:30': 120,
  '10:00': 230,
  '10:10': 270,
  '10:20': 335,
  '10:25': 400,
  '10:55': 570,
  '11:00': 600,
  '11:25': 740,
  '11:30': 805,
  '12:00': 975,
  '12:10': 1040,
  '12:30': 1145,
  '12:40': 1195,
  '12:45': 1210,
  '13:00': 1370,
  '13:30': 1455,
  '14:00': 1540,
  '14:30': 1710,
  '14:40': 1775,
  '15:00': 1860,
  '15:10': 1945,
  '15:30': 2030,
  '15:50': 2115,
  '16:00': 2200,
  '16:20': 2285,
  '16:30': 2350,
  '17:00': 2490,
  '17:05': 2520,
  '17:20': 2685,
  '17:30': 2750,
  '17:35': 2880,
  '17:40': 3010,
  '17:45': 3140,
  '17:50': 3270,
  '17:55': 3400,
  '18:00': 3530,
  '18:05': 3660,
  '18:30': 3810,
};

export const TIMELINE_TOTAL_HEIGHT = 3880;

export function getPxForTime(timeStr: string): number {
  const clean = timeStr.slice(0, 5);
  if (timeToPxMap[clean] !== undefined) return timeToPxMap[clean];

  const [h, m] = clean.split(':').map(Number);
  const targetMins = h * 60 + m;
  const sortedKeys = Object.keys(timeToPxMap).sort();

  for (let i = 0; i < sortedKeys.length - 1; i++) {
    const k1 = sortedKeys[i];
    const k2 = sortedKeys[i + 1];
    const [h1, m1] = k1.split(':').map(Number);
    const [h2, m2] = k2.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;

    if (targetMins >= mins1 && targetMins <= mins2) {
      const ratio = (targetMins - mins1) / (mins2 - mins1);
      return Math.round(timeToPxMap[k1] + ratio * (timeToPxMap[k2] - timeToPxMap[k1]));
    }
  }

  return 40;
}

export function formatTime12(timeStr: string): { time12: string; amPm: 'AM' | 'PM' } {
  const [h, m] = timeStr.split(':').map(Number);
  const amPm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    time12: `${hour12}:${String(m).padStart(2, '0')}`,
    amPm,
  };
}

function resolveRoomKey(rawRoom: string, sessionType: string): RoomKey {
  const lower = (rawRoom || '').toLowerCase();
  const lowerType = (sessionType || '').toLowerCase();

  if (lower.includes('workshop') || lowerType.includes('workshop')) {
    return 'track-a-workshop';
  }
  if (
    lower.includes('track a') ||
    (lower.includes('lt-15') && !lower.includes('workshop'))
  ) {
    return 'track-a-sessions';
  }
  if (lower.includes('track b') || lower.includes('lt-14')) {
    return 'track-b';
  }
  if (lower.includes('track c') || lower.includes('lt-16')) {
    return 'track-c';
  }
  if (lower.includes('afternoon') || lower.includes('lt-13')) {
    return 'main-pm';
  }
  return 'main-am';
}

function getTrackAccent(roomKey: RoomKey): {
  color: string;
  badgeBg: string;
  trackKey: TrackKey;
} {
  if (roomKey === 'main-am' || roomKey === 'main-pm') {
    return { color: '#d71920', badgeBg: 'bg-[#d71920]', trackKey: 'main' };
  }
  if (roomKey === 'track-a-sessions' || roomKey === 'track-a-workshop') {
    return { color: '#2f559a', badgeBg: 'bg-[#2f559a]', trackKey: 'track-a' };
  }
  if (roomKey === 'track-b') {
    return { color: '#0f6a49', badgeBg: 'bg-[#0f6a49]', trackKey: 'track-b' };
  }
  return { color: '#b45309', badgeBg: 'bg-[#b45309]', trackKey: 'track-c' };
}

interface RawSessionItem {
  ID: string;
  'Proposal title': string;
  'Proposal state': string;
  'Session type'?: string | { en?: string };
  Tags?: string[];
  Abstract?: string;
  Description?: string;
  Duration?: number;
  Language?: string;
  'Speaker names'?: string[];
  Room?: string | { en?: string } | null;
  'Start (date)'?: string | null;
  'Start (time)'?: string | null;
  'End (date)'?: string | null;
  'End (time)'?: string | null;
}

// Confirmed talks parsed from sessions.json
const rawTalks: ScheduleItem[] = (rawSessions as RawSessionItem[])
  .filter((item) => item['Proposal state'] === 'confirmed' && item['Start (time)'])
  .map((item) => {
    const rawRoom =
      typeof item.Room === 'object' && item.Room
        ? item.Room.en || ''
        : (item.Room as string) || '';

    const rawType =
      typeof item['Session type'] === 'object' && item['Session type']
        ? item['Session type'].en || 'Talk'
        : (item['Session type'] as string) || 'Talk';

    const roomKey = resolveRoomKey(rawRoom, rawType);
    const { color: accentColor, badgeBg, trackKey } = getTrackAccent(roomKey);

    const startTime = (item['Start (time)'] || '10:00').slice(0, 5);
    const endTime = (item['End (time)'] || '10:30').slice(0, 5);
    const duration = item.Duration || 30;

    const topPx = getPxForTime(startTime);
    const endPx = getPxForTime(endTime);

    // Ensure generous height for all talk cards so 4-line titles and speaker footers have tons of room
    const isLightning = rawType.toLowerCase().includes('lightning');
    const heightPx = isLightning
      ? Math.max(122, endPx - topPx - 8)
      : Math.max(156, endPx - topPx - 8);

    const { time12, amPm } = formatTime12(startTime);

    return {
      id: item.ID,
      title: item['Proposal title'],
      speakers: item['Speaker names'] || ['Community Speaker'],
      room: rawRoom,
      roomKey,
      trackKey,
      sessionType: rawType,
      day: 'day-1',
      dayLabel: 'Saturday, October 11, 2025',
      dateString: item['Start (date)'] || '2025-10-11',
      startTime,
      endTime,
      time12,
      amPm,
      duration,
      abstract: item.Abstract || item.Description || '',
      description: item.Description || item.Abstract || '',
      tags: Array.isArray(item.Tags) && item.Tags.length > 0 ? item.Tags : ['Python'],
      language: (item.Language || 'en').toLowerCase(),
      isBreak: false,
      topPx,
      heightPx,
      accentColor,
      badgeBg,
    };
  });

// Breaks and Milestones (Non-speaker sessions with generous height for uncropped text)
const breakEvents: ScheduleItem[] = [
  // 09:15 Registration Booth
  {
    id: 'ADMIN-REGISTRATION',
    title: 'Registration Booth & Morning Coffee',
    speakers: ['PyCon HK Volunteers'],
    room: 'Track B (LT-14) & Foyer',
    roomKey: 'track-b',
    trackKey: 'track-b',
    sessionType: 'Registration',
    day: 'day-1',
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '09:15',
    endTime: '10:00',
    time12: '9:15',
    amPm: 'AM',
    duration: 45,
    abstract: 'Badge pickup, conference swag pack, and morning refreshments.',
    description: 'Badge pickup, conference swag pack, and morning refreshments.',
    tags: ['Registration'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('09:15'),
    heightPx: getPxForTime('10:00') - getPxForTime('09:15') - 8,
    accentColor: '#0f6a49',
    badgeBg: 'bg-[#0f6a49]',
  },
  // 10:10 Opening
  {
    id: 'ADMIN-OPENING',
    title: 'Opening Remarks by PyCon HK Chairs',
    speakers: ['PyCon HK 2025 Organizing Team'],
    room: 'Main Track (Morning) (LT-18)',
    roomKey: 'main-am',
    trackKey: 'main',
    sessionType: 'Opening',
    day: 'day-1',
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '10:10',
    endTime: '10:20',
    time12: '10:10',
    amPm: 'AM',
    duration: 10,
    abstract: 'Welcome remarks and housekeeping announcements.',
    description: 'Welcome remarks and housekeeping announcements.',
    tags: ['Opening'],
    language: 'EN / BILINGUAL',
    isBreak: true,
    topPx: getPxForTime('10:10'),
    heightPx: 56,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  },
  // 10:20 Group Photo
  {
    id: 'ADMIN-PHOTO-AM',
    title: 'Morning Community Group Photo',
    speakers: [],
    room: 'Main Track (Morning) (LT-18)',
    roomKey: 'main-am',
    trackKey: 'main',
    sessionType: 'Photo',
    day: 'day-1',
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '10:20',
    endTime: '10:25',
    time12: '10:20',
    amPm: 'AM',
    duration: 5,
    abstract: 'Morning group photo in LT-18.',
    description: 'Morning group photo in LT-18.',
    tags: ['Photo'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('10:20'),
    heightPx: 56,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  },
  // 11:25 The Great Migration
  {
    id: 'ADMIN-MIGRATION',
    title: 'The Great Migration (Room Change)',
    speakers: [],
    room: 'Main Track (Morning) (LT-18)',
    roomKey: 'main-am',
    trackKey: 'main',
    sessionType: 'Break',
    day: 'day-1',
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '11:25',
    endTime: '11:30',
    time12: '11:25',
    amPm: 'AM',
    duration: 5,
    abstract: 'Transition to parallel breakout track rooms.',
    description: 'Transition to parallel breakout track rooms.',
    tags: ['Break'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('11:25'),
    heightPx: 56,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  },
  // 12:00 Break in 4 rooms
  ...(['main-am', 'track-a-sessions', 'track-b', 'track-c'] as RoomKey[]).map(
    (rKey) => ({
      id: `BREAK-1200-${rKey}`,
      title: '10-Min Transition Break',
      speakers: [],
      room: rKey,
      roomKey: rKey,
      trackKey: (rKey.startsWith('main')
        ? 'main'
        : rKey.startsWith('track-a')
          ? 'track-a'
          : rKey === 'track-b'
            ? 'track-b'
            : 'track-c') as TrackKey,
      sessionType: 'Break',
      day: 'day-1' as const,
      dayLabel: 'Saturday, October 11, 2025',
      dateString: '2025-10-11',
      startTime: '12:00',
      endTime: '12:10',
      time12: '12:00',
      amPm: 'PM' as const,
      duration: 10,
      abstract: '10-minute transition break.',
      description: '10-minute transition break.',
      tags: ['Break'],
      language: 'ALL',
      isBreak: true,
      topPx: getPxForTime('12:00'),
      heightPx: 56,
      accentColor: '#64748b',
      badgeBg: 'bg-slate-600',
    })
  ),
  // 14:30 Afternoon Break
  ...(['main-pm', 'track-b', 'track-c'] as RoomKey[]).map((rKey) => ({
    id: `BREAK-1430-${rKey}`,
    title: '10-Min Transition Break (Workshop continues in Track A)',
    speakers: [],
    room: rKey,
    roomKey: rKey,
    trackKey: (rKey.startsWith('main')
      ? 'main'
      : rKey === 'track-b'
        ? 'track-b'
        : 'track-c') as TrackKey,
    sessionType: 'Break',
    day: 'day-1' as const,
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '14:30',
    endTime: '14:40',
    time12: '2:30',
    amPm: 'PM' as const,
    duration: 10,
    abstract: '10-minute transition break (Workshop continues in Track A).',
    description: '10-minute transition break (Workshop continues in Track A).',
    tags: ['Break'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('14:30'),
    heightPx: 56,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  })),
  // 15:10 Afternoon Tea Break
  ...(['main-pm', 'track-b', 'track-c'] as RoomKey[]).map((rKey) => ({
    id: `BREAK-TEA-${rKey}`,
    title: '☕ Afternoon Tea Break & Booth Exploration',
    speakers: [],
    room: rKey,
    roomKey: rKey,
    trackKey: (rKey.startsWith('main')
      ? 'main'
      : rKey === 'track-b'
        ? 'track-b'
        : 'track-c') as TrackKey,
    sessionType: 'Break',
    day: 'day-1' as const,
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '15:10',
    endTime: '15:50',
    time12: '3:10',
    amPm: 'PM' as const,
    duration: 40,
    abstract: 'Afternoon tea, refreshments, and sponsor booth exploration.',
    description: 'Afternoon tea, refreshments, and sponsor booth exploration.',
    tags: ['Break', 'Networking'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('15:10'),
    heightPx: 75,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  })),
  // 16:20 Break
  ...(['main-pm', 'track-b'] as RoomKey[]).map((rKey) => ({
    id: `BREAK-1620-${rKey}`,
    title: '10-Min Transition Break (Workshop continues in Track A)',
    speakers: [],
    room: rKey,
    roomKey: rKey,
    trackKey: (rKey.startsWith('main') ? 'main' : 'track-b') as TrackKey,
    sessionType: 'Break',
    day: 'day-1' as const,
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '16:20',
    endTime: '16:30',
    time12: '4:20',
    amPm: 'PM' as const,
    duration: 10,
    abstract: '10-minute transition break (Workshop continues in Track A).',
    description: '10-minute transition break (Workshop continues in Track A).',
    tags: ['Break'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('16:20'),
    heightPx: 56,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  })),
  // 17:20 Break before Lightning Talks
  {
    id: 'BREAK-1720-MAIN',
    title: '10-Min Break for Lightning Talks Setup',
    speakers: [],
    room: 'Main Track (Afternoon) (LT-13)',
    roomKey: 'main-pm',
    trackKey: 'main',
    sessionType: 'Break',
    day: 'day-1',
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '17:20',
    endTime: '17:30',
    time12: '5:20',
    amPm: 'PM',
    duration: 10,
    abstract: '10-minute setup break before Lightning Talks.',
    description: '10-minute setup break before Lightning Talks.',
    tags: ['Break'],
    language: 'ALL',
    isBreak: true,
    topPx: getPxForTime('17:20'),
    heightPx: 56,
    accentColor: '#64748b',
    badgeBg: 'bg-slate-600',
  },
  // 18:05 Closing (LT-13)
  {
    id: 'ADMIN-CLOSING',
    title: '🎉 Closing Ceremony, Sponsor Lucky Draw & Annual Group Photo',
    speakers: ['PyCon HK Organizing Committee'],
    room: 'Main Track (Afternoon) (LT-13)',
    roomKey: 'main-pm',
    trackKey: 'main',
    sessionType: 'Closing',
    day: 'day-1',
    dayLabel: 'Saturday, October 11, 2025',
    dateString: '2025-10-11',
    startTime: '18:05',
    endTime: '18:30',
    time12: '6:05',
    amPm: 'PM',
    duration: 25,
    abstract:
      'Closing ceremony, sponsor lucky draw, volunteer thank you, and annual group photo.',
    description:
      'Closing ceremony, sponsor lucky draw, volunteer thank you, and annual group photo.',
    tags: ['Closing', 'Photo'],
    language: 'EN / BILINGUAL',
    isBreak: true,
    topPx: getPxForTime('18:05'),
    heightPx: 140,
    accentColor: '#d71920',
    badgeBg: 'bg-[#d71920]',
  },
];

export const allScheduleItems: ScheduleItem[] = [...rawTalks, ...breakEvents];

// Continuous time markers along the vertical axis
export type TimeMarker = {
  timeStr: string;
  time12: string;
  amPm: 'AM' | 'PM';
  topPx: number;
};

export function getContinuousTimeMarkers(): TimeMarker[] {
  const times = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
  ];

  return times.map((t) => {
    const { time12, amPm } = formatTime12(t);
    return {
      timeStr: t,
      time12: `${time12} ${amPm}`,
      amPm,
      topPx: getPxForTime(t),
    };
  });
}

export function getSessionsForRoom(roomKey: RoomKey): ScheduleItem[] {
  return allScheduleItems.filter((item) => item.roomKey === roomKey);
}

export type TimeSlotGroup = {
  slotKey: string;
  startTime: string;
  endTime: string;
  timeLabel: string;
  isBreakOnly: boolean;
  sessions: ScheduleItem[];
};

export function getTimeSlotGroups(day: 'day-1' | 'day-2' = 'day-1'): TimeSlotGroup[] {
  const items = allScheduleItems.filter((s) => s.day === day);

  // Dedup break events that share the same startTime and title
  const seenBreakKeys = new Set<string>();
  const dedupedItems: ScheduleItem[] = [];

  for (const item of items) {
    if (item.isBreak) {
      const breakKey = `${item.startTime}-${item.title}`;
      if (seenBreakKeys.has(breakKey)) continue;
      seenBreakKeys.add(breakKey);
    }
    dedupedItems.push(item);
  }

  const trackOrder: Record<string, number> = {
    'main-am': 1,
    'main-pm': 2,
    'track-a-sessions': 3,
    'track-a-workshop': 4,
    'track-b': 5,
    'track-c': 6,
  };

  dedupedItems.sort((a, b) => {
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return (trackOrder[a.roomKey] || 99) - (trackOrder[b.roomKey] || 99);
  });

  const map = new Map<string, ScheduleItem[]>();
  for (const item of dedupedItems) {
    const list = map.get(item.startTime) || [];
    list.push(item);
    map.set(item.startTime, list);
  }

  const groups: TimeSlotGroup[] = [];
  for (const [startTime, slotSessions] of map.entries()) {
    const endTimes = slotSessions.map((s) => s.endTime).sort();
    const maxEnd = endTimes[endTimes.length - 1];
    const isBreakOnly = slotSessions.every((s) => s.isBreak);

    groups.push({
      slotKey: startTime,
      startTime,
      endTime: maxEnd,
      timeLabel: `${startTime} – ${maxEnd}`,
      isBreakOnly,
      sessions: slotSessions,
    });
  }

  return groups;
}
