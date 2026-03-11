import type { ScheduleSessionOverrides } from '@/lib/schedule';

export const scheduleSessionOverrides = {
  '3WPDCG': {
    status: 'virtual',
    note: {
      en: 'This session is delivered remotely and streamed in the scheduled room.',
      'zh-hk': '此場次改為線上講演，並會在原定房間同步播放。',
      'zh-hant': '此場次改為線上講演，並會在原定房間同步播放。',
      'zh-hans': '此场次改为线上讲演，并会在原定房间同步播放。',
      ja: 'このセッションはオンライン登壇に変更され、予定どおりの会場で同時配信されます。',
    },
  },
} satisfies ScheduleSessionOverrides;
