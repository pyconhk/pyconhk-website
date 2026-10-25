import { getChineseTerms } from '@/years/2026/i18n/chinese-terms';
import type { CfpLocale } from '@/years/2026/locales';

const written = getChineseTerms('zh-hant');
const cantonese = getChineseTerms('zh-hk');

export type VolunteerProfile = {
  name: string;
  imageSrc: string;
  linkedin?: string;
  personalWebsite?: string;
};

export type VolunteersPageCopy = {
  title: string;
  subtitle: string;
  intro: string;
  committeeHeading: string;
  chairHeading: string;
  coChairsHeading: string;
  membersHeading: string;
};

export const conferenceChair: VolunteerProfile = {
  name: 'Mr. Calvin Tsang',
  imageSrc: '/2026/organizers-volunteers/volunteers/calvin-tsang-compressed.webp',
  linkedin: 'https://www.linkedin.com/in/calvin-tyl/',
};

export const conferenceCoChairs: readonly VolunteerProfile[] = [
  {
    name: 'Mr. Alex Au',
    imageSrc: '/2026/organizers-volunteers/volunteers/alex-au-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/alex-au-606901206/',
  },
  {
    name: 'Ms. Daisy Maris Fung',
    imageSrc: '/2026/organizers-volunteers/volunteers/daisy-maris-fung-compressed.webp',
    personalWebsite: 'https://www.daisymarisfung.com/',
  },
] as const;

export const organizingCommitteeMembers: readonly VolunteerProfile[] = [
  {
    name: 'Mr. Adrian Tam',
    imageSrc: '/2026/organizers-volunteers/volunteers/adrian-tam-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/adrian-tam-0666b08/',
  },
  {
    name: 'Ms. Cathy Hui',
    imageSrc: '/2026/organizers-volunteers/volunteers/placeholder.webp',
  },
  {
    name: 'Ms. Cintia Ching',
    imageSrc: '/2026/organizers-volunteers/volunteers/cintia-ching.webp',
    linkedin: 'https://www.linkedin.com/in/cintiaching',
  },
  {
    name: 'Mr. Henry Law',
    imageSrc: '/2026/organizers-volunteers/volunteers/henry-law-compressed.webp',
  },
  {
    name: 'Ms. Janny Leung',
    imageSrc: '/2026/organizers-volunteers/volunteers/janny-leung.webp',
  },
  {
    name: 'Mr. Ka Ki Ting',
    imageSrc: '/2026/organizers-volunteers/volunteers/ka-ki-ting-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/tinglogy/',
  },
  {
    name: 'Ms. Maya Yan',
    imageSrc: '/2026/organizers-volunteers/volunteers/maya-yan-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/yantungmaya/',
  },
  {
    name: 'Mr. Ronald Yick',
    imageSrc: '/2026/organizers-volunteers/volunteers/ronald-yick-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/ronald-yick/',
  },
  {
    name: 'Mr. Scotty Kwok',
    imageSrc: '/2026/organizers-volunteers/volunteers/scotty-kwok-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/scottykwok/',
  },
  {
    name: 'Mr. Sky Ng',
    imageSrc: '/2026/organizers-volunteers/volunteers/sky-ng-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/sky-ng-ab307b252/',
  },
  {
    name: 'Mr. Ted Yuen',
    imageSrc: '/2026/organizers-volunteers/volunteers/ted-yuen-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/ted-yuen/',
  },
  {
    name: 'Mr. Tommy Han',
    imageSrc: '/2026/organizers-volunteers/volunteers/tommy-han-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/tommy-han-236a85144/',
  },
] as const;

export const pageCopyByLocale: Record<CfpLocale, VolunteersPageCopy> = {
  en: {
    title: 'Volunteers',
    subtitle: 'Heart & Soul of PyCon HK 2026',
    intro:
      'Volunteers are the heart of PyCon Hong Kong 2026. Thank you to everyone helping organize, design, promote, and run the conference. Meet the team below.',
    committeeHeading: 'Executive Committee',
    chairHeading: 'Conference Chair',
    coChairsHeading: 'Conference Co-Chairs',
    membersHeading: 'Organizing Committee Members',
  },
  'zh-hk': {
    title: cantonese.volunteers,
    subtitle: 'PyCon HK 2026 嘅核心力量',
    intro:
      '義工係 PyCon Hong Kong 2026 嘅核心力量。多謝大家喺籌備、設計、推廣同現場工作上嘅付出。以下係今年大會嘅團隊名單。',
    committeeHeading: '執行委員會',
    chairHeading: '大會主席',
    coChairsHeading: '大會副主席',
    membersHeading: '籌委會成員',
  },
  'zh-hant': {
    title: written.volunteers,
    subtitle: 'PyCon HK 2026 的核心力量',
    intro:
      '義工是 PyCon Hong Kong 2026 的核心力量。感謝大家在籌備、設計、推廣及現場工作上的貢獻。以下是本屆大會的團隊名單。',
    committeeHeading: '執行委員會',
    chairHeading: '大會主席',
    coChairsHeading: '大會副主席',
    membersHeading: '籌委會成員',
  },
  'zh-hans': {
    title: '志愿者团队',
    subtitle: 'PyCon HK 2026 的核心力量',
    intro:
      '志愿者是 PyCon Hong Kong 2026 的核心力量。感谢大家在筹备、设计、推广及现场工作中的贡献。以下是本届大会的团队名单。',
    committeeHeading: '执行委员会',
    chairHeading: '大会主席',
    coChairsHeading: '大会副主席',
    membersHeading: '筹委会成员',
  },
  ja: {
    title: 'ボランティア',
    subtitle: 'PyCon HK 2026 を支える力',
    intro:
      'PyCon Hong Kong 2026 を支えているのは、ボランティアの皆さんです。企画、デザイン、広報、当日の運営に携わる皆さんに心から感謝します。本大会を支えるメンバーをご紹介します。',
    committeeHeading: '実行委員会',
    chairHeading: '実行委員長',
    coChairsHeading: '共同実行委員長',
    membersHeading: '運営委員',
  },
  ko: {
    title: '자원봉사자',
    subtitle: 'PyCon HK 2026의 원동력',
    intro:
      '자원봉사자는 PyCon Hong Kong 2026의 원동력입니다. 기획, 디자인, 홍보, 현장 운영에 힘써 주시는 모든 분께 감사드립니다. 이번 행사를 함께 만드는 팀을 소개합니다.',
    committeeHeading: '집행위원회',
    chairHeading: '컨퍼런스 의장',
    coChairsHeading: '컨퍼런스 공동 의장',
    membersHeading: '조직위원회 위원',
  },
};
