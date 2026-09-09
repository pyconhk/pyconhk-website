import indy from '@/years/2026/assets/speakers/indy-ho.jpg';
import jacky from '@/years/2026/assets/speakers/jacky-chan.webp';
import paul from '@/years/2026/assets/speakers/paul-everitt.jpg';
import quinson from '@/years/2026/assets/speakers/quinson-hon.webp';
import type { CfpLocale } from '@/years/2026/locales';

// Engagement team's selected 2026 slate, independent of the timetable source.
// Brief: https://docs.google.com/document/d/1KAH42Ml0QMPX3bnxswUIeId9b0JiqzuDLTftU-xwr6Y/edit
// Portraits: Paul — JetBrains Guide; Jacky / Quinson — their Pretalx uploads;
// Indy — VTC expert profile. Original photos, bundled by Astro at build time.
export const featuredSpeakers = [
  {
    name: 'Paul Everitt',
    title: 'Was, Is, Will Be: Python History, Software Engineering, And AI Our Way',
    language: 'en',
    keynote: true,
    image: paul,
  },
  {
    name: 'Jacky Chan',
    title: 'AI 聽到聲音時，會聯想到乜嘢？',
    language: 'zh-Hant-HK',
    keynote: false,
    image: jacky,
  },
  {
    name: 'Hon Kwan Shun Quinson',
    title: 'Property-Based Testing with Hypothesis',
    language: 'en',
    keynote: false,
    image: quinson,
  },
  {
    name: 'Indy Ho',
    title:
      'Python Applications in Sports Science, Injury Prevention and Physical Fitness Promotion',
    language: 'en',
    keynote: false,
    image: indy,
  },
];

export const featuredLabels: Record<CfpLocale, { keynote: string; talk: string }> = {
  en: { keynote: 'Keynote', talk: 'Featured talk' },
  'zh-hk': { keynote: '主題演講', talk: '精選演講' },
  'zh-hant': { keynote: '主題演講', talk: '精選演講' },
  'zh-hans': { keynote: '主题演讲', talk: '精选演讲' },
  ja: { keynote: '基調講演', talk: '注目の講演' },
  ko: { keynote: '기조연설', talk: '주목할 발표' },
};
