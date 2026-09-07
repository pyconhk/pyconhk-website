import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  unpublishedSnapshot,
  validateSnapshot,
} from '../../../../scripts/programme-snapshot.mjs';

export type ScheduleItem = {
  id: string;
  code: string;
  title: string;
  speakers: string[];
  room: string;
  roomKey: string;
  track: string;
  sessionType: string;
  date: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  duration: number;
  abstract: string;
  description: string;
  language: string;
  url: string;
  isBreak: boolean;
};

export type ProgrammeSnapshot = {
  formatVersion: 1;
  event: string;
  environment: string;
  status: 'published' | 'unpublished';
  sourceUrl: string;
  sourceVersion: string;
  title: string;
  timezone: string;
  startDate: string;
  endDate: string;
  days: { date: string }[];
  rooms: { id: string; name: string }[];
  sessions: ScheduleItem[];
  fetchedAt: string;
  hash: string;
};

const sourceEvent = process.env.PROGRAMME_SOURCE_EVENT ?? 'pyconhk2026';
const environment = process.env.PROGRAMME_ENVIRONMENT ?? 'production';
const snapshotPath = process.env.PROGRAMME_SNAPSHOT_PATH;

if (environment === 'production' && sourceEvent !== 'pyconhk2026') {
  throw new Error('Production cannot publish a previous-year sample programme.');
}

export const programmeSnapshot: ProgrammeSnapshot = snapshotPath
  ? validateSnapshot(
      JSON.parse(readFileSync(resolve(snapshotPath), 'utf8')),
      sourceEvent,
      environment
    )
  : unpublishedSnapshot({ event: sourceEvent, environment });

export const allScheduleItems = programmeSnapshot.sessions;
export const roomColumns = programmeSnapshot.rooms;
export const isSampleProgramme = programmeSnapshot.event !== 'pyconhk2026';

export function formatProgrammeDate(date: string, locale: string): string {
  const dateLocale = locale === 'zh-hk' ? 'zh-HK' : locale;
  return new Intl.DateTimeFormat(dateLocale, {
    timeZone: programmeSnapshot.timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00+08:00`));
}
