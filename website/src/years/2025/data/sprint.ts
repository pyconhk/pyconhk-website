import {
  type LocalizedValue,
  resolveLocalizedValue,
  resolveRequiredLocalizedValue,
  type SiteLocale,
} from '@/config/site';

type LocalizedText = LocalizedValue<string>;
type LocalizedTextList = LocalizedValue<readonly string[]>;

export type SprintFact = {
  label: LocalizedText;
  value: LocalizedText;
  tone: 'amber' | 'blue';
};

export type SprintScheduleItem = {
  startTime: string;
  endTime: string;
  item: LocalizedText;
};

export type SprintProject = {
  title: string;
  description?: LocalizedTextList;
  goals: LocalizedTextList;
  githubLinkDisplay: string;
  githubLink: string;
  discordChannelDisplay: string;
  discordChannel: string;
  level: 'all-levels' | 'intermediate';
  sprintLead: string;
};

export function getLocalizedText(text: LocalizedText, locale: SiteLocale): string {
  return resolveRequiredLocalizedValue(text, locale);
}

export function getLocalizedTextList(
  text: LocalizedTextList | undefined,
  locale: SiteLocale
): readonly string[] {
  return text ? (resolveLocalizedValue(text, locale) ?? []) : [];
}

export function getSprintLevelLabel(
  level: SprintProject['level'],
  locale: SiteLocale
): string {
  const labels: Record<SprintProject['level'], LocalizedText> = {
    'all-levels': {
      en: 'ALL Levels',
      'zh-hk': '適合所有程度',
      'zh-hant': '適合所有程度',
      'zh-hans': '适合所有程度',
      ja: 'すべてのレベル向け',
    },
    intermediate: {
      en: 'Intermediate',
      'zh-hk': '中階',
      'zh-hant': '中階',
      'zh-hans': '中阶',
      ja: '中級',
    },
  };

  return resolveRequiredLocalizedValue(labels[level], locale);
}

export const sprintFacts: readonly SprintFact[] = [
  {
    label: {
      en: 'Date',
      'zh-hk': '日期',
      'zh-hant': '日期',
      'zh-hans': '日期',
      ja: '日付',
    },
    value: {
      en: '12th October (Sun), 2025',
      'zh-hk': '2025 年 10 月 12 日（星期日）',
      'zh-hant': '2025 年 10 月 12 日（星期日）',
      'zh-hans': '2025 年 10 月 12 日（星期日）',
      ja: '2025年10月12日（日）',
    },
    tone: 'amber',
  },
  {
    label: {
      en: 'Venue',
      'zh-hk': '地點',
      'zh-hant': '地點',
      'zh-hans': '地点',
      ja: '会場',
    },
    value: {
      en: '4/F Yeung Kin Man Academic Building, CityU',
      'zh-hk': '香港城市大學楊建文學術樓 4 樓',
      'zh-hant': '香港城市大學楊建文學術樓 4 樓',
      'zh-hans': '香港城市大学杨建文学术楼 4 楼',
      ja: 'CityU 楊建文アカデミックビル 4階',
    },
    tone: 'blue',
  },
] as const;

export const sprintSchedule: readonly SprintScheduleItem[] = [
  {
    startTime: '09:00',
    endTime: '10:00',
    item: {
      en: 'Registration',
      'zh-hk': '報到',
      'zh-hant': '報到',
      'zh-hans': '报到',
      ja: '受付',
    },
  },
  {
    startTime: '10:00',
    endTime: '10:15',
    item: {
      en: 'Opening + Sprint Intro',
      'zh-hk': '開場 + Sprint 簡介',
      'zh-hant': '開場 + Sprint 簡介',
      'zh-hans': '开场 + Sprint 简介',
      ja: 'オープニング + Sprint 紹介',
    },
  },
  {
    startTime: '10:15',
    endTime: '13:00',
    item: {
      en: 'Sprint Session 1',
      'zh-hk': 'Sprint 時段 1',
      'zh-hant': 'Sprint 時段 1',
      'zh-hans': 'Sprint 时段 1',
      ja: 'Sprint セッション 1',
    },
  },
  {
    startTime: '13:00',
    endTime: '15:00',
    item: {
      en: 'Lunch',
      'zh-hk': '午餐',
      'zh-hant': '午餐',
      'zh-hans': '午餐',
      ja: '昼食',
    },
  },
  {
    startTime: '15:00',
    endTime: '15:10',
    item: {
      en: 'Progress Report',
      'zh-hk': '進度分享',
      'zh-hant': '進度分享',
      'zh-hans': '进度分享',
      ja: '進捗共有',
    },
  },
  {
    startTime: '15:10',
    endTime: '17:45',
    item: {
      en: 'Sprint Session 2',
      'zh-hk': 'Sprint 時段 2',
      'zh-hant': 'Sprint 時段 2',
      'zh-hans': 'Sprint 时段 2',
      ja: 'Sprint セッション 2',
    },
  },
  {
    startTime: '17:45',
    endTime: '18:00',
    item: {
      en: 'Closing',
      'zh-hk': '結語',
      'zh-hant': '結語',
      'zh-hans': '结语',
      ja: 'クロージング',
    },
  },
  {
    startTime: '18:00',
    endTime: '',
    item: {
      en: 'Dinner at Ban Heung Lau',
      'zh-hk': '於品香樓晚餐',
      'zh-hant': '於品香樓晚餐',
      'zh-hans': '于品香楼晚餐',
      ja: '品香樓での夕食',
    },
  },
] as const;

export const sprintProjects: readonly SprintProject[] = [
  {
    title: 'frame-check',
    description: {
      en: [
        "A python checker that can check the validity of DataFrame objects through the code. It will keep track of the dataframes' schema and raise errors if the schema is not respected or if the user is trying to access a column that does not exists.",
      ],
      'zh-hk': [
        '一個 Python 檢查工具，可以直接喺程式碼層面檢查 DataFrame 物件係咪有效。佢會追蹤 DataFrame 嘅 schema；如果 schema 唔符合預期，或者有人存取咗唔存在嘅欄位，就會報錯。',
      ],
      'zh-hant': [
        '一個 Python 檢查工具，可以直接在程式碼層面檢查 DataFrame 物件是否有效。它會追蹤 DataFrame 的 schema；如果 schema 不符合預期，或有人存取了不存在的欄位，就會報錯。',
      ],
      'zh-hans': [
        '一个 Python 检查工具，可以直接在代码层面检查 DataFrame 对象是否有效。它会追踪 DataFrame 的 schema；如果 schema 不符合预期，或有人访问了不存在的列，就会报错。',
      ],
      ja: [
        'コード上で DataFrame オブジェクトの妥当性を検査できる Python 製チェッカーです。DataFrame のスキーマを追跡し、期待したスキーマと一致しない場合や、存在しないカラムへアクセスした場合にエラーを出します。',
      ],
    },
    goals: {
      en: [
        'Core parser (parsing DF creations, user-specified schema, variable assignment)',
        'Core checker (rules and validators)',
        'LSP / File watcher (if we have time)',
      ],
      'zh-hk': [
        '核心 parser（處理 DataFrame 建立、使用者自訂 schema、變數指派）',
        '核心 checker（規則同驗證器）',
        'LSP / 檔案監看功能（如果時間許可）',
      ],
      'zh-hant': [
        '核心 parser（處理 DataFrame 建立、使用者自訂 schema、變數指派）',
        '核心 checker（規則與驗證器）',
        'LSP / 檔案監看功能（若時間允許）',
      ],
      'zh-hans': [
        '核心 parser（处理 DataFrame 创建、用户自定义 schema、变量赋值）',
        '核心 checker（规则与验证器）',
        'LSP / 文件监听功能（如果时间允许）',
      ],
      ja: [
        'コア parser の実装（DataFrame 作成、ユーザー定義 schema、変数代入の解析）',
        'コア checker の実装（ルールとバリデーター）',
        'LSP / ファイル監視機能（時間があれば）',
      ],
    },
    githubLinkDisplay: 'github.com/lucianosrp/frame-check',
    githubLink: 'https://github.com/lucianosrp/frame-check',
    discordChannelDisplay: 'Frame Check',
    discordChannel: 'https://discord.gg/2rweBjM9',
    level: 'all-levels',
    sprintLead: 'Luciano Scarpulla',
  },
  {
    title: 'L.E.P.A.U.T.E. Framework',
    description: {
      en: [
        'L.E.P.A.U.T.E. The framework is a visual framework based on Lie group theory that accurately models geometric transformations in images and improves the performance of CNNs. Recommended Sprint: Strong market demand, with applications in robotics and healthcare.',
      ],
      'zh-hk': [
        'L.E.P.A.U.T.E. 係一個以 Lie group theory 為基礎嘅視覺框架，可以更準確咁處理影像入面嘅幾何變換，亦有助提升 CNN 表現。呢個題目有清晰應用場景，機械人同醫療方向都用得着。',
      ],
      'zh-hant': [
        'L.E.P.A.U.T.E. 是一個以 Lie group theory 為基礎的視覺框架，可以更準確地處理影像中的幾何變換，也有助提升 CNN 表現。這個題目有明確應用場景，在機器人與醫療領域都很實用。',
      ],
      'zh-hans': [
        'L.E.P.A.U.T.E. 是一个以 Lie group theory 为基础的视觉框架，可以更准确地处理图像中的几何变换，也有助于提升 CNN 表现。这个题目有明确的应用场景，在机器人和医疗领域都很实用。',
      ],
      ja: [
        'L.E.P.A.U.T.E. は Lie 群理論を基盤にしたビジュアルフレームワークで、画像内の幾何変換を高精度にモデル化し、CNN の性能向上にもつながります。ロボティクスや医療分野での応用も見込める、実用性の高いテーマです。',
      ],
    },
    goals: {
      en: [
        'Implement the Lie group convolutional layer',
        'Train the self-supervisory model',
        'Test the 3D reconstruction tasks',
      ],
      'zh-hk': [
        '實作 Lie group convolutional layer',
        '訓練 self-supervised model',
        '測試 3D reconstruction 任務',
      ],
      'zh-hant': [
        '實作 Lie group convolutional layer',
        '訓練 self-supervised model',
        '測試 3D reconstruction 任務',
      ],
      'zh-hans': [
        '实现 Lie group convolutional layer',
        '训练 self-supervised model',
        '测试 3D reconstruction 任务',
      ],
      ja: [
        'Lie group convolutional layer を実装する',
        'self-supervised model を学習させる',
        '3D reconstruction タスクを検証する',
      ],
    },
    githubLinkDisplay:
      'github.com/dev1virtuoso/Machine-Learning/Computer Vision/L.E.P.A.U.T.E.',
    githubLink:
      'https://github.com/dev1virtuoso/Machine-Learning/tree/main/Computer%20Vision/L.E.P.A.U.T.E.',
    discordChannelDisplay: '2025-sprint-lepaute',
    discordChannel: 'https://discord.gg/waKXY5GDpz',
    level: 'intermediate',
    sprintLead: 'Carson',
  },
  {
    title: 'Contribute to Engineering Blog Article Prototypes',
    description: {
      en: [
        "Most startups and companies publish engineering blog articles. During the sprint, I will add 2 - 3 projects to the repository. Each repository will be a prototype of the architecture described in these blog articles, rebuilt with a tech stack we're comfortable with, to understand why those companies took that approach.",
        'Additionally, most of these blog articles mention "Future Work." I will build the initial prototype, and participants will work on the future work items mentioned.',
        'For example, Uber released their Enhanced Agentic RAG solution. In their future work, they highlighted pending features like OCR support, Multimodal RAG, and Chain-of-RAG for multi-hop reasoning. I will build the initial Enhanced Agentic RAG pipeline, and participants can implement the future work items. I will guide them with resources and resolve doubts. Those who contribute will receive Streamlit swags, and I also have 2 - 3 Google swags.',
      ],
      'zh-hk': [
        '好多初創同科技公司都會寫 engineering blog。今次 Sprint 我會喺 repository 加入 2 至 3 個專案，每個都會按返文章講嘅架構做一個 prototype，再用我哋較熟悉嘅 tech stack 重建，睇下點解嗰啲公司會咁樣設計。',
        '另外，呢啲文章好多時都會提到「Future Work」。我會先整好初版 prototype，再由參加者接住做文中提到嘅延伸部分。',
        '例如 Uber 曾經公開佢哋嘅 Enhanced Agentic RAG 方案，而 future work 包括 OCR 支援、Multimodal RAG，同埋用喺 multi-hop reasoning 嘅 Chain-of-RAG。我會先搭好第一版 Enhanced Agentic RAG pipeline，參加者之後就可以再實作呢啲延伸項目。我會提供資源同幫手解答問題；有貢獻嘅朋友會收到 Streamlit 紀念品，我手上亦有少量 Google 紀念品。',
      ],
      'zh-hant': [
        '很多新創與科技公司都會發表 engineering blog。這次 Sprint 我會在 repository 加入 2 至 3 個專案，每個都會依照文章描述的架構製作 prototype，再以我們較熟悉的 tech stack 重建，理解那些公司為何做出這樣的設計選擇。',
        '此外，這類文章通常也會提到「Future Work」。我會先完成初版 prototype，再由參加者接手實作文中提到的延伸項目。',
        '例如 Uber 曾公開他們的 Enhanced Agentic RAG 方案，而 future work 包括 OCR 支援、Multimodal RAG，以及用於 multi-hop reasoning 的 Chain-of-RAG。我會先搭好第一版 Enhanced Agentic RAG pipeline，之後由參加者進一步實作這些延伸功能。我會提供資源並協助解答問題；有貢獻的朋友會獲得 Streamlit 紀念品，我手上也有少量 Google 紀念品。',
      ],
      'zh-hans': [
        '很多初创和科技公司都会发布 engineering blog。这次 Sprint 我会在 repository 中加入 2 到 3 个项目，每个都会按照文章描述的架构制作 prototype，再用我们更熟悉的 tech stack 重建，以理解那些公司为何做出这样的设计选择。',
        '此外，这类文章通常也会提到“Future Work”。我会先完成初版 prototype，再由参与者接手实现文中提到的后续工作。',
        '例如 Uber 曾公开他们的 Enhanced Agentic RAG 方案，而 future work 包括 OCR 支持、Multimodal RAG，以及用于 multi-hop reasoning 的 Chain-of-RAG。我会先搭好第一版 Enhanced Agentic RAG pipeline，之后由参与者继续实现这些扩展功能。我会提供资源并协助答疑；有贡献的朋友会获得 Streamlit 周边，我手上也有少量 Google 周边。',
      ],
      ja: [
        '多くのスタートアップや企業は engineering blog を公開しています。この Sprint では、そうした記事で紹介されているアーキテクチャを、私たちが扱いやすい tech stack で再構築した prototype を 2〜3 件 repository に追加し、なぜその設計が採用されたのかを理解していきます。',
        'また、これらの記事の多くには「Future Work」が書かれています。私がまず初期 prototype を作り、その後は参加者の皆さんにその発展項目へ取り組んでもらいます。',
        'たとえば Uber が公開した Enhanced Agentic RAG では、Future Work として OCR 対応、Multimodal RAG、multi-hop reasoning 向けの Chain-of-RAG などが挙げられていました。私がまず最初の Enhanced Agentic RAG pipeline を構築し、その後の拡張を参加者が実装できます。資料提供や疑問解消もサポートします。貢献してくれた方には Streamlit グッズを配布し、Google グッズも少量用意しています。',
      ],
    },
    goals: {
      en: [
        'Understand how big tech companies build their AI systems by understanding the architecture',
        'Build projects that create impact and are used in the industry rather than copy-pasting the project',
      ],
      'zh-hk': [
        '透過拆解架構設計，理解大型科技公司點樣建 AI 系統',
        '做出真正有影響力、同業界場景貼地嘅專案，而唔係淨係照抄範例',
      ],
      'zh-hant': [
        '透過拆解架構設計，理解大型科技公司如何打造 AI 系統',
        '做出真正有影響力、貼近業界場景的專案，而不是只單純照抄範例',
      ],
      'zh-hans': [
        '通过拆解架构设计，理解大型科技公司如何构建 AI 系统',
        '做出真正有影响力、贴近业界场景的项目，而不是单纯照抄范例',
      ],
      ja: [
        'アーキテクチャを読み解きながら、大手テック企業がどのように AI システムを構築しているかを理解する',
        'サンプルを写経するだけでなく、実際の業界で価値を持つプロジェクトを作る',
      ],
    },
    githubLinkDisplay: 'github.com/lucifertrj/case-study-series',
    githubLink: 'https://github.com/lucifertrj/case-study-series',
    discordChannelDisplay: '2025-sprint-case-study-projects',
    discordChannel: 'https://discord.gg/A7RNeYqkHx',
    level: 'all-levels',
    sprintLead: 'Tarun Jain',
  },
  {
    title: 'Global Headlines',
    goals: {
      en: [
        'To create a website that contains headlines from different countries around the world in their native languages and English translations.',
        'Let Hong Kong people understand what is happening in the world through the lens of different countries.',
      ],
      'zh-hk': [
        '整一個網站，收集世界各地新聞標題，提供當地語言原文同英文翻譯。',
        '畀香港人可以由唔同國家嘅視角，了解世界發生緊咩事。',
      ],
      'zh-hant': [
        '打造一個網站，收集世界各地新聞標題，提供當地語言原文與英文翻譯。',
        '讓香港人能從不同國家的視角，了解世界正在發生什麼事。',
      ],
      'zh-hans': [
        '打造一个网站，收集世界各地新闻标题，提供当地语言原文与英文翻译。',
        '让香港人能从不同国家的视角，了解世界正在发生什么事。',
      ],
      ja: [
        '世界各国のニュース見出しを、現地語と英訳の両方で掲載する Web サイトを作る。',
        '香港の人たちが、さまざまな国の視点から世界で起きていることを理解できるようにする。',
      ],
    },
    githubLinkDisplay: 'github.com/dl512/global-headlines',
    githubLink: 'https://github.com/dl512/global-headlines',
    discordChannelDisplay: '2025-sprint-global-headlines',
    discordChannel: 'https://discord.gg/fZCYH5R8rm',
    level: 'all-levels',
    sprintLead: 'David',
  },
] as const;
