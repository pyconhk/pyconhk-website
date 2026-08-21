import type { CfpLocale } from '@/years/2026/locales';

export type NewsArticle = {
  slug: string;
  title: Record<CfpLocale, string>;
  category: Record<CfpLocale, string>;
  publishedAt: string;
  formattedDate: Record<CfpLocale, string>;
  author: {
    name: string;
    role: Record<CfpLocale, string>;
  };
  coverImage: string;
  excerpt: Record<CfpLocale, string>;
  tldr: {
    venue: Record<CfpLocale, string>;
    day1: Record<CfpLocale, string>;
    day2: Record<CfpLocale, string>;
  };
  paragraphs: Record<CfpLocale, string[]>;
  day1Highlights: Record<CfpLocale, { title: string; desc: string }[]>;
  day2Info: Record<CfpLocale, string[]>;
  ticketsInfo: Record<CfpLocale, string[]>;
  sponsorInfo: Record<CfpLocale, string[]>;
};

export const newsArticles: NewsArticle[] = [
  {
    slug: 'welcome-to-pycon-hk-2026',
    title: {
      en: 'PyCon HK 2026 – Weaving the Future: "Connecting Pythonistas, Empowering Innovation"',
      'zh-hk': 'PyCon HK 2026 – 編織未來：「凝聚 Python 愛好者，賦能創新」',
      'zh-hant': 'PyCon HK 2026 – 編織未來：「凝聚 Python 愛好者，賦能創新」',
      'zh-hans': 'PyCon HK 2026 – 编织未来：“凝聚 Python 爱好者，赋能创新”',
      ja: 'PyCon HK 2026 – 未来を紡ぐ：「Pythonista を繋ぎ、イノベーションを拓く」',
      ko: 'PyCon HK 2026 – 미래를 엮다: "파이썬 커뮤니티의 연결, 혁신의 시작"',
    },
    category: {
      en: 'Event Announcement',
      'zh-hk': '大會公告',
      'zh-hant': '大會公告',
      'zh-hans': '大会公告',
      ja: 'イベントお知らせ',
      ko: '행사 공지',
    },
    publishedAt: '2026-08-20',
    formattedDate: {
      en: 'August 20, 2026',
      'zh-hk': '2026 年 8 月 20 日',
      'zh-hant': '2026 年 8 月 20 日',
      'zh-hans': '2026 年 8 月 20 日',
      ja: '2026年8月20日',
      ko: '2026년 8월 20일',
    },
    author: {
      name: 'PyCon HK Organizing Committee',
      role: {
        en: 'PyCon HK 2026 Team',
        'zh-hk': 'PyCon HK 2026 籌辦團隊',
        'zh-hant': 'PyCon HK 2026 籌辦團隊',
        'zh-hans': 'PyCon HK 2026 筹办团队',
        ja: 'PyCon HK 2026 運営チーム',
        ko: 'PyCon HK 2026 조직위원회',
      },
    },
    coverImage: '/2026/logos/pyconlogo.png',
    excerpt: {
      en: 'PyCon HK 2026 returns to Hong Kong with inspiring keynotes, technical tracks, hands-on workshops, and open-source Development Sprints. Join the vibrant Python community!',
      'zh-hk':
        'PyCon HK 2026 載譽歸來！帶來多軌技術演講、實戰工作坊及開源 Development Sprint 開發日，歡迎全港及全球 Python 社群一同參與！',
      'zh-hant':
        'PyCon HK 2026 載譽歸來！帶來多軌技術演講、實戰工作坊及開源 Development Sprint 開發日，歡迎全港及全球 Python 社群一同參與！',
      'zh-hans':
        'PyCon HK 2026 载誉归来！带来多轨技术演讲、实战工作坊及开源 Development Sprint 开发日，欢迎全港及全球 Python 社区一同参与！',
      ja: 'PyCon HK 2026 が開催決定！マルチトラック講演、実践ワークショップ、オープンソース開発スプリントをお届けします。',
      ko: 'PyCon HK 2026이 개최됩니다! 다양한 트랙의 강연, 핸즈온 워크숍, 오픈소스 개발 스프린트에 함께하세요.',
    },
    tldr: {
      venue: {
        en: 'City University of Hong Kong (Kowloon Tong, Hong Kong)',
        'zh-hk': '香港城市大學（九龍塘）',
        'zh-hant': '香港城市大學（九龍塘）',
        'zh-hans': '香港城市大学（九龙塘）',
        ja: '香港城市大学（City University of Hong Kong）',
        ko: '홍콩시립대학교 (City University of Hong Kong)',
      },
      day1: {
        en: 'Conference Day – Keynotes, 4 parallel breakout tracks, hands-on workshops, sponsor booths, and lightning talks.',
        'zh-hk':
          '主題演講、4 軌平行分組論壇、實戰工作坊、贊助商展位及 Lightning Talks 閃電演講。',
        'zh-hant':
          '主題演講、4 軌平行分組論壇、實戰工作坊、贊助商展位及 Lightning Talks 閃電演講。',
        'zh-hans':
          '主题演讲、4 轨平行分组论坛、实战工作坊、赞助商展位及 Lightning Talks 闪电演讲。',
        ja: '基調講演、4つのパラレルトラック、実践ワークショップ、ブース出展、ライトニングトーク。',
        ko: '기조연설, 4개 병렬 트랙 강연, 실습 워크숍, 스폰서 부스, 라이트닝 토크.',
      },
      day2: {
        en: 'Development Sprint – Collaborative open-source coding, mentoring, and community hacking.',
        'zh-hk': '開源協作編程日、項目導師指導與社群黑客松交流。',
        'zh-hant': '開源協作編程日、項目導師指導與社群黑客松交流。',
        'zh-hans': '开源协作编程日、项目导师指导与社区黑客松交流。',
        ja: 'オープンソース共同開発、メンターシップ、コミュニティハッキング。',
        ko: '오픈소스 협업 코딩, 멘토링, 커뮤니티 개발 스프린트.',
      },
    },
    paragraphs: {
      en: [
        'PyCon HK 2026, Hong Kong’s premier annual Python conference, proudly joins over 50 PyCon events held worldwide each year. Co-organized by the Hong Kong Python User Group (HKPUG), Open Source Hong Kong (OSHK), and the Hong Kong Creative Open Technology Association (HKCOTA), this year’s conference embraces the visual and cultural identity of Hong Kong with the theme "Weaving the Future: Connecting Pythonistas, Empowering Innovation".',
        'As Python continues to power modern advancements in Agentic AI, Large Language Models, Data Engineering, and Cloud Native Architectures, PyCon HK brings together industry leaders, open-source maintainers, researchers, and newcomers for two days of immersive learning, exchange, and community connection in the heart of Hong Kong.',
      ],
      'zh-hk': [
        'PyCon HK 2026 作為香港年度頂尖 Python 開發者盛會，與全球逾 50 個地區的 PyCon 攜手並進。大會由香港 Python 用戶組 (HKPUG)、香港開源 (OSHK) 及香港創意開放科技協會 (HKCOTA) 聯合主辦，今年以「編織未來：凝聚 Python 愛好者，賦能創新」為主題，融合香港標誌性紅白藍與電車意象，象徵社群的堅韌與創新精神。',
        '隨著 Python 在 AI 智能體、大語言模型、數據工程及雲原生架構中發揮核心推動力，PyCon HK 誠邀業界專家、開源維護者、科研人員及編程初學者齊聚一堂，共襄盛舉。',
      ],
      'zh-hant': [
        'PyCon HK 2026 作為香港年度頂尖 Python 開發者盛會，與全球逾 50 個地區的 PyCon 攜手並進。大會由香港 Python 用戶組 (HKPUG)、香港開源 (OSHK) 及香港創意開放科技協會 (HKCOTA) 聯合主辦，今年以「編織未來：凝聚 Python 愛好者，賦能創新」為主題，融合香港標誌性紅白藍與電車意象，象徵社群的堅韌與創新精神。',
        '隨著 Python 在 AI 智能體、大語言模型、數據工程及雲原生架構中發揮核心推動力，PyCon HK 誠邀業界專家、開源維護者、科研人員及編程初學者齊聚一堂，共襄盛舉。',
      ],
      'zh-hans': [
        'PyCon HK 2026 作为香港年度顶尖 Python 开发者盛会，与全球逾 50 个地区的 PyCon 携手并进。大会由香港 Python 用户组 (HKPUG)、香港开源 (OSHK) 及香港创意开放科技协会 (HKCOTA) 联合主办，今年以“编织未来：凝聚 Python 爱好者，赋能创新”为主题。',
        '随着 Python 在 AI 智能体、大语言模型、数据工程及云原生架构中发挥核心推动力，PyCon HK 诚邀业界专家、开源维护者、科研人员及编程初学者齐聚一堂，共襄盛举。',
      ],
      ja: [
        'PyCon HK 2026 は、香港最大の Python カンファレンスであり、世界中で開催されている 50 以上の PyCon イベントの一環です。香港 Python ユーザーグループ (HKPUG)、オープンソース香港 (OSHK)、香港クリエイティブ・オープン・テクノロジー協会 (HKCOTA) の共催により開催されます。',
        'AI、大規模言語モデル、データエンジニアリング、クラウドネイティブの発展を牽引する Python コミュニティの知見を共有し、国際的な交流を深める 2 日間をお届けします。',
      ],
      ko: [
        'PyCon HK 2026은 홍콩 최대의 파이썬 연례 컨퍼런스로, 전 세계 50개 이상의 PyCon과 함께합니다. 홍콩 파이썬 사용자 모임(HKPUG), 오픈소스 홍콩(OSHK), HKCOTA가 공동 주최합니다.',
        '에이전틱 AI, 대규모 언어 모델, 데이터 엔지니어링 및 클라우드 기술을 아우르는 깊이 있는 세션과 개발자 간의 소통의 장이 펼쳐집니다.',
      ],
    },
    day1Highlights: {
      en: [
        {
          title: '[Keynote] pip install community: Building Global Python Networks',
          desc: 'Exploring how grassroots local communities grow into international open-source foundations, sharing best practices in mentorship and community longevity.',
        },
        {
          title:
            'Deep Dive Workshop: OpenTelemetry & Cloud-Native Python Observability',
          desc: 'A hands-on 90-minute workshop guiding developers through distributed tracing, metrics, and automated instrumentation in Python microservices.',
        },
        {
          title: 'Building Agentic AI on AWS: Architecture to Production',
          desc: 'Architectural patterns for developing autonomous AI agents with LangGraph, Bedrock, and Python execution environments.',
        },
      ],
      'zh-hk': [
        {
          title: '【主題演講】pip install community：構建全球 Python 社群網絡',
          desc: '探討在地技術社群如何發展為國際開源基金會，分享社群培育、開源導師制度與長遠發展之道。',
        },
        {
          title: '實戰工作坊：OpenTelemetry 與雲原生 Python 可觀測性指南',
          desc: '90 分鐘實戰教學，引導開發者掌握分散式追蹤、指標監控與 Python 微服務自動化追蹤。',
        },
        {
          title: '在 AWS 上構建 Agentic AI：從概念架構到生產實踐',
          desc: '分享使用 LangGraph、AWS Bedrock 與 Python 執行環境打造自主 AI 智能體的架構模式。',
        },
      ],
      'zh-hant': [
        {
          title: '【主題演講】pip install community：構建全球 Python 社群網絡',
          desc: '探討在地技術社群如何發展為國際開源基金會，分享社群培育、開源導師制度與長遠發展之道。',
        },
        {
          title: '實戰工作坊：OpenTelemetry 與雲原生 Python 可觀測性指南',
          desc: '90 分鐘實戰教學，引導開發者掌握分散式追蹤、指標監控與 Python 微服務自動化追蹤。',
        },
        {
          title: '在 AWS 上構建 Agentic AI：從概念架構到生產實踐',
          desc: '分享使用 LangGraph、AWS Bedrock 與 Python 執行環境打造自主 AI 智能體的架構模式。',
        },
      ],
      'zh-hans': [
        {
          title: '【主题演讲】pip install community：构建全球 Python 社区网络',
          desc: '探讨本地技术社区如何发展为国际开源基金会，分享社区培育、开源导师制度与长远发展之道。',
        },
        {
          title: '实战工作坊：OpenTelemetry 与云原生 Python 可观测性指南',
          desc: '90 分钟实战教学，引导开发者掌握分布式追踪、指标监控与 Python 微服务自动化追踪。',
        },
        {
          title: '在 AWS 上构建 Agentic AI：从概念架构到生产实践',
          desc: '分享使用 LangGraph、AWS Bedrock 与 Python 执行环境打造自主 AI 智能体的架构模式。',
        },
      ],
      ja: [
        {
          title:
            '【基調講演】pip install community: グローバルな Python コミュニティの育成',
          desc: '草の根コミュニティから国際的なオープンソース財団への成長とメンターシップの重要性を語ります。',
        },
        {
          title: 'ハンズオンワークショップ: OpenTelemetry による Python 可観測性入門',
          desc: '90 分間の実践型ワークショップで、分散トレーシングとメトリクス収集の基礎を体験します。',
        },
        {
          title: 'AWS 上でのエージェンティック AI 開発実践',
          desc: 'LangGraph と AWS Bedrock を活用した自律型 AI エージェントのアーキテクチャパターンを解説します。',
        },
      ],
      ko: [
        {
          title: '[기조연설] pip install community: 글로벌 파이썬 네트워크의 구축',
          desc: '지역 커뮤니티에서 국제 오픈소스 재단으로 성장하는 여정과 멘토링의 중요성을 조명합니다.',
        },
        {
          title: '실습 워크숍: OpenTelemetry 기반의 파이썬 옵저버빌리티',
          desc: '90분간 파이썬 마이크로서비스의 분산 추적 및 메트릭 수집을 직접 실습합니다.',
        },
        {
          title: 'AWS 기반의 에이전틱 AI 구축 아키텍처',
          desc: 'LangGraph 및 AWS Bedrock을 활용한 자율 AI 에이전트 개발 실무를 공유합니다.',
        },
      ],
    },
    day2Info: {
      en: [
        'The Development Sprint on Day 2 brings maintainers, contributors, and newcomers together for a full day of collaborative open-source hacking.',
        'Whether you are fixing your first bug, drafting documentation, or contributing a new feature to popular Python libraries, sprint leads and seasoned mentors are on hand to guide you step-by-step.',
      ],
      'zh-hk': [
        '大會次日舉辦的 Development Sprint 開發日，聚集開源維護者、貢獻者及編程初學者，展開為期一天的開源協作與編程交流。',
        '無論您是希望提交第一個 Pull Request、改善文檔，還是為著名 Python 函式庫開發新功能，現場導師均會全程提供指引。',
      ],
      'zh-hant': [
        '大會次日舉辦的 Development Sprint 開發日，聚集開源維護者、貢獻者及編程初學者，展開為期一天的開源協作與編程交流。',
        '無論您是希望提交第一個 Pull Request、改善文檔，還是為著名 Python 函式庫開發新功能，現場導師均會全程提供指引。',
      ],
      'zh-hans': [
        '大会次日举办的 Development Sprint 开发日，聚集开源维护者、贡献者及编程初学者，展开为期一天的开源协作与编程交流。',
        '无论您是希望提交第一个 Pull Request、改善文档，还是为著名 Python 库开发新功能，现场导师均会全程提供指引。',
      ],
      ja: [
        '2日目の開発スプリントでは、メンテナー、コントリビューター、初心者が一堂に会し、オープンソースプロジェクトの共同開発を行います。',
        '初めての PR 提出からドキュメント改善、新機能実装まで、経験豊富なメンターがサポートします。',
      ],
      ko: [
        '2일차 개발 스프린트에서는 메인테이너와 기여자가 함께 모여 하루 동안 오픈소스 프로젝트를 협업 개발합니다.',
        '첫 기여부터 기능 구현까지 숙련된 멘토들이 친절하게 가이드합니다.',
      ],
    },
    ticketsInfo: {
      en: [
        'Registration for PyCon HK 2026 is officially open! Tickets support our non-profit community conference and cover venue costs, speaker hospitality, refreshments, and volunteer operations.',
        'Early registrations guarantee access to conference swag packs, limited-edition event T-shirts, and access to all 4 session tracks.',
      ],
      'zh-hk': [
        'PyCon HK 2026 現已正式開放報名！門票收益全數用於支持非牟利社群活動，涵蓋場地開支、講者接待、茶歇及義工運作。',
        '提早報名可確保獲得限量版大會紀念 T-shirt、精美紀念禮品包及全日 4 軌論壇通行證。',
      ],
      'zh-hant': [
        'PyCon HK 2026 現已正式開放報名！門票收益全數用於支持非牟利社群活動，涵蓋場地開支、講者接待、茶歇及義工運作。',
        '提早報名可確保獲得限量版大會紀念 T-shirt、精美紀念禮品包及全日 4 軌論壇通行證。',
      ],
      'zh-hans': [
        'PyCon HK 2026 现已正式开放报名！门票收益全数用于支持非牟利社区活动，涵盖场地开支、讲者接待、茶歇及义工运作。',
        '提早报名可确保获得限量版大会纪念 T-shirt、精美纪念礼品包及全日 4 轨论坛通行证。',
      ],
      ja: [
        'PyCon HK 2026 の参加登録が受付中！チケット収益は非営利イベントの運営資金として活用されます。',
        '早期登録者には限定 T シャツや記念グッズパックをご用意しています。',
      ],
      ko: [
        'PyCon HK 2026 등록이 시작되었습니다! 모든 수익은 비영리 커뮤니티 행사 운영에 사용됩니다.',
        '사전 등록자에게는 한정판 티셔츠와 기념품 패키지가 제공됩니다.',
      ],
    },
    sponsorInfo: {
      en: [
        'PyCon HK 2026 offers an exceptional platform to connect with developers, data scientists, and engineering leaders across the Asia-Pacific region.',
        'Interested in sponsoring or volunteering? Reach out to us via pycon@pycon.hk or follow our official social channels.',
      ],
      'zh-hk': [
        'PyCon HK 2026 為企業提供絕佳平台，與亞太區頂尖軟件工程師、數據科學家及技術決策者建立深度聯繫。',
        '如有意贊助大會或加入義工團隊，歡迎電郵至 pycon@pycon.hk 或關注大會官方社交媒體。',
      ],
      'zh-hant': [
        'PyCon HK 2026 為企業提供絕佳平台，與亞太區頂尖軟件工程師、數據科學家及技術決策者建立深度聯繫。',
        '如有意贊助大會或加入義工團隊，歡迎電郵至 pycon@pycon.hk 或關注大會官方社交媒體。',
      ],
      'zh-hans': [
        'PyCon HK 2026 为企业提供绝佳平台，与亚太区顶尖软件工程师、数据科学家及技术决策者建立深度联系。',
        '如有意赞助大会或加入义工团队，欢迎电邮至 pycon@pycon.hk 或关注大会官方社交媒体。',
      ],
      ja: [
        'アジア太平洋地域のエンジニアやデータサイエンティストと繋がる絶好の機会です。',
        '協賛やボランティアにご興味のある方は pycon@pycon.hk までお問い合わせください。',
      ],
      ko: [
        '아시아 태평양 지역의 개발자 및 엔지니어링 리더와 교류할 수 있는 최고의 기회입니다.',
        '스폰서십 및 자원봉사 문의는 pycon@pycon.hk 로 연락주시기 바랍니다.',
      ],
    },
  },
];

export function getNewsArticles(): NewsArticle[] {
  return newsArticles;
}

export function getNewsArticleBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((a) => a.slug === slug);
}
