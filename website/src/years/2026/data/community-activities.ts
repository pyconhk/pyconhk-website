import type { CfpLocale } from '@/years/2026/locales';

// Event directory and activity instructions supplied by the design team:
// https://www.canva.com/design/DAHXzgYDJmc/Eu0c-ona5vej7wLay24GFg/edit
// Public copy omits date and venue metadata. Opening hours, the Job Board
// posting process, prize items and collection point are not confirmed here.
// PyShare's optional prize process is on page 17.
export type CommunityActivity = 'job-board' | 'pyshare';

type ActivityCopy = {
  title: string;
  navLabel: string;
  intro: string;
  participationTitle: string;
  sections: { title: string; body: string }[];
  numbered: boolean;
  note: string;
  linksTitle: string;
  scheduleLink: string;
  conductLink: string;
};

export const communityActivityCopy: Record<
  CommunityActivity,
  Record<CfpLocale, ActivityCopy>
> = {
  'job-board': {
    en: {
      title: 'Job / Internship Matching Board',
      navLabel: 'Job Board',
      intro:
        'Meet your next teammate, or discover a job or internship through the Python community.',
      participationTitle: 'Find your next connection',
      sections: [
        {
          title: 'Hiring for your team?',
          body: 'Share your job and internship opportunities with conference participants.',
        },
        {
          title: 'Looking for an opportunity?',
          body: 'Browse the board for roles that interest you and find out how to connect with the teams recruiting.',
        },
      ],
      numbered: false,
      note: 'PyCon HK provides the space for these connections; a job or internship match is not guaranteed.',
      linksTitle: 'At the conference',
      scheduleLink: 'Conference schedule',
      conductLink: 'Code of Conduct',
    },
    'zh-hk': {
      title: '工作／實習配對板',
      navLabel: 'Job Board 工作配對板',
      intro: '想搵新隊友，定係下一份工作或實習？嚟同 Python 社群認識吓、交流吓。',
      participationTitle: '搵到下一個機會',
      sections: [
        {
          title: '想為團隊招人？',
          body: '同參加者分享你哋嘅工作同實習機會。',
        },
        {
          title: '想搵工作或實習？',
          body: '睇吓板上有冇啱你嘅職位，再了解點樣聯絡招聘團隊。',
        },
      ],
      numbered: false,
      note: 'PyCon HK 提供交流空間，但唔保證配對成功。',
      linksTitle: '大會資訊',
      scheduleLink: '大會議程',
      conductLink: '行為準則',
    },
    'zh-hant': {
      title: '工作／實習配對板',
      navLabel: 'Job Board 工作配對板',
      intro: '透過 Python 社群認識新隊友，或尋找下一份工作與實習機會。',
      participationTitle: '建立新的連繫',
      sections: [
        {
          title: '為團隊招募人才',
          body: '向大會參加者分享工作及實習機會。',
        },
        {
          title: '尋找工作或實習',
          body: '瀏覽配對板上的職位資訊，找到感興趣的機會，並了解如何聯絡招聘團隊。',
        },
      ],
      numbered: false,
      note: 'PyCon HK 提供交流空間，但不保證配對成功。',
      linksTitle: '大會資訊',
      scheduleLink: '大會議程',
      conductLink: '行為準則',
    },
    'zh-hans': {
      title: '工作／实习对接板',
      navLabel: 'Job Board 工作对接板',
      intro: '通过 Python 社区认识新队友，或寻找下一份工作与实习机会。',
      participationTitle: '建立新的联系',
      sections: [
        {
          title: '为团队招募人才',
          body: '向大会参加者分享工作及实习机会。',
        },
        {
          title: '寻找工作或实习',
          body: '浏览对接板上的职位信息，找到感兴趣的机会，并了解如何联系招聘团队。',
        },
      ],
      numbered: false,
      note: 'PyCon HK 提供交流空间，但不保证对接成功。',
      linksTitle: '大会信息',
      scheduleLink: '大会议程',
      conductLink: '行为准则',
    },
    ja: {
      title: '求人・インターンシップ掲示板',
      navLabel: '求人掲示板',
      intro:
        'Python コミュニティで、新しい仲間や仕事、インターンシップの機会を見つけましょう。',
      participationTitle: '次の出会いを見つける',
      sections: [
        {
          title: '採用をお考えの方へ',
          body: '参加者に求人やインターンシップの情報を紹介できます。',
        },
        {
          title: '仕事やインターンシップをお探しの方へ',
          body: '掲示板で気になる募集を探し、採用チームへの連絡方法を確認しましょう。',
        },
      ],
      numbered: false,
      note: 'PyCon HK は交流の場を提供しますが、採用やマッチングを保証するものではありません。',
      linksTitle: 'カンファレンスのご案内',
      scheduleLink: 'スケジュール',
      conductLink: '行動規範',
    },
    ko: {
      title: '채용·인턴십 매칭 게시판',
      navLabel: '채용 게시판',
      intro:
        'Python 커뮤니티에서 새로운 동료를 만나거나 일자리와 인턴십 기회를 찾아보세요.',
      participationTitle: '새로운 기회 만나기',
      sections: [
        {
          title: '팀원을 찾고 계신가요?',
          body: '참가자들에게 채용 및 인턴십 기회를 소개해 보세요.',
        },
        {
          title: '일자리나 인턴십을 찾고 계신가요?',
          body: '게시판에서 관심 있는 공고를 살펴보고 채용팀에 연락하는 방법을 확인해 보세요.',
        },
      ],
      numbered: false,
      note: 'PyCon HK는 만남의 공간을 제공하며, 채용이나 매칭을 보장하지 않습니다.',
      linksTitle: '행사 안내',
      scheduleLink: '컨퍼런스 일정',
      conductLink: '행동 강령',
    },
  },
  pyshare: {
    en: {
      title: 'PyShare',
      navLabel: 'PyShare',
      intro:
        'Leave a thought, share a dream, and discover what resonates with others in the community.',
      participationTitle: 'How to take part',
      sections: [
        {
          title: 'Pick up a card',
          body: 'Ask a volunteer for a card. Write about a challenge you are facing, how Python has enriched your life, a long-held dream, or anything else you would like to share. You can answer more than one question.',
        },
        {
          title: 'Add your thought to the board',
          body: 'Use Blu Tack to attach your card to the whiteboard for other participants to read.',
        },
        {
          title: 'Show what resonates with you',
          body: 'Read the other cards and use circle stickers to vote for messages that resonate with you.',
        },
        {
          title: 'Join the prize selection (optional)',
          body: 'To enter your message, get a numbered slip from a volunteer, keep it, and write the same number on your card. The two messages with the most votes and their winning numbers will be announced at the closing.',
        },
      ],
      numbered: true,
      note: 'Keep your messages respectful and follow the conference Code of Conduct. Share only what you are comfortable displaying publicly.',
      linksTitle: 'At the conference',
      scheduleLink: 'Conference schedule',
      conductLink: 'Code of Conduct',
    },
    'zh-hk': {
      title: 'PyShare 心事台',
      navLabel: 'PyShare 心事台',
      intro: '留低一個諗法，分享一個夢想，睇吓社群入面有邊啲聲音令你有共鳴。',
      participationTitle: '點樣參加',
      sections: [
        {
          title: '攞張卡，寫低你想分享嘅嘢',
          body: '向義工攞張卡，可以寫最近遇到嘅難題、Python 點樣令你嘅生活更豐富、一直想實現嘅夢想，或者其他心聲。想答多過一條問題都可以。',
        },
        {
          title: '將卡貼上白板',
          body: '用 Blu Tack 將張卡貼喺白板，等其他參加者睇到你嘅分享。',
        },
        {
          title: '為有共鳴嘅心聲投票',
          body: '睇吓其他人嘅分享，再用圓形貼紙為令你有共鳴嘅留言投票。',
        },
        {
          title: '參加有獎投票（自願）',
          body: '如果想用你嘅留言參加有獎投票，向義工攞張號碼紙，自己保管好，再喺卡上寫低同一個號碼。閉幕環節會公布最高票嘅兩則留言同得獎號碼。',
        },
      ],
      numbered: true,
      note: '互相尊重，遵守大會行為準則。只分享你願意公開俾其他人睇嘅內容。',
      linksTitle: '大會資訊',
      scheduleLink: '大會議程',
      conductLink: '行為準則',
    },
    'zh-hant': {
      title: 'PyShare 心事台',
      navLabel: 'PyShare 心事台',
      intro: '留下一個想法，分享一個夢想，尋找社群中引起共鳴的聲音。',
      participationTitle: '參與方式',
      sections: [
        {
          title: '領取卡片，寫下心聲',
          body: '向義工領取卡片，寫下目前遇到的挑戰、Python 如何豐富你的生活、一直希望實現的夢想，或其他想分享的心聲。你可以回答多於一條問題。',
        },
        {
          title: '將卡片貼上白板',
          body: '使用 Blu Tack 將卡片貼在白板，讓其他參加者閱讀你的分享。',
        },
        {
          title: '為有共鳴的分享投票',
          body: '閱讀其他人的卡片，再以圓形貼紙為引起你共鳴的留言投票。',
        },
        {
          title: '參加有獎投票（自願）',
          body: '如希望以你的留言參加有獎投票，請向義工領取並保管好號碼紙，再於卡片上寫下相同號碼。閉幕環節將公布得票最高的兩則留言及得獎號碼。',
        },
      ],
      numbered: true,
      note: '請互相尊重，遵守大會行為準則，並只分享你願意公開展示的內容。',
      linksTitle: '大會資訊',
      scheduleLink: '大會議程',
      conductLink: '行為準則',
    },
    'zh-hans': {
      title: 'PyShare 心事台',
      navLabel: 'PyShare 心事台',
      intro: '留下一个想法，分享一个梦想，寻找社区中引起共鸣的声音。',
      participationTitle: '参与方式',
      sections: [
        {
          title: '领取卡片，写下心声',
          body: '向志愿者领取卡片，写下目前遇到的挑战、Python 如何丰富你的生活、一直希望实现的梦想，或其他想分享的心声。你可以回答多个问题。',
        },
        {
          title: '将卡片贴上白板',
          body: '使用 Blu Tack 将卡片贴在白板上，让其他参加者阅读你的分享。',
        },
        {
          title: '为有共鸣的分享投票',
          body: '阅读其他人的卡片，再用圆形贴纸为引起你共鸣的留言投票。',
        },
        {
          title: '参加有奖投票（自愿）',
          body: '如希望以你的留言参加有奖投票，请向志愿者领取并保管好号码纸，再在卡片上写下相同号码。闭幕环节将公布得票最高的两则留言及获奖号码。',
        },
      ],
      numbered: true,
      note: '请互相尊重，遵守大会行为准则，并只分享你愿意公开展示的内容。',
      linksTitle: '大会信息',
      scheduleLink: '大会议程',
      conductLink: '行为准则',
    },
    ja: {
      title: 'PyShare',
      navLabel: 'PyShare',
      intro: '思いや夢を書き残し、コミュニティの中で共感できる声を見つけましょう。',
      participationTitle: '参加方法',
      sections: [
        {
          title: 'カードを受け取って書く',
          body: 'ボランティアからカードを受け取りましょう。今困っていること、Python が暮らしにもたらした変化、長年の夢など、共有したいことを書いてください。複数の問いに答えてもかまいません。',
        },
        {
          title: 'ホワイトボードに貼る',
          body: 'Blu Tack（粘着ラバー）でカードをホワイトボードに貼り、ほかの参加者に読んでもらいましょう。',
        },
        {
          title: '共感したメッセージに投票する',
          body: 'ほかの人のカードを読み、共感したメッセージに丸いシールを貼って投票しましょう。',
        },
        {
          title: '賞品付きの投票に参加する（任意）',
          body: '自分のメッセージを賞品選考の対象にしたい方は、ボランティアから番号票を受け取り、同じ番号をカードに書いてください。番号票は保管しておきましょう。クロージングで得票数上位2件のメッセージと当選番号を発表します。',
        },
      ],
      numbered: true,
      note: '互いを尊重し、カンファレンスの行動規範を守ってください。公開してもよいと思える内容だけを共有しましょう。',
      linksTitle: 'カンファレンスのご案内',
      scheduleLink: 'スケジュール',
      conductLink: '行動規範',
    },
    ko: {
      title: 'PyShare 이야기 게시판',
      navLabel: 'PyShare 이야기 게시판',
      intro: '생각이나 꿈을 남기고, 커뮤니티의 어떤 이야기에 공감하는지 찾아보세요.',
      participationTitle: '참여 방법',
      sections: [
        {
          title: '카드를 받아 이야기 적기',
          body: '자원봉사자에게 카드를 받아 지금 겪는 어려움, Python이 삶을 풍요롭게 만든 경험, 오래 품어 온 꿈 등 나누고 싶은 이야기를 적어 주세요. 여러 질문에 답해도 괜찮습니다.',
        },
        {
          title: '화이트보드에 카드 붙이기',
          body: 'Blu Tack(접착 점토)으로 카드를 화이트보드에 붙여 다른 참가자들과 이야기를 나눠 보세요.',
        },
        {
          title: '공감하는 이야기에 투표하기',
          body: '다른 참가자들의 카드를 읽고 공감하는 메시지에 원형 스티커를 붙여 투표해 주세요.',
        },
        {
          title: '경품 선정에 참여하기 (선택)',
          body: '내 메시지로 경품 선정에 참여하려면 자원봉사자에게 번호표를 받아 보관하고, 카드에도 같은 번호를 적어 주세요. 폐회 때 가장 많은 표를 받은 메시지 2개와 당첨 번호를 발표합니다.',
        },
      ],
      numbered: true,
      note: '서로를 존중하고 컨퍼런스 행동 강령을 지켜 주세요. 공개해도 괜찮은 내용만 공유해 주세요.',
      linksTitle: '행사 안내',
      scheduleLink: '컨퍼런스 일정',
      conductLink: '행동 강령',
    },
  },
};
