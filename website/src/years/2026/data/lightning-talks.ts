import type { CfpLocale } from '@/years/2026/locales';

// The 2026 CFP confirms the five-minute format:
// https://cfp.pycon.hk/pyconhk2026/cfp
// Signup uses the separate 2026 Lightning Talk form owned by the programme team.
// Do not carry forward deadlines or on-site arrangements from other events.
export const lightningTalkRegistrationUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfTCfYW5DNVUXV1_v_lv3cUJmJ1krlKZZ4EPMqbgd2avzmIFA/viewform';

type LightningTalkCopy = {
  title: string;
  subtitle: string;
  intro: string;
  duration: string;
  formatTitle: string;
  formatBody: string;
  participationTitle: string;
  participation: { title: string; body: string }[];
  registrationLink: string;
  confirmationNote: string;
  preparationTitle: string;
  preparation: { title: string; body: string }[];
  linksTitle: string;
  scheduleLink: string;
  conductLink: string;
  contactLink: string;
};

export const lightningTalkCopy: Record<CfpLocale, LightningTalkCopy> = {
  en: {
    title: 'Lightning Talks',
    subtitle: 'One idea. Five minutes.',
    intro: 'Share a Python idea, a quick demo, or a lesson learned with the community.',
    duration: '5 minutes',
    formatTitle: 'A short talk with a clear takeaway',
    formatBody:
      'A Lightning Talk is a short presentation built around one focused idea. Keep it simple so the audience leaves with something they can remember or try.',
    participationTitle: 'How to take part',
    participation: [
      {
        title: 'Send us your idea',
        body: 'Fill in the Lightning Talk signup form with your proposed topic and contact details.',
      },
      {
        title: 'Wait for confirmation',
        body: 'The programme team will review your proposal and contact you about the result and next steps.',
      },
      {
        title: 'Get ready to present',
        body: 'Prepare your five-minute talk and follow the organizer instructions for check-in and presenting on the day.',
      },
    ],
    registrationLink: 'Sign up for a Lightning Talk',
    confirmationNote: 'Submitting the form does not confirm a speaking slot.',
    preparationTitle: 'Prepare your five minutes',
    preparation: [
      {
        title: 'Choose one idea',
        body: 'Pick a useful tip, a project, a demo, or an experience. Decide what you want the audience to take away.',
      },
      {
        title: 'Practise with a timer',
        body: 'Rehearse the whole talk within five minutes, including your introduction and any demo. Keep slides easy to read.',
      },
      {
        title: 'Make everyone welcome',
        body: 'Use respectful, inclusive language and follow the conference Code of Conduct.',
      },
    ],
    linksTitle: 'Plan your visit',
    scheduleLink: 'Conference schedule',
    conductLink: 'Code of Conduct',
    contactLink: 'Contact the organizers',
  },
  'zh-hk': {
    title: '閃電演講',
    subtitle: '一個諗法，五分鐘分享',
    intro: '用一個 Python 點子、簡短示範，或者親身經驗，同社群交流。',
    duration: '5 分鐘',
    formatTitle: '篇幅短，重點清楚',
    formatBody:
      '閃電演講係圍繞一個重點嘅短講。內容簡單直接，等大家聽完可以記住一個諗法，或者試吓一個新方法。',
    participationTitle: '點樣參加',
    participation: [
      {
        title: '提交你嘅諗法',
        body: '填寫閃電演講報名表，提供你想分享嘅題目同聯絡資料。',
      },
      {
        title: '等候確認',
        body: '節目團隊會審閱你嘅提案，再聯絡你通知結果同之後嘅安排。',
      },
      {
        title: '準備上台分享',
        body: '準備好五分鐘嘅分享，並按照籌辦團隊嘅指示喺當日報到同演講。',
      },
    ],
    registrationLink: '報名做閃電演講',
    confirmationNote: '交咗報名表唔代表已經獲得演講名額。',
    preparationTitle: '準備好你嘅五分鐘',
    preparation: [
      {
        title: '揀一個重點',
        body: '可以係實用技巧、項目、示範，或者一段經驗。先諗清楚想大家聽完帶走啲乜。',
      },
      {
        title: '計住時間練習',
        body: '將自我介紹同示範都計埋，練習喺五分鐘內講完。投影片要簡單易睇。',
      },
      {
        title: '照顧唔同背景嘅聽眾',
        body: '用尊重、包容嘅語言分享，並遵守大會行為準則。',
      },
    ],
    linksTitle: '安排你嘅大會行程',
    scheduleLink: '大會議程',
    conductLink: '行為準則',
    contactLink: '聯絡籌辦團隊',
  },
  'zh-hant': {
    title: '閃電演講',
    subtitle: '一個想法，五分鐘分享',
    intro: '與社群分享一個 Python 點子、簡短示範，或親身學到的經驗。',
    duration: '5 分鐘',
    formatTitle: '篇幅精簡，重點清楚',
    formatBody:
      '閃電演講是圍繞一個核心想法的短講。讓內容簡單明確，使聽眾帶走一個值得記住或嘗試的重點。',
    participationTitle: '如何參加',
    participation: [
      {
        title: '提交您的想法',
        body: '填寫閃電演講報名表，提供擬分享的題目及聯絡資料。',
      },
      {
        title: '等候確認',
        body: '節目團隊將審閱您的提案，並聯絡您告知結果及後續安排。',
      },
      {
        title: '準備上台分享',
        body: '準備好五分鐘的分享，並依照籌辦團隊的指示於當日報到及演講。',
      },
    ],
    registrationLink: '報名閃電演講',
    confirmationNote: '提交報名表並不代表已獲得演講名額。',
    preparationTitle: '準備您的五分鐘',
    preparation: [
      {
        title: '選定一個重點',
        body: '可以分享實用技巧、專案、示範或個人經驗。先確定希望聽眾帶走的收穫。',
      },
      {
        title: '計時練習',
        body: '將自我介紹及示範納入計時，練習在五分鐘內完成演講。投影片應清晰易讀。',
      },
      {
        title: '尊重每位聽眾',
        body: '使用尊重且包容的語言分享，並遵守大會行為準則。',
      },
    ],
    linksTitle: '規劃大會行程',
    scheduleLink: '大會議程',
    conductLink: '行為準則',
    contactLink: '聯絡籌辦團隊',
  },
  'zh-hans': {
    title: '闪电演讲',
    subtitle: '一个想法，五分钟分享',
    intro: '与社区分享一个 Python 点子、简短演示，或亲身学到的经验。',
    duration: '5 分钟',
    formatTitle: '篇幅精简，重点清楚',
    formatBody:
      '闪电演讲是围绕一个核心想法的短讲。让内容简单明确，使听众带走一个值得记住或尝试的重点。',
    participationTitle: '如何参加',
    participation: [
      {
        title: '提交您的想法',
        body: '填写闪电演讲报名表，提供拟分享的题目及联系信息。',
      },
      {
        title: '等候确认',
        body: '节目团队将审阅您的提案，并联系您告知结果及后续安排。',
      },
      {
        title: '准备上台分享',
        body: '准备好五分钟的分享，并按照筹办团队的指示于当天报到及演讲。',
      },
    ],
    registrationLink: '报名闪电演讲',
    confirmationNote: '提交报名表并不代表已获得演讲名额。',
    preparationTitle: '准备您的五分钟',
    preparation: [
      {
        title: '选定一个重点',
        body: '可以分享实用技巧、项目、演示或个人经验。先确定希望听众带走的收获。',
      },
      {
        title: '计时练习',
        body: '将自我介绍及演示纳入计时，练习在五分钟内完成演讲。幻灯片应清晰易读。',
      },
      {
        title: '尊重每位听众',
        body: '使用尊重且包容的语言分享，并遵守大会行为准则。',
      },
    ],
    linksTitle: '规划大会行程',
    scheduleLink: '大会议程',
    conductLink: '行为准则',
    contactLink: '联系筹办团队',
  },
  ja: {
    title: 'ライトニングトーク',
    subtitle: 'ひとつのアイデアを、5分で。',
    intro: 'Pythonのアイデア、短いデモ、学んだことをコミュニティと共有しましょう。',
    duration: '5分',
    formatTitle: '短く、伝えたいことを明確に',
    formatBody:
      'ライトニングトークは、ひとつのテーマに絞った短い発表です。聞いた人が覚えたり試したりできるよう、内容をシンプルにまとめましょう。',
    participationTitle: '参加方法',
    participation: [
      {
        title: 'アイデアを送る',
        body: 'ライトニングトークの申込フォームに、発表したいテーマと連絡先を記入してください。',
      },
      {
        title: '連絡を待つ',
        body: 'プログラムチームが提案を確認し、結果と今後の手順をご連絡します。',
      },
      {
        title: '発表に備える',
        body: '5分間の発表を準備し、当日の受付や登壇については運営チームの案内に従ってください。',
      },
    ],
    registrationLink: 'ライトニングトークに申し込む',
    confirmationNote: 'フォームの送信だけでは登壇は確定しません。',
    preparationTitle: '5分間の発表を準備する',
    preparation: [
      {
        title: 'テーマをひとつ選ぶ',
        body: '便利なコツ、プロジェクト、デモ、経験などから、聞き手に持ち帰ってほしいポイントを決めましょう。',
      },
      {
        title: '時間を計って練習する',
        body: '自己紹介やデモも含めて5分以内に収まるよう、通して練習しましょう。スライドは読みやすくまとめましょう。',
      },
      {
        title: '誰もが安心して聞ける発表にする',
        body: '相手を尊重したインクルーシブな言葉を使い、カンファレンスの行動規範を守りましょう。',
      },
    ],
    linksTitle: '参加に役立つ情報',
    scheduleLink: 'カンファレンスのスケジュール',
    conductLink: '行動規範',
    contactLink: '運営チームに問い合わせる',
  },
  ko: {
    title: '라이트닝 토크',
    subtitle: '하나의 아이디어를 5분 안에',
    intro: 'Python 아이디어, 짧은 데모, 경험에서 배운 점을 커뮤니티와 나눠 보세요.',
    duration: '5분',
    formatTitle: '짧게, 핵심을 분명하게',
    formatBody:
      '라이트닝 토크는 하나의 주제에 집중하는 짧은 발표입니다. 청중이 기억하거나 직접 시도해 볼 수 있도록 내용을 간결하게 정리해 주세요.',
    participationTitle: '참여 방법',
    participation: [
      {
        title: '아이디어 제출하기',
        body: '라이트닝 토크 신청 양식에 발표하고 싶은 주제와 연락처를 작성해 주세요.',
      },
      {
        title: '안내 기다리기',
        body: '프로그램 팀이 제안을 검토한 후 결과와 다음 절차를 안내해 드립니다.',
      },
      {
        title: '발표 준비하기',
        body: '5분 발표를 준비하고 행사 당일 체크인과 발표에 관한 운영진의 안내를 따라 주세요.',
      },
    ],
    registrationLink: '라이트닝 토크 신청하기',
    confirmationNote: '신청 양식을 제출하는 것만으로 발표가 확정되지는 않습니다.',
    preparationTitle: '5분 발표 준비하기',
    preparation: [
      {
        title: '하나의 아이디어 고르기',
        body: '유용한 팁, 프로젝트, 데모 또는 경험을 골라 청중에게 전달할 핵심을 정해 보세요.',
      },
      {
        title: '시간을 재며 연습하기',
        body: '자기소개와 데모를 포함해 전체 발표를 5분 안에 마칠 수 있도록 연습하세요. 슬라이드는 읽기 쉽게 준비해 주세요.',
      },
      {
        title: '모두를 존중하는 발표하기',
        body: '서로를 존중하고 포용하는 표현을 사용하며 컨퍼런스 행동 강령을 지켜 주세요.',
      },
    ],
    linksTitle: '참가에 필요한 정보',
    scheduleLink: '컨퍼런스 일정',
    conductLink: '행동 강령',
    contactLink: '운영진에게 문의하기',
  },
};
