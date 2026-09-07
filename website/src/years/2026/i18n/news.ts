import type { CfpLocale } from '@/years/2026/locales';

type NewsMessages = {
  title: string;
  subtitle: string;
  description: string;
  empty: string;
  readArticle: string;
  backToNews: string;
  allNews: string;
};

export const newsMessages: Record<CfpLocale, NewsMessages> = {
  en: {
    title: 'News',
    subtitle: 'Announcements & Community Updates',
    description:
      'The latest announcements, programme updates and community news from PyCon HK 2026.',
    empty:
      'Announcements will appear here once they are ready. Please check back soon.',
    readArticle: 'Read article',
    backToNews: 'Back to News',
    allNews: 'All news',
  },
  'zh-hk': {
    title: '最新消息',
    subtitle: '大會公告與社群動態',
    description: '睇吓 PyCon HK 2026 最新公告、議程更新同社群消息。',
    empty: '公告準備好就會喺呢度發佈，請稍後再嚟睇吓。',
    readArticle: '閱讀文章',
    backToNews: '返回最新消息',
    allNews: '所有消息',
  },
  'zh-hant': {
    title: '最新消息',
    subtitle: '大會公告與社群動態',
    description: '查看 PyCon HK 2026 最新公告、議程更新及社群消息。',
    empty: '公告準備就緒後將在此發佈，請稍後再查看。',
    readArticle: '閱讀文章',
    backToNews: '返回最新消息',
    allNews: '所有消息',
  },
  'zh-hans': {
    title: '最新消息',
    subtitle: '大会公告与社区动态',
    description: '查看 PyCon HK 2026 最新公告、议程更新及社区消息。',
    empty: '公告准备就绪后将在此发布，请稍后再查看。',
    readArticle: '阅读文章',
    backToNews: '返回最新消息',
    allNews: '所有消息',
  },
  ja: {
    title: 'ニュース',
    subtitle: 'お知らせ・コミュニティ情報',
    description:
      'PyCon HK 2026 の最新のお知らせ、プログラム更新、コミュニティの情報をお届けします。',
    empty:
      'お知らせは準備ができ次第、こちらに掲載します。しばらくしてからご確認ください。',
    readArticle: '記事を読む',
    backToNews: 'ニュースに戻る',
    allNews: 'すべてのニュース',
  },
  ko: {
    title: '뉴스',
    subtitle: '공지사항 및 커뮤니티 소식',
    description:
      'PyCon HK 2026의 최신 공지사항, 프로그램 업데이트 및 커뮤니티 소식을 확인하세요.',
    empty: '공지사항은 준비되는 대로 게시됩니다. 잠시 후 다시 확인해 주세요.',
    readArticle: '기사 읽기',
    backToNews: '뉴스로 돌아가기',
    allNews: '전체 뉴스',
  },
};
