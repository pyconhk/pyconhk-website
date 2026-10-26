import { getChineseTerms } from '@/years/2026/i18n/chinese-terms';
import type { CfpLocale } from '@/years/2026/locales';

const written = getChineseTerms('zh-hant');
const cantonese = getChineseTerms('zh-hk');

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
  close: string;
  viewSponsors: string;
  directions: string;
  wifi: string;
  sponsorship: string;
  speakers: string;
  proposeSprint: string;
  foundationSponsor: string;
  consecutiveSupport: (years: number) => string;
  cumulativeSupport: (years: number) => string;
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
    close: 'Close',
    viewSponsors: 'View all sponsors',
    directions: 'Getting here',
    wifi: 'Wi-Fi',
    sponsorship: 'Sponsorship enquiries',
    speakers: 'Featured speakers',
    proposeSprint: 'Submit a Sprint project / become a Sprint Lead',
    foundationSponsor: 'Foundation Sponsor',
    consecutiveSupport: (years) => `${years} consecutive years of support`,
    cumulativeSupport: (years) => `${years} years of support in total`,
  },
  'zh-hk': {
    titles: {
      about: '關於 PyCon HK',
      venue: cantonese.accessGuide,
      catering: cantonese.cateringGuide,
      sprint: cantonese.sprintDay,
      qa: cantonese.sprintQa,
      sponsors: cantonese.sponsors,
      patrons: cantonese.patrons,
      organizers: cantonese.organizers,
      supporters: cantonese.communities,
      people: cantonese.volunteers,
    },
    comingSoon: cantonese.comingSoon,
    ticketsSoon: cantonese.ticketsSoon,
    register: cantonese.register,
    viewMap: cantonese.viewMap,
    visitWebsite: cantonese.visitWebsite,
    close: '關閉',
    viewSponsors: cantonese.viewSponsors,
    directions: cantonese.directions,
    wifi: 'Wi-Fi',
    sponsorship: cantonese.sponsorshipEnquiries,
    speakers: cantonese.featuredSpeakers,
    proposeSprint: '提交衝刺項目／報名做 Sprint Lead',
    foundationSponsor: '基金會贊助',
    consecutiveSupport: (years) => `連續支持咗 ${years} 年`,
    cumulativeSupport: (years) => `累計支持咗 ${years} 年`,
  },
  'zh-hant': {
    titles: {
      about: '關於 PyCon HK',
      venue: written.accessGuide,
      catering: written.cateringGuide,
      sprint: written.sprintDay,
      qa: written.sprintQa,
      sponsors: written.sponsors,
      patrons: written.patrons,
      organizers: written.organizers,
      supporters: written.communities,
      people: written.volunteers,
    },
    comingSoon: written.comingSoon,
    ticketsSoon: written.ticketsSoon,
    register: written.register,
    viewMap: written.viewMap,
    visitWebsite: written.visitWebsite,
    close: '關閉',
    viewSponsors: written.viewSponsors,
    directions: written.directions,
    wifi: 'Wi-Fi',
    sponsorship: written.sponsorshipEnquiries,
    speakers: written.featuredSpeakers,
    proposeSprint: '提交衝刺專案／報名成為 Sprint Lead',
    foundationSponsor: '基金會贊助',
    consecutiveSupport: (years) => `連續支持 ${years} 年`,
    cumulativeSupport: (years) => `累計支持 ${years} 年`,
  },
  'zh-hans': {
    titles: {
      about: '关于 PyCon HK',
      venue: '交通指南',
      catering: '餐饮指南',
      sprint: '冲刺开发日',
      qa: '冲刺开发常见问题',
      sponsors: '赞助伙伴',
      patrons: '个人赞助',
      organizers: '主办单位',
      supporters: '社区伙伴',
      people: '志愿者团队',
    },
    comingSoon: '详情即将公布。',
    ticketsSoon: '门票即将公布',
    register: '立即报名',
    viewMap: '查看地图',
    visitWebsite: '浏览网站',
    close: '关闭',
    viewSponsors: '查看所有赞助伙伴',
    directions: '前往会场',
    wifi: 'Wi-Fi',
    sponsorship: '咨询赞助合作',
    speakers: '精选讲者',
    proposeSprint: '提交冲刺项目／报名成为 Sprint Lead',
    foundationSponsor: '基金会赞助',
    consecutiveSupport: (years) => `连续支持 ${years} 年`,
    cumulativeSupport: (years) => `累计支持 ${years} 年`,
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
    close: '閉じる',
    viewSponsors: 'すべてのスポンサーを見る',
    directions: '会場へのアクセス',
    wifi: 'Wi-Fi',
    sponsorship: '協賛のお問い合わせ',
    speakers: '注目の登壇者',
    proposeSprint: 'スプリントのプロジェクト・リードに応募する',
    foundationSponsor: '財団スポンサー',
    consecutiveSupport: (years) => `${years}年連続のご支援`,
    cumulativeSupport: (years) => `通算${years}年のご支援`,
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
    close: '닫기',
    viewSponsors: '모든 후원사 보기',
    directions: '오시는 길',
    wifi: 'Wi-Fi',
    sponsorship: '후원 문의',
    speakers: '주요 연사',
    proposeSprint: '스프린트 프로젝트 제안 / 리드 신청',
    foundationSponsor: '재단 후원',
    consecutiveSupport: (years) => `${years}년 연속 후원`,
    cumulativeSupport: (years) => `총 ${years}년 후원`,
  },
};
