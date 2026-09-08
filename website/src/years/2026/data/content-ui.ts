import type { CfpLocale } from '@/years/2026/locales';

export type ContentPageKind =
  | 'about'
  | 'venue'
  | 'catering'
  | 'sprint'
  | 'qa'
  | 'sponsors'
  | 'patrons'
  | 'organizers'
  | 'supporters'
  | 'people';

type ContentUi = {
  titles: Record<ContentPageKind, string>;
  comingSoon: string;
  ticketsSoon: string;
  register: string;
  viewMap: string;
  visitWebsite: string;
  directions: string;
  wifi: string;
  sponsorship: string;
  speakers: string;
};

export const contentUi: Record<CfpLocale, ContentUi> = {
  en: {
    titles: {
      about: 'About PyCon HK',
      venue: 'Access Guide',
      catering: 'Catering Guide',
      sprint: 'Sprint Day',
      qa: 'Sprint Q&A',
      sponsors: 'Sponsors',
      patrons: 'Patrons',
      organizers: 'Organizing Organizations',
      supporters: 'Community Partners',
      people: 'Volunteers',
    },
    comingSoon: 'Details will be announced soon.',
    ticketsSoon: 'Tickets coming soon',
    register: 'Register now',
    viewMap: 'View map',
    visitWebsite: 'Visit website',
    directions: 'Getting here',
    wifi: 'Wi-Fi',
    sponsorship: 'Sponsorship enquiries',
    speakers: 'Featured speakers',
  },
  'zh-hk': {
    titles: {
      about: '關於 PyCon HK',
      venue: '交通指南',
      catering: '餐飲指南',
      sprint: 'Sprint 開發日',
      qa: 'Sprint 常見問題',
      sponsors: '贊助夥伴',
      patrons: '鳴謝贊助人',
      organizers: '主辦單位',
      supporters: '社群夥伴',
      people: '義工團隊',
    },
    comingSoon: '詳情即將公佈。',
    ticketsSoon: '門票即將公佈',
    register: '立即報名',
    viewMap: '睇地圖',
    visitWebsite: '瀏覽網站',
    directions: '前往會場',
    wifi: 'Wi-Fi',
    sponsorship: '查詢贊助合作',
    speakers: '精選講者',
  },
  'zh-hant': {
    titles: {
      about: '關於 PyCon HK',
      venue: '交通指南',
      catering: '餐飲指南',
      sprint: 'Sprint 開發日',
      qa: 'Sprint 常見問題',
      sponsors: '贊助夥伴',
      patrons: '鳴謝贊助人',
      organizers: '主辦單位',
      supporters: '社群夥伴',
      people: '志工團隊',
    },
    comingSoon: '詳情即將公布。',
    ticketsSoon: '門票即將公布',
    register: '立即報名',
    viewMap: '查看地圖',
    visitWebsite: '瀏覽網站',
    directions: '前往會場',
    wifi: 'Wi-Fi',
    sponsorship: '洽詢贊助合作',
    speakers: '精選講者',
  },
  'zh-hans': {
    titles: {
      about: '关于 PyCon HK',
      venue: '交通指南',
      catering: '餐饮指南',
      sprint: 'Sprint 开发日',
      qa: 'Sprint 常见问题',
      sponsors: '赞助伙伴',
      patrons: '鸣谢赞助人',
      organizers: '主办单位',
      supporters: '社区伙伴',
      people: '志愿者团队',
    },
    comingSoon: '详情即将公布。',
    ticketsSoon: '门票即将公布',
    register: '立即报名',
    viewMap: '查看地图',
    visitWebsite: '浏览网站',
    directions: '前往会场',
    wifi: 'Wi-Fi',
    sponsorship: '咨询赞助合作',
    speakers: '精选讲者',
  },
  ja: {
    titles: {
      about: 'PyCon HK について',
      venue: 'アクセスガイド',
      catering: '食事ガイド',
      sprint: 'スプリントデー',
      qa: 'スプリント Q&A',
      sponsors: 'スポンサー',
      patrons: '個人スポンサー',
      organizers: '主催団体',
      supporters: 'コミュニティパートナー',
      people: 'ボランティア',
    },
    comingSoon: '詳細は近日公開予定です。',
    ticketsSoon: 'チケット情報は近日公開',
    register: '参加登録',
    viewMap: '地図を見る',
    visitWebsite: 'ウェブサイトを見る',
    directions: '会場へのアクセス',
    wifi: 'Wi-Fi',
    sponsorship: '協賛のお問い合わせ',
    speakers: '注目の登壇者',
  },
  ko: {
    titles: {
      about: 'PyCon HK 소개',
      venue: '오시는 길',
      catering: '식사 안내',
      sprint: '스프린트 데이',
      qa: '스프린트 Q&A',
      sponsors: '후원사',
      patrons: '개인 후원자',
      organizers: '주최 단체',
      supporters: '커뮤니티 파트너',
      people: '자원봉사자',
    },
    comingSoon: '자세한 내용은 곧 공개됩니다.',
    ticketsSoon: '티켓 정보 공개 예정',
    register: '참가 등록',
    viewMap: '지도 보기',
    visitWebsite: '웹사이트 방문',
    directions: '오시는 길',
    wifi: 'Wi-Fi',
    sponsorship: '후원 문의',
    speakers: '주요 연사',
  },
};
