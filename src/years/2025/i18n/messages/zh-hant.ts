import type { TranslationMessages } from './schema';

const zhHantMessages = {
  home: {
    eyebrow: 'PyCon HK 2025',
    title: 'Sailing Together',
    tagline: 'Raise the Sail, Let Python Prevail',
    intro:
      'PyCon HK 2025 將於香港城市大學舉行，帶來兩天的 talks、workshops、Sprint Day 與社群交流活動。',
    facts: [
      {
        label: '日期',
        value: '2025 年 10 月 11 至 12 日',
      },
      {
        label: '地點',
        value: '香港城市大學',
      },
      {
        label: '重點',
        value: 'Talks、Workshops、Sprint Day',
      },
    ],
    primaryCta: '立即購票',
    secondaryCta: '會議議程',
    tertiaryCta: '最新消息',
    newsHeading: '最新消息',
    newsIntro: '由 Outstatic 編輯流程發佈的最新公告，現已整合至 Astro 網站。',
    speakersHeading: '焦點講者',
    speakersIntro: '搶先看看目前已公布的 PyCon HK 2025 講者陣容。',
    sponsorsHeading: '贊助與合作夥伴',
    sponsorsIntro:
      '感謝以下機構支持 PyCon HK，讓大會持續保持開放、實用，並以社群為核心。',
    actionsHeading: '參與會議',
    actionsIntro: '無論你想參加 Sprint、支持會議，或先做好活動準備，都可以從這裡開始。',
    sprintTitle: 'Call for Sprint',
    sprintBody:
      '與社群建立連結，一起貢獻開源專案。PyCon HK 2025 Sprint 是與其他開發者協作、交流並共同實作的好機會。',
    sprintBenefits: [
      '與 maintainers 與 contributors 建立連結',
      '透過實作獲得更深入的學習體驗',
      '幫助你的開源專案持續成長',
    ],
    sprintCta: '立即提交專案',
    sponsorTitle: 'Call for Sponsorships',
    sponsorBody:
      '支持 Python 社群，同時提升品牌能見度。PyCon HK 提供多種贊助方案，協助你的團隊更直接地與參加者互動。',
    sponsorBenefits: ['會場展區攤位空間', '網站與活動物料上的品牌展示', '贊助演講機會'],
    sponsorCta: '成為贊助夥伴',
    datesHeading: '重要日期',
    datesIntro: '透過簡單的時間線，先掌握會議週末前後的重要日程。',
    dates: [
      {
        title: '會議日',
        date: '2025 年 10 月 11 日',
      },
      {
        title: 'Sprint 提交截止',
        date: '2025 年 10 月 11 日',
      },
      {
        title: 'Sprint Day',
        date: '2025 年 10 月 12 日',
      },
    ],
    faqHeading: '常見問題',
    faqs: [
      {
        question: '哪些類型的 Sprint 專案適合提交？',
        answer:
          '我們歡迎各類型的開源專案，尤其是與 Python、Python 社群，或香港本地文化與語言相關的專案。',
      },
      {
        question: '贊助 PyCon HK 有哪些好處？',
        answer:
          '贊助夥伴可提升在社群中的曝光、接觸開發者與潛在招募對象，並直接支持香港的 Python 與開源生態。',
      },
      {
        question: '參加 Sprint Day 前需要準備什麼？',
        answer:
          '建議先準備手提電腦、預先加入相關 Discord 頻道，並完成 Sprint Lead 提供的安裝測試或環境設定。',
      },
    ],
    footerSummary:
      '一個由社群共同打造的 Python 大會，連結香港與更多開發者、教育工作者與分享者。',
    quickLinksHeading: '快速連結',
    archiveHeading: '歷年網站',
    archiveNote:
      '歷年網站目前不在第一階段 Astro 遷移範圍內，將待本年度網站穩定後再處理。',
    sectionBackLabel: '返回首頁',
    sectionNote:
      '此路由現已運行於新的 Astro 架構之上。共用版面、語言路由與頁面框架皆已到位，詳細內容將再由舊網站逐步搬移。',
    sectionStatusLabel: '遷移進行中',
    sectionStatusBody:
      '此頁面已先行上線，以確保導覽、語言切換與年份結構一致，完整內容將稍後補上。',
    relatedRoutesHeading: '相關路由',
    continueExploringHeading: '繼續瀏覽',
    newsEmptyState: '目前尚無已發佈的更新。',
    viewAllNewsLabel: '查看全部消息',
    readArticleLabel: '閱讀全文',
    articleBackLabel: '返回最新消息',
    englishOnlyNotice: '這篇文章目前僅提供英文版本，其他語言內容仍在整理中。',
    englishOnlyPageNotice: '這個頁面目前僅提供英文版本，其他語言內容仍在整理中。',
    privacyPolicyLabel: '隱私政策',
    menuLabel: '選單',
  },
} satisfies TranslationMessages;

export default zhHantMessages;
