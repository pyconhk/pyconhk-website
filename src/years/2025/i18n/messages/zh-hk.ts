import type { TranslationMessages } from './schema';

const zhHkMessages = {
  home: {
    eyebrow: 'PyCon HK 2025',
    title: 'Sailing Together',
    tagline: 'Raise the Sail, Let Python Prevail',
    intro:
      'PyCon HK 2025 會喺香港城市大學舉行，帶來兩日 talks、workshops、Sprint Day，同社群交流。',
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
        value: 'Talk、Workshop、Sprint Day',
      },
    ],
    primaryCta: '立即購票',
    secondaryCta: '會議議程',
    tertiaryCta: '最新消息',
    newsHeading: '最新消息',
    newsIntro: '經 Outstatic 編輯流程發佈嘅最新公告，而家已經整合到 Astro 網站。',
    speakersHeading: '焦點講者',
    speakersIntro: '先睇睇已經公布嘅 PyCon HK 2025 講者陣容。',
    sponsorsHeading: '贊助與合作夥伴',
    sponsorsIntro:
      '多謝以下機構支持 PyCon HK，令大會可以繼續保持開放、實用，同埋以社群為本。',
    actionsHeading: '參與會議',
    actionsIntro:
      '無論你想參加 Sprint、支持會議，定係先做好活動準備，都可以由呢度開始。',
    sprintTitle: 'Call for Sprint',
    sprintBody:
      '同社群連結，一齊貢獻開源專案。PyCon HK 2025 Sprint 係一個好機會，畀你同其他開發者協作、交流，仲可以一齊落手做。',
    sprintBenefits: [
      '同 maintainers 同 contributors 建立連結',
      '用實作方式學得更深入',
      '幫你個開源專案繼續成長',
    ],
    sprintCta: '立即提交你的專案',
    sponsorTitle: 'Call for Sponsorships',
    sponsorBody:
      '支持 Python 社群，同時提升品牌曝光。PyCon HK 提供多種贊助方案，畀你團隊更直接接觸參加者。',
    sponsorBenefits: ['會場展區攤位空間', '網站與活動物料上的品牌展示', '贊助演講機會'],
    sponsorCta: '成為贊助夥伴',
    datesHeading: '重要日期',
    datesIntro: '用簡單時間線，先睇清楚會議週末前後幾個重要日子。',
    dates: [
      {
        title: '會議日',
        date: '2025 年 10 月 11 日',
      },
      {
        title: 'Sprint 截止提交',
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
        question: '咩類型嘅 Sprint 專案最適合提交？',
        answer:
          '我哋歡迎各類開源專案，尤其係同 Python、Python 社群，或者香港本地文化同語言相關嘅專案。',
      },
      {
        question: '贊助 PyCon HK 有咩好處？',
        answer:
          '贊助夥伴可以提升喺社群入面嘅曝光、接觸開發者同潛在招聘對象，亦可以直接支持香港嘅 Python 同開源生態。',
      },
      {
        question: '參加 Sprint Day 前要做啲咩準備？',
        answer:
          '建議先準備手提電腦、預先加入相關 Discord 頻道，並完成 Sprint Lead 提供嘅安裝測試或環境設定。',
      },
    ],
    footerSummary:
      '一個由社群一齊打造嘅 Python 大會，連結香港同更廣闊嘅開發者、教育工作者同分享者。',
    quickLinksHeading: '快速連結',
    archiveHeading: '歷年網站',
    archiveNote:
      '歷年網站暫時唔喺第一階段 Astro 遷移範圍內，會等今屆網站穩定之後再處理。',
    sectionBackLabel: '返回首頁',
    sectionNote:
      '呢條路由而家已經跑緊喺新 Astro 架構之上。共用版面、語言路由同頁面外框都已經到位，詳細內容會再由舊網站逐步搬過嚟。',
    sectionStatusLabel: '遷移進行中',
    sectionStatusBody:
      '呢個頁面而家先上線，確保導覽、語言切換同年份結構一致，之後再補返完整內容。',
    relatedRoutesHeading: '相關路由',
    continueExploringHeading: '繼續瀏覽',
    newsEmptyState: '暫時未有已發佈嘅更新。',
    viewAllNewsLabel: '睇全部消息',
    readArticleLabel: '閱讀全文',
    articleBackLabel: '返回最新消息',
    englishOnlyNotice: '呢篇文章暫時只有英文版，雙語內容仲喺遷移中。',
    englishOnlyPageNotice: '呢個頁面暫時只有英文版，雙語內容仲喺遷移中。',
    privacyPolicyLabel: '私隱政策',
    menuLabel: '選單',
  },
} satisfies TranslationMessages;

export default zhHkMessages;
