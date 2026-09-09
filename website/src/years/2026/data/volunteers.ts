import type { CfpLocale } from '@/years/2026/locales';

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
      'Volunteers are the heart of PyCon Hong Kong 2026. We sincerely thank them for their months of tireless effort, making this conference a reality. Below is a list of our committed volunteers.',
    committeeHeading: 'Executive Committee',
    chairHeading: 'Conference Chair',
    coChairsHeading: 'Conference Co-Chairs',
    membersHeading: 'Organizing Committee Members',
  },
  'zh-hk': {
    title: '義工團隊',
    subtitle: 'PyCon HK 2026 的核心力量',
    intro:
      '義工是 PyCon Hong Kong 2026 的核心力量。感謝他們在過去數月默默付出，讓這場會議得以成形。以下是本屆大會的義工名單。',
    committeeHeading: '執行委員會',
    chairHeading: '大會主席',
    coChairsHeading: '大會副主席',
    membersHeading: '籌委會成員',
  },
  'zh-hant': {
    title: '義工團隊',
    subtitle: 'PyCon HK 2026 的核心力量',
    intro:
      '義工是 PyCon Hong Kong 2026 的核心力量。感謝他們在過去數月默默付出，讓這場會議得以成形。以下是本屆大會的義工名單。',
    committeeHeading: '執行委員會',
    chairHeading: '大會主席',
    coChairsHeading: '大會副主席',
    membersHeading: '籌委會成員',
  },
  'zh-hans': {
    title: '志愿者团队',
    subtitle: 'PyCon HK 2026 的核心力量',
    intro:
      '志愿者是 PyCon Hong Kong 2026 的核心力量。感谢他们在过去数月默默付出，让这场会议得以成形。以下是本届大会的志愿者名单。',
    committeeHeading: '执行委员会',
    chairHeading: '大会主席',
    coChairsHeading: '大会副主席',
    membersHeading: '筹委会成员',
  },
  ja: {
    title: 'ボランティア',
    subtitle: 'PyCon HK 2026 を支える力',
    intro:
      'PyCon Hong Kong 2026 を支えているのは、ボランティアの皆さんです。ここ数か月にわたる尽力に心から感謝します。以下に、本大会を支えるメンバーをご紹介します。',
    committeeHeading: '実行委員会',
    chairHeading: '大会長',
    coChairsHeading: '共同チェア',
    membersHeading: '運営委員',
  },
  ko: {
    title: '자원봉사자',
    subtitle: 'PyCon HK 2026의 원동력',
    intro:
      '자원봉사자는 PyCon Hong Kong 2026의 핵심 원동력입니다. 수개월 동안 아낌없이 헌신해 주신 자원봉사자분들께 진심으로 감사드리며, 아래는 이번 대회를 이끄는 봉사자 명단입니다.',
    committeeHeading: '집행위원회',
    chairHeading: '컨퍼런스 의장',
    coChairsHeading: '컨퍼런스 공동 의장',
    membersHeading: '조직위원회 위원',
  },
};
