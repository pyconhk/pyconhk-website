import type { TranslationMessages } from './schema';

const jaMessages = {
  home: {
    eyebrow: 'PyCon HK 2025',
    title: 'Sailing Together',
    tagline: 'Raise the Sail, Let Python Prevail',
    intro:
      'PyCon HK 2025 は、香港城市大学を会場に、2 日間の talks、workshops、スプリント開発デー、そしてコミュニティ交流をお届けします。',
    facts: [
      {
        label: '日程',
        value: '2025 年 10 月 11-12 日',
      },
      {
        label: '会場',
        value: '香港城市大学',
      },
      {
        label: '内容',
        value: 'Talks、Workshops、スプリント開発デー',
      },
    ],
    primaryCta: 'チケットを申し込む',
    secondaryCta: 'カンファレンス日程',
    tertiaryCta: '最新ニュース',
    newsHeading: '最新ニュース',
    newsIntro:
      'Outstatic の編集フローで公開された最新のお知らせを、Astro サイト上でまとめて確認できます。',
    speakersHeading: '注目スピーカー',
    speakersIntro: 'PyCon HK 2025 で発表済みのスピーカーをひと足先にご紹介します。',
    sponsorsHeading: 'スポンサーとパートナー',
    sponsorsIntro:
      'PyCon HK をオープンで実践的、そしてコミュニティ中心の場として支えてくださる皆さまです。',
    actionsHeading: '参加方法',
    actionsIntro:
      'Sprint に参加したい方も、スポンサーとして支援したい方も、事前準備を進めたい方も、ここから始められます。',
    sprintTitle: 'Call for Sprint',
    sprintBody:
      'コミュニティとつながり、オープンソースプロジェクトに貢献しましょう。PyCon HK 2025 Sprint は、ほかの開発者と協力し、交流し、実際に手を動かせる絶好の機会です。',
    sprintBenefits: [
      'maintainers や contributors とつながれる',
      '実践を通じて深く学べる',
      '自分のオープンソースプロジェクトを成長させられる',
    ],
    sprintCta: 'プロジェクトを応募する',
    sponsorTitle: 'Call for Sponsorships',
    sponsorBody:
      'Python コミュニティを支援しながら、ブランドの認知を高めましょう。PyCon HK では、参加者と実践的につながれるスポンサー枠を用意しています。',
    sponsorBenefits: [
      '会場内のブース出展',
      'Web サイトやイベント資料へのロゴ掲載',
      'スポンサーセッションの機会',
    ],
    sponsorCta: 'スポンサーになる',
    datesHeading: '重要日程',
    datesIntro:
      'カンファレンス週末前後の重要な日程を、簡単なタイムラインで確認できます。',
    dates: [
      {
        title: 'Conference Day',
        date: '2025 年 10 月 11 日',
      },
      {
        title: 'Sprint 応募締切',
        date: '2025 年 10 月 11 日',
      },
      {
        title: 'スプリント開発デー',
        date: '2025 年 10 月 12 日',
      },
    ],
    faqHeading: 'よくある質問',
    faqs: [
      {
        question: 'どのような Sprint プロジェクトが向いていますか？',
        answer:
          'あらゆる規模のオープンソースプロジェクトを歓迎します。特に Python、Python コミュニティ、香港の文化や言語に関連するものは大歓迎です。',
      },
      {
        question: 'PyCon HK をスポンサーするメリットは何ですか？',
        answer:
          'スポンサーはコミュニティ内での認知向上、開発者や採用候補者との接点づくり、そして香港の Python / オープンソース活動への直接的な支援につながります。',
      },
      {
        question: 'スプリント開発デー参加前に準備することはありますか？',
        answer:
          'はい。ノート PC を持参し、事前に各プロジェクトの Discord チャンネルへ参加し、Sprint Lead が案内するインストールテストやセットアップを完了してください。',
      },
    ],
    footerSummary:
      '香港を拠点に、つくる人、教える人、共有する人たちをつなぐコミュニティ主導の Python カンファレンスです。',
    quickLinksHeading: 'クイックリンク',
    archiveHeading: '過去開催サイト',
    archiveNote:
      '過去開催分のサイトは、Astro 移行の第 1 フェーズの対象外であり、今年度サイトの安定後に対応予定です。',
    sectionBackLabel: 'ホームへ戻る',
    sectionNote:
      'このルートはすでに新しい Astro 基盤上で動作しています。共通レイアウト、言語ルーティング、ページ枠組みは整っており、詳細コンテンツはアーカイブサイトから順次移行します。',
    sectionStatusLabel: '移行中',
    sectionStatusBody:
      'ナビゲーション、言語切替、年度構成を保つため、このページは先に公開されています。詳細コンテンツは順次追加されます。',
    relatedRoutesHeading: '関連ルート',
    continueExploringHeading: 'さらに見る',
    newsEmptyState: '公開済みのお知らせはまだありません。',
    viewAllNewsLabel: 'すべてのニュースを見る',
    readArticleLabel: '記事を読む',
    articleBackLabel: 'ニュース一覧へ戻る',
    englishOnlyNotice: 'この記事は現在英語版のみ公開されており、他言語版は準備中です。',
    englishOnlyPageNotice:
      'このページは現在英語版のみ公開されており、他言語版は準備中です。',
    privacyPolicyLabel: 'プライバシーポリシー',
    menuLabel: 'メニュー',
  },
} satisfies TranslationMessages;

export default jaMessages;
