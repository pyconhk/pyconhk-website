import { getChineseTerms } from '@/years/2026/i18n/chinese-terms';
import type { HomeMessages } from '@/years/2026/i18n/schema';

const terms = getChineseTerms('zh-hk');

export const zhHk: HomeMessages = {
  meta: {
    title: 'PyCon HK 2026 | 編程・連結・前行',
    description:
      '同世界各地嘅 Python 社群喺香港見面，分享技術同開源經驗，一齊探索以人為本嘅 AI 發展。',
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
      '同世界各地嘅 Python 社群喺香港見面，分享技術同開源經驗，一齊探索以人為本嘅 AI 發展。',
    registerCta: terms.register,
    calendarCta: terms.calendar,
    whenLabel: '日期',
    whenValue: '2026 年 11 月 14–15 日',
    whereLabel: '地點',
    whereValue: '香港',
    forLabel: '對象',
    forValue: '世界各地嘅 Python 用家同愛好者',
  },
  highlights: [
    {
      icon: 'mic',
      title: '世界各地嘅分享',
      description: '透過演講同工作坊，同世界各地嘅 Python 開發者交流。',
    },
    {
      icon: 'calendar',
      title: '兩日大會',
      description: '用一個週末學新嘢、分享技術，同時識啲志同道合嘅朋友。',
    },
    {
      icon: 'pin',
      title: '立足香港',
      description: '由本地社群出發，同世界各地嘅 Python 愛好者聚一聚。',
    },
  ],
  programme: {
    eyebrow: '大會議程 PROGRAMME',
    title: '各種 Python 想法，都有交流嘅空間',
    description:
      '由寫程式到參與開源社群，嚟聽唔同主題嘅分享，學啲實用技巧，識啲可以一齊開發嘅朋友。',
    tracks: [
      {
        number: '01',
        icon: 'code',
        title: 'Build with Python',
        description: '試吓實用工具同程式架構，享受親手整出應用程式嘅樂趣。',
      },
      {
        number: '02',
        icon: 'ai',
        title: 'Data & AI',
        description: '交流數據科學、機器學習，同點樣負責任咁應用人工智能。',
      },
      {
        number: '03',
        icon: 'community',
        title: 'People & Community',
        description: '分享開源文化、工作同社群經驗，認識一班推動 Python 發展嘅人。',
      },
    ],
  },
  hongKongThread: {
    eyebrow: 'A HONG KONG THREAD',
    title: '屬於香港嘅節奏',
    description:
      '紅白藍膠袋係香港人熟悉嘅日常物件，實用又襟用。一條條線交織成結實嘅布料，就好似 Python 社群，靠大家分享同合作慢慢建立。',
    location: '香港特別行政區 Hong Kong SAR',
  },
  joinUs: {
    sprintDescription:
      '一齊開發 Python 項目、交流諗法，為開源出一分力。睇吓衝刺開發日有咩活動，同埋點樣參加。',
    sponsorDescription:
      '支持香港 Python 社群，等更多人有機會交流同學習。睇吓贊助方案，了解你哋機構可以點樣參與。',
    eyebrow: '加入我哋 JOIN US',
    title: '帶住好奇心，嚟認識 Python 社群。',
    description:
      '無論你啱啱開始學 Python、維護緊大型項目，定係想搵合作夥伴，都歡迎你嚟 PyCon HK。',
    ctaAria: '睇吓點樣參與',
    atAGlanceTitle: '大會概覽 AT A GLANCE',
    datesLabel: '日期 DATES',
    datesValue: '2026 年 11 月 14–15 日',
    locationLabel: '地點 LOCATION',
    locationValue: '香港特別行政區 Hong Kong SAR',
    stayTunedLabel: '更多資訊 STAY TUNED',
    stayTunedValue: '詳細場地同門票資訊會陸續公布。',
  },
  sponsors: {
    eyebrow: '社群夥伴 PARTNER WITH THE COMMUNITY',
    title: '一齊支持開源社群',
    description:
      '多謝贊助夥伴支持 PyCon HK，等 Python 社群有機會聚埋一齊分享知識，亦幫更多人踏出學習技術嘅第一步。',
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
    summary: '由社群一齊籌辦嘅香港 Python 年度聚會，大家交流分享，一齊學習。',
    conferenceGuideTitle: '大會資訊',
    aboutLink: '關於 PyCon HK',
    sponsorLink: '成為贊助夥伴',
    registrationLink: '大會報名',
    codeOfConductLink: 'Code of Conduct',
    privacyPolicyLink: 'Privacy Policy',
    copyright: '© 2026 PyCon HK. 社群主導，立足香港。',
    tagline: 'Python, people, possibility.',
    termsAndSupport: '條款同支援',
    privacyPolicy: 'Privacy Policy',
  },
  schedule: {
    pageTitle: '大會議程 | PyCon HK 2026',
    pageDescription: '睇吓 PyCon Hong Kong 2026 嘅演講、工作坊、主題演講同時間表。',
    heroTitle: terms.programme,
    heroSubtitle: '睇吓兩日有咩活動，安排你嘅行程。',
    day1: '第一日（11 月 14 日，星期六）',
    day2: '第二日（11 月 15 日，星期日）',
    allTracks: '所有分軌',
    searchPlaceholder: '搜尋演講、講者或者技術主題…',
    mySchedule: '我收藏嘅議程',
    myScheduleEmpty: '你仲未收藏演講。撳演講卡片上面嘅收藏掣，就可以加入你嘅行程。',
    noResults: '搵唔到符合篩選條件嘅議程。',
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
