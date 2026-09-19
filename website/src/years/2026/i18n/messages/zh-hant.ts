import { getChineseTerms } from '@/years/2026/i18n/chinese-terms';
import type { HomeMessages } from '@/years/2026/i18n/schema';

const terms = getChineseTerms('zh-hant');

export const zhHant: HomeMessages = {
  meta: {
    title: 'PyCon HK 2026 | 編程・連結・前行',
    description:
      '與來自各地的 Python 社群相聚香港，交流技術與開源經驗，共同探索以人為本的 AI 發展。',
  },
  nav: {
    brand: 'PyCon HK 2026',
    about: terms.aboutUs,
    programme: terms.programme,
    venue: terms.venue,
    sponsors: terms.sponsors,
    register: terms.register,
    cfp: '講題徵集 CFP',
    menuLabel: terms.menuLabel,
    closeMenu: terms.closeMenu,
  },
  hero: {
    badge: 'HONG KONG · NOV 2026',
    headline: '編程・連結・前行',
    headlineAccent: '',
    subheadline:
      '與來自各地的 Python 社群相聚香港，交流技術與開源經驗，共同探索以人為本的 AI 發展。',
    registerCta: terms.register,
    calendarCta: terms.calendar,
    whenLabel: '日期',
    whenValue: '2026 年 11 月 14–15 日',
    whereLabel: '地點',
    whereValue: '香港',
    forLabel: '對象',
    forValue: '各地的 Python 使用者與愛好者',
  },
  highlights: [
    {
      icon: 'mic',
      title: '來自各地的分享',
      description: '透過演講與工作坊，和世界各地的 Python 開發者交流。',
    },
    {
      icon: 'calendar',
      title: '兩天大會',
      description: '利用一個週末學習新知、分享技術，並認識志同道合的朋友。',
    },
    {
      icon: 'pin',
      title: '立足香港',
      description: '由本地社群出發，與世界各地的 Python 愛好者相聚。',
    },
  ],
  programme: {
    eyebrow: '大會議程 PROGRAMME',
    title: '讓各種 Python 想法都有交流的空間',
    description:
      '從程式設計到開源社群，透過不同主題的分享，學習實用技能，也認識可以一起開發的夥伴。',
    tracks: [
      {
        number: '01',
        icon: 'code',
        title: 'Build with Python',
        description: '探索實用工具與程式架構，享受親手開發應用程式的樂趣。',
      },
      {
        number: '02',
        icon: 'ai',
        title: 'Data & AI',
        description: '交流資料科學、機器學習，以及負責任地應用人工智慧的經驗。',
      },
      {
        number: '03',
        icon: 'community',
        title: 'People & Community',
        description: '分享開源文化、職涯故事與社群經驗，認識推動 Python 發展的人。',
      },
    ],
  },
  hongKongThread: {
    eyebrow: 'A HONG KONG THREAD',
    title: '屬於香港的節奏',
    description:
      '紅白藍膠袋是香港人熟悉的日常物件，實用而堅韌。經緯交織成結實的布料，正如 Python 社群由每一位參與者的分享與合作累積而成。',
    location: '香港特別行政區 Hong Kong SAR',
  },
  joinUs: {
    sprintDescription:
      '一起開發 Python 專案、交流想法，為開源出一分力。了解衝刺開發日的活動與參與方式。',
    sponsorDescription:
      '支持香港 Python 社群，讓更多人有機會交流與學習。查看贊助方案，了解貴機構的參與方式。',
    eyebrow: '加入我們 JOIN US',
    title: '帶著好奇心，來認識 Python 社群。',
    description:
      '無論你剛開始學習 Python、正在維護大型專案，還是希望尋找合作夥伴，都歡迎參加 PyCon HK。',
    ctaAria: '了解參與方式',
    atAGlanceTitle: '大會概覽 AT A GLANCE',
    datesLabel: '日期 DATES',
    datesValue: '2026 年 11 月 14–15 日',
    locationLabel: '地點 LOCATION',
    locationValue: '香港特別行政區 Hong Kong SAR',
    stayTunedLabel: '更多資訊 STAY TUNED',
    stayTunedValue: '詳細場地與門票資訊將陸續公布。',
  },
  sponsors: {
    eyebrow: '社群夥伴 PARTNER WITH THE COMMUNITY',
    title: '一起支持開源社群',
    description:
      '感謝贊助夥伴支持 PyCon HK，讓 Python 社群有機會相聚、分享知識，並幫助更多人踏出學習技術的第一步。',
    tiers: [
      { name: '白金級夥伴 Platinum', tier: 'platinum' },
      { name: '金級夥伴 Gold', tier: 'gold' },
      { name: '銀級夥伴 Silver', tier: 'silver' },
      { name: '社群夥伴 Community', tier: 'community' },
    ],
    prospectusCta: '成為贊助夥伴',
  },
  footer: {
    brand: 'PyCon HK 2026',
    summary: '由社群共同籌辦的香港 Python 年度聚會，讓大家在交流中學習與成長。',
    conferenceGuideTitle: '大會導覽',
    aboutLink: '關於 PyCon HK',
    sponsorLink: '成為贊助夥伴',
    registrationLink: '大會報名',
    codeOfConductLink: 'Code of Conduct',
    privacyPolicyLink: 'Privacy Policy',
    copyright: '© 2026 PyCon HK. 社群主導，立足香港。',
    tagline: 'Python, people, possibility.',
    termsAndSupport: '條款與支援',
    privacyPolicy: 'Privacy Policy',
  },
  schedule: {
    pageTitle: '大會議程 | PyCon HK 2026',
    pageDescription: '查看 PyCon Hong Kong 2026 的演講、工作坊、主題演講與時間表。',
    heroTitle: terms.programme,
    heroSubtitle: '查看兩天的活動安排，規劃你的參與行程。',
    day1: '第一天（11 月 14 日，週六）',
    day2: '第二天（11 月 15 日，週日）',
    allTracks: '所有分軌',
    searchPlaceholder: '搜尋演講、講者或技術主題…',
    mySchedule: '我的收藏議程',
    myScheduleEmpty: '你尚未收藏任何演講。選擇演講卡片上的收藏按鈕，即可加入個人行程。',
    noResults: '沒有符合篩選條件的議程。',
    details: terms.sessionDetails,
    addToCalendar: terms.calendar,
    speaker: terms.speakers,
    speakers: terms.speakers,
    room: terms.room,
    time: terms.time,
    duration: '長度',
    language: '語言',
    abstract: '演講摘要',
    close: terms.close,
  },
};
