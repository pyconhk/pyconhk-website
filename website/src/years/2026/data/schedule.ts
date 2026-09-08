import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  unpublishedSnapshot,
  validateSnapshot,
} from '../../../lib/programme/snapshot.ts';

import type { ProgrammeSnapshot } from '../../../lib/programme/types';

export type { ProgrammeSnapshot, ScheduleItem } from '../../../lib/programme/types';

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
