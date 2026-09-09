import indy from '@/years/2026/assets/speakers/indy-ho.jpg';
import jacky from '@/years/2026/assets/speakers/jacky-chan.webp';
import paul from '@/years/2026/assets/speakers/paul-everitt.jpg';
import quinson from '@/years/2026/assets/speakers/quinson-hon.webp';
import type { CfpLocale } from '@/years/2026/locales';
import talks from './featured-talks.json';

// Engagement team's selected 2026 slate, independent of the timetable source.
// Brief: https://docs.google.com/document/d/1KAH42Ml0QMPX3bnxswUIeId9b0JiqzuDLTftU-xwr6Y/edit
// Portraits: Paul — JetBrains Guide; Jacky / Quinson — their Pretalx uploads;
// Indy — VTC expert profile. Original photos, bundled by Astro at build time.
// featured-talks.json contains only the four selected talks' attendee-facing
// abstracts and speaker biographies (2026 submissions, captured 2026-07-29).
// Refresh these from the 2026 public feed when that programme is released.
export const featuredSpeakers = [
  {
    code: 'NLFQSW',
    name: 'Paul Everitt',
    title: 'Was, Is, Will Be: Python History, Software Engineering, And AI Our Way',
    language: 'en',
    keynote: true,
    image: paul,
  },
  {
    code: 'TSBGZH',
    name: 'Jacky Chan',
    title: 'AI 聽到聲音時，會聯想到乜嘢？',
    language: 'zh-Hant-HK',
    keynote: false,
    image: jacky,
  },
  {
    code: '9NKPSV',
    name: 'Hon Kwan Shun Quinson',
    title: 'Property-Based Testing with Hypothesis',
    language: 'en',
    keynote: false,
    image: quinson,
  },
  {
    code: 'TF3HKJ',
    name: 'Indy Ho',
    title:
      'Python Applications in Sports Science, Injury Prevention and Physical Fitness Promotion',
    language: 'en',
    keynote: false,
    image: indy,
  },
].map((speaker) => {
  const talk = talks.find((talk) => talk.code === speaker.code);
  if (!talk) throw new Error(`Missing featured talk: ${speaker.code}`);
  return { ...speaker, ...talk };
});

export type FeaturedSpeaker = (typeof featuredSpeakers)[number];

export const featuredLabels: Record<
  CfpLocale,
  { keynote: string; talk: string; view: string; back: string }
> = {
  en: {
    keynote: 'Keynote',
    talk: 'Featured talk',
    view: 'View talk',
    back: 'Back to featured speakers',
  },
  'zh-hk': {
    keynote: '主題演講',
    talk: '精選演講',
    view: '睇講題詳情',
    back: '返回精選講者',
  },
  'zh-hant': {
    keynote: '主題演講',
    talk: '精選演講',
    view: '查看講題詳情',
    back: '返回精選講者',
  },
  'zh-hans': {
    keynote: '主题演讲',
    talk: '精选演讲',
    view: '查看讲题详情',
    back: '返回精选讲者',
  },
  ja: {
    keynote: '基調講演',
    talk: '注目の講演',
    view: '講演の詳細を見る',
    back: '注目の登壇者に戻る',
  },
  ko: {
    keynote: '기조연설',
    talk: '주목할 발표',
    view: '발표 자세히 보기',
    back: '주목할 연사로 돌아가기',
  },
};
