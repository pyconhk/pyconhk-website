import type { TranslationMessages } from './schema';

const zhHansMessages = {
  home: {
    eyebrow: 'PyCon HK 2025',
    title: 'Sailing Together',
    tagline: 'Raise the Sail, Let Python Prevail',
    intro:
      'PyCon HK 2025 将于香港城市大学举行，带来两天的 talks、workshops、Sprint Day 与社群交流活动。',
    facts: [
      {
        label: '日期',
        value: '2025 年 10 月 11 至 12 日',
      },
      {
        label: '地点',
        value: '香港城市大学',
      },
      {
        label: '重点',
        value: 'Talks、Workshops、Sprint Day',
      },
    ],
    primaryCta: '立即购票',
    secondaryCta: '会议议程',
    tertiaryCta: '最新消息',
    newsHeading: '最新消息',
    newsIntro: '由 Outstatic 编辑流程发布的最新公告，现已整合至 Astro 网站。',
    speakersHeading: '焦点讲者',
    speakersIntro: '抢先看看目前已公布的 PyCon HK 2025 讲者阵容。',
    sponsorsHeading: '赞助与合作伙伴',
    sponsorsIntro:
      '感谢以下机构支持 PyCon HK，让大会持续保持开放、实用，并以社群为核心。',
    actionsHeading: '参与会议',
    actionsIntro: '无论你想参加 Sprint、支持会议，或先做好活动准备，都可以从这里开始。',
    sprintTitle: 'Call for Sprint',
    sprintBody:
      '与社群建立连接，一起贡献开源项目。PyCon HK 2025 Sprint 是与其他开发者协作、交流并共同实作的好机会。',
    sprintBenefits: [
      '与 maintainers 与 contributors 建立连接',
      '通过实作获得更深入的学习体验',
      '帮助你的开源项目持续成长',
    ],
    sprintCta: '立即提交项目',
    sponsorTitle: 'Call for Sponsorships',
    sponsorBody:
      '支持 Python 社群，同时提升品牌能见度。PyCon HK 提供多种赞助方案，协助你的团队更直接地与参加者互动。',
    sponsorBenefits: ['会场展区摊位空间', '网站与活动物料上的品牌展示', '赞助演讲机会'],
    sponsorCta: '成为赞助伙伴',
    datesHeading: '重要日期',
    datesIntro: '通过简洁的时间线，先掌握会议周末前后的重要日程。',
    dates: [
      {
        title: '会议日',
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
    faqHeading: '常见问题',
    faqs: [
      {
        question: '哪些类型的 Sprint 项目适合提交？',
        answer:
          '我们欢迎各类型的开源项目，尤其是与 Python、Python 社群，或香港本地文化与语言相关的项目。',
      },
      {
        question: '赞助 PyCon HK 有哪些好处？',
        answer:
          '赞助伙伴可提升在社群中的曝光、接触开发者与潜在招募对象，并直接支持香港的 Python 与开源生态。',
      },
      {
        question: '参加 Sprint Day 前需要准备什么？',
        answer:
          '建议先准备手提电脑、预先加入相关 Discord 频道，并完成 Sprint Lead 提供的安装测试或环境设置。',
      },
    ],
    footerSummary:
      '一个由社群共同打造的 Python 大会，连接香港与更多开发者、教育工作者与分享者。',
    quickLinksHeading: '快速链接',
    archiveHeading: '历年网站',
    archiveNote:
      '历年网站目前不在第一阶段 Astro 迁移范围内，将待本年度网站稳定后再处理。',
    sectionBackLabel: '返回首页',
    sectionNote:
      '此路由现已运行于新的 Astro 架构之上。共用版面、语言路由与页面框架皆已到位，详细内容将再由旧网站逐步迁移。',
    sectionStatusLabel: '迁移进行中',
    sectionStatusBody:
      '此页面已先行上线，以确保导航、语言切换与年份结构一致，完整内容将稍后补上。',
    relatedRoutesHeading: '相关路由',
    continueExploringHeading: '继续浏览',
    newsEmptyState: '目前尚无已发布的更新。',
    viewAllNewsLabel: '查看全部消息',
    readArticleLabel: '阅读全文',
    articleBackLabel: '返回最新消息',
    englishOnlyNotice: '这篇文章目前仅提供英文版本，其他语言内容仍在整理中。',
    englishOnlyPageNotice: '这个页面目前仅提供英文版本，其他语言内容仍在整理中。',
    privacyPolicyLabel: '隐私政策',
    menuLabel: '菜单',
  },
} satisfies TranslationMessages;

export default zhHansMessages;
