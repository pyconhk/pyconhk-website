import type { CfpLocale } from '@/years/2026/locales';

// Public Booth Stamp Journey instructions from the current 2026 printing folder:
// https://drive.google.com/file/d/1Ukj5Z6SbYE_ShnD_7t6wP7Oftt5xQeN0/view
// Referenced by the 2026 signage checklist, row 7:
// https://docs.google.com/spreadsheets/d/1kYjsaWxZTzokO_kimsnCOAPQ90rb1qR_EhEChlhX-9o/edit#gid=1191441747&range=A7:I7
type BoothStampJourneyCopy = {
  title: string;
  navLabel: string;
  intro: string;
  stepsTitle: string;
  steps: { title: string; body: string }[];
  redemptionTitle: string;
  redemptionLocation: string;
  note: string;
  linksTitle: string;
  floorPlanLink: string;
  scheduleLink: string;
};

export const boothStampJourneyCopy: Record<CfpLocale, BoothStampJourneyCopy> = {
  en: {
    title: 'Booth Stamp Journey',
    navLabel: 'Booth Stamp Journey',
    intro: 'Discover Python projects, tools and demos as you explore the conference.',
    stepsTitle: 'How it works',
    steps: [
      {
        title: 'Visit booths and poster sessions',
        body: 'Explore the sponsor and community booths, and visit poster sessions to discover what people are building with Python.',
      },
      {
        title: 'Talk and collect stamps',
        body: 'Talk to the booth facilitators and ask them to check off your badge card.',
      },
      {
        title: 'Redeem with 6 stamps',
        body: 'Collect 6 stamps, then show your badge card at the Gift Redemption Counter.',
      },
    ],
    redemptionTitle: 'Gift Redemption Counter',
    redemptionLocation: 'HKIIT · 6/F · LW658',
    note: 'One gift per person. Gifts are limited and available on a first-come, first-served basis.',
    linksTitle: 'Plan your journey',
    floorPlanLink: 'View floor plans',
    scheduleLink: 'Conference schedule',
  },
  'zh-hk': {
    title: '攤位集印之旅',
    navLabel: '攤位集印之旅',
    intro: '行吓會場，發掘唔同 Python 項目、工具同示範。',
    stepsTitle: '點樣參加',
    steps: [
      {
        title: '行吓攤位同海報展示',
        body: '去贊助商、社群攤位同海報展示，睇吓大家用 Python 整咗啲乜。',
      },
      {
        title: '傾吓偈，集印仔',
        body: '同攤位負責人交流，再請佢哋喺你嘅名牌卡上作記認。',
      },
      {
        title: '集齊 6 個印換禮品',
        body: '集齊 6 個印之後，拎名牌卡去禮品換領處出示就可以換領。',
      },
    ],
    redemptionTitle: '禮品換領處',
    redemptionLocation: 'HKIIT 六樓（6/F）LW658',
    note: '每人只可換領一份禮品。數量有限，先到先得。',
    linksTitle: '安排你嘅集印路線',
    floorPlanLink: '睇會場平面圖',
    scheduleLink: '大會議程',
  },
  'zh-hant': {
    title: '攤位集印之旅',
    navLabel: '攤位集印之旅',
    intro: '探索會場，發掘不同的 Python 專案、工具及示範。',
    stepsTitle: '參與方式',
    steps: [
      {
        title: '參觀攤位及海報展示',
        body: '前往贊助商、社群攤位及海報展示，了解大家運用 Python 建立的成果。',
      },
      {
        title: '交流並收集印章',
        body: '與攤位負責人交流，並請他們在您的名牌卡上作記認。',
      },
      {
        title: '集齊 6 個印章換領禮品',
        body: '集齊 6 個印章後，請到禮品換領處出示名牌卡。',
      },
    ],
    redemptionTitle: '禮品換領處',
    redemptionLocation: 'HKIIT 六樓（6/F）LW658',
    note: '每人只可換領一份禮品。數量有限，先到先得。',
    linksTitle: '規劃集印路線',
    floorPlanLink: '查看會場平面圖',
    scheduleLink: '大會議程',
  },
  'zh-hans': {
    title: '展位集章之旅',
    navLabel: '展位集章之旅',
    intro: '探索会场，发现不同的 Python 项目、工具及演示。',
    stepsTitle: '参与方式',
    steps: [
      {
        title: '参观展位及海报展示',
        body: '前往赞助商、社区展位及海报展示，了解大家使用 Python 构建的成果。',
      },
      {
        title: '交流并收集印章',
        body: '与展位负责人交流，并请他们在您的名牌卡上作标记。',
      },
      {
        title: '集齐 6 个印章领取礼品',
        body: '集齐 6 个印章后，请到礼品领取处出示名牌卡。',
      },
    ],
    redemptionTitle: '礼品领取处',
    redemptionLocation: 'HKIIT 六楼（6/F）LW658',
    note: '每人只可领取一份礼品。数量有限，先到先得。',
    linksTitle: '规划集章路线',
    floorPlanLink: '查看会场平面图',
    scheduleLink: '大会议程',
  },
  ja: {
    title: 'ブーススタンプラリー',
    navLabel: 'ブーススタンプラリー',
    intro: '会場を巡り、Python のプロジェクトやツール、デモに出会いましょう。',
    stepsTitle: '参加方法',
    steps: [
      {
        title: 'ブースやポスター発表を巡る',
        body: 'スポンサーやコミュニティのブース、ポスター発表を訪れ、Python を使った取り組みを見てみましょう。',
      },
      {
        title: '話をしてスタンプを集める',
        body: 'ブースの担当者と話し、バッジカードにチェックを入れてもらってください。',
      },
      {
        title: 'スタンプ6個でギフトと引き換える',
        body: 'スタンプを6個集めたら、ギフト引換カウンターでバッジカードを提示してください。',
      },
    ],
    redemptionTitle: 'ギフト引換カウンター',
    redemptionLocation: 'HKIIT 6階（6/F）LW658',
    note: 'ギフトはお一人につき1点です。数に限りがあり、先着順となります。',
    linksTitle: '会場を巡るための情報',
    floorPlanLink: 'フロアマップを見る',
    scheduleLink: 'カンファレンスのスケジュール',
  },
  ko: {
    title: '부스 스탬프 투어',
    navLabel: '부스 스탬프 투어',
    intro: '행사장을 둘러보며 Python 프로젝트, 도구와 데모를 만나 보세요.',
    stepsTitle: '참여 방법',
    steps: [
      {
        title: '부스와 포스터 세션 둘러보기',
        body: '후원사와 커뮤니티 부스, 포스터 세션을 방문해 Python으로 만든 다양한 결과물을 살펴보세요.',
      },
      {
        title: '이야기를 나누고 스탬프 모으기',
        body: '부스 담당자와 이야기를 나눈 뒤 명찰 카드에 확인 표시를 부탁하세요.',
      },
      {
        title: '스탬프 6개로 기념품 받기',
        body: '스탬프 6개를 모으면 기념품 수령처에서 명찰 카드를 보여 주세요.',
      },
    ],
    redemptionTitle: '기념품 수령처',
    redemptionLocation: 'HKIIT 6층(6/F) LW658',
    note: '기념품은 1인당 1개입니다. 수량이 한정되어 있으며 선착순으로 제공됩니다.',
    linksTitle: '투어에 필요한 정보',
    floorPlanLink: '층별 안내도 보기',
    scheduleLink: '컨퍼런스 일정',
  },
};
