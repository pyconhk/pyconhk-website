import type { CfpLocale } from '@/years/2026/locales';

// The 2026 CFP confirms the five-minute format:
// https://cfp.pycon.hk/pyconhk2026/cfp
// Signup uses the separate 2026 Lightning Talk form owned by the programme team.
// The email-confirmation flow draws on PyCon Taiwan's example; the times below
// are the HK organizer's confirmed 14 November plan, with HK's five-minute limit.
export const lightningTalkRegistrationUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfTCfYW5DNVUXV1_v_lv3cUJmJ1krlKZZ4EPMqbgd2avzmIFA/viewform';

export const lightningTalkSchedule = {
  date: '2026-11-14',
  timeZone: 'Asia/Hong_Kong',
  registrationOpen: '09:00',
  registrationClose: '13:00',
  notificationTime: '14:30',
  replyDeadline: '15:00',
  checkInTime: '16:30',
  talkStart: '16:50',
  talkEnd: '17:15',
} as const;

const {
  registrationOpen,
  registrationClose,
  notificationTime,
  replyDeadline,
  checkInTime,
  talkStart,
  talkEnd,
} = lightningTalkSchedule;

const scheduleTimes = [
  registrationOpen,
  registrationClose,
  notificationTime,
  replyDeadline,
  checkInTime,
  `${talkStart}–${talkEnd}`,
] as const;

function scheduleRows(labels: [string, string, string, string, string, string]) {
  return scheduleTimes.map((time, index) => ({ time, label: labels[index] }));
}

type LightningTalkCopy = {
  title: string;
  subtitle: string;
  intro: string;
  duration: string;
  formatTitle: string;
  formatBody: string;
  scheduleTitle: string;
  allTimes: string;
  registrationWindowNote: string;
  scheduleRows: { time: string; label: string }[];
  rules: string[];
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
    scheduleTitle: 'On the day',
    allTimes: '14 November 2026 · All times are Hong Kong time (UTC+8).',
    registrationWindowNote: `Registration is open only on 14 November 2026, ${registrationOpen}–${registrationClose} Hong Kong time (UTC+8).`,
    scheduleRows: scheduleRows([
      'Registration opens',
      'Registration closes',
      'Selected speakers notified by email',
      'Deadline to reply by email and confirm',
      'Speaker check-in',
      'Lightning Talks',
    ]),
    rules: [
      'Each talk has a strict five-minute limit.',
      'All talks must follow the conference Code of Conduct.',
      `If selected, reply to the notification email by ${replyDeadline} to confirm your participation.`,
    ],
    participationTitle: 'How to take part',
    participation: [
      {
        title: 'Sign up on the day',
        body: `On 14 November, fill in the form between ${registrationOpen} and ${registrationClose} with your proposed topic and contact details.`,
      },
      {
        title: 'Check your email and confirm',
        body: `The programme team will email selected speakers at ${notificationTime}. Reply to that email by ${replyDeadline} to confirm that you will present.`,
      },
      {
        title: 'Check in and get ready',
        body: `Check in at ${checkInTime} and be ready to give your five-minute talk during the ${talkStart}–${talkEnd} session.`,
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
    scheduleTitle: '當日流程',
    allTimes: '2026 年 11 月 14 日 · 以下全部係香港時間（UTC+8）。',
    registrationWindowNote: `報名只喺 2026 年 11 月 14 日 ${registrationOpen}–${registrationClose} 開放（香港時間，UTC+8）。`,
    scheduleRows: scheduleRows([
      '開始報名',
      '截止報名',
      '用電郵通知獲選講者',
      '回覆電郵確認參加嘅截止時間',
      '講者報到',
      '閃電演講',
    ]),
    rules: [
      '每個演講嚴格限時五分鐘。',
      '所有演講都要遵守大會行為準則。',
      `如果獲選，請喺 ${replyDeadline} 前回覆通知電郵，確認你會上台分享。`,
    ],
    participationTitle: '點樣參加',
    participation: [
      {
        title: '當日填表報名',
        body: `喺 11 月 14 日 ${registrationOpen} 至 ${registrationClose} 填寫報名表，提供你想分享嘅題目同聯絡資料。`,
      },
      {
        title: '睇電郵，回覆確認',
        body: `議程團隊會喺 ${notificationTime} 用電郵通知獲選講者。收到通知後，請喺 ${replyDeadline} 前回覆嗰封電郵，確認你會上台分享。`,
      },
      {
        title: '報到，準備上台',
        body: `請喺 ${checkInTime} 報到，準備喺 ${talkStart}–${talkEnd} 嘅閃電演講時段做五分鐘分享。`,
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
    scheduleTitle: '當日流程',
    allTimes: '2026 年 11 月 14 日 · 以下均為香港時間（UTC+8）。',
    registrationWindowNote: `報名僅於 2026 年 11 月 14 日 ${registrationOpen}–${registrationClose} 開放（香港時間，UTC+8）。`,
    scheduleRows: scheduleRows([
      '開始報名',
      '截止報名',
      '以電郵通知獲選講者',
      '回覆電郵確認參加的截止時間',
      '講者報到',
      '閃電演講',
    ]),
    rules: [
      '每場演講嚴格限時五分鐘。',
      '所有演講均須遵守大會行為準則。',
      `獲選講者請於 ${replyDeadline} 前回覆通知電郵，確認參加演講。`,
    ],
    participationTitle: '如何參加',
    participation: [
      {
        title: '當日填表報名',
        body: `請於 11 月 14 日 ${registrationOpen} 至 ${registrationClose} 填寫報名表，提供擬分享的題目及聯絡資料。`,
      },
      {
        title: '查看電郵並回覆確認',
        body: `議程團隊將於 ${notificationTime} 以電郵通知獲選講者。請於 ${replyDeadline} 前回覆該封電郵，確認參加演講。`,
      },
      {
        title: '報到並準備上台',
        body: `請於 ${checkInTime} 報到，準備在 ${talkStart}–${talkEnd} 的閃電演講時段進行五分鐘分享。`,
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
    scheduleTitle: '当日流程',
    allTimes: '2026 年 11 月 14 日 · 以下均为香港时间（UTC+8）。',
    registrationWindowNote: `报名仅于 2026 年 11 月 14 日 ${registrationOpen}–${registrationClose} 开放（香港时间，UTC+8）。`,
    scheduleRows: scheduleRows([
      '开始报名',
      '截止报名',
      '通过电子邮件通知入选讲者',
      '回复邮件确认参加的截止时间',
      '讲者签到',
      '闪电演讲',
    ]),
    rules: [
      '每场演讲严格限时五分钟。',
      '所有演讲均须遵守大会行为准则。',
      `入选讲者请于 ${replyDeadline} 前回复通知邮件，确认参加演讲。`,
    ],
    participationTitle: '如何参加',
    participation: [
      {
        title: '当天填表报名',
        body: `请于 11 月 14 日 ${registrationOpen} 至 ${registrationClose} 填写报名表，提供拟分享的题目及联系信息。`,
      },
      {
        title: '查看邮件并回复确认',
        body: `议程团队将于 ${notificationTime} 通过电子邮件通知入选讲者。请于 ${replyDeadline} 前回复该邮件，确认参加演讲。`,
      },
      {
        title: '签到并准备上台',
        body: `请于 ${checkInTime} 签到，准备在 ${talkStart}–${talkEnd} 的闪电演讲时段进行五分钟分享。`,
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
    scheduleTitle: '当日の流れ',
    allTimes: '2026年11月14日 · 時刻はすべて香港時間（UTC+8）です。',
    registrationWindowNote: `申込受付は2026年11月14日 ${registrationOpen}〜${registrationClose}（香港時間、UTC+8）のみです。`,
    scheduleRows: scheduleRows([
      '申込受付開始',
      '申込受付終了',
      '採用された方へメールで通知',
      '登壇確認メールの返信締切',
      '登壇者受付',
      'ライトニングトーク',
    ]),
    rules: [
      '発表は1件につき5分です。制限時間を守ってください。',
      'すべての発表でカンファレンスの行動規範を守ってください。',
      `採用された方は${replyDeadline}までに通知メールへ返信し、登壇する旨をお知らせください。`,
    ],
    participationTitle: '参加方法',
    participation: [
      {
        title: '当日に申し込む',
        body: `11月14日 ${registrationOpen}〜${registrationClose}に申込フォームから、発表したいテーマと連絡先をお送りください。`,
      },
      {
        title: 'メールを確認して返信する',
        body: `採用された方には、プログラムチームから${notificationTime}にメールでご連絡します。${replyDeadline}までにそのメールへ返信し、登壇する旨をお知らせください。`,
      },
      {
        title: '受付を済ませ、発表に備える',
        body: `${checkInTime}に登壇者受付へお越しください。${talkStart}〜${talkEnd}のライトニングトーク枠で、5分間の発表を行います。`,
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
    scheduleTitle: '당일 진행 일정',
    allTimes: '2026년 11월 14일 · 모든 시각은 홍콩 시간(UTC+8) 기준입니다.',
    registrationWindowNote: `신청은 2026년 11월 14일 ${registrationOpen}~${registrationClose}(홍콩 시간, UTC+8)에만 받습니다.`,
    scheduleRows: scheduleRows([
      '신청 시작',
      '신청 마감',
      '선정된 발표자에게 이메일 안내',
      '발표 확정 이메일 회신 마감',
      '발표자 체크인',
      '라이트닝 토크',
    ]),
    rules: [
      '각 발표는 5분 이내로 마쳐야 합니다.',
      '모든 발표는 컨퍼런스 행동 강령을 따라야 합니다.',
      `선정된 분은 ${replyDeadline}까지 안내 이메일에 회신하여 발표 참여를 확정해 주세요.`,
    ],
    participationTitle: '참여 방법',
    participation: [
      {
        title: '당일 신청하기',
        body: `11월 14일 ${registrationOpen}~${registrationClose}에 신청 양식으로 발표하고 싶은 주제와 연락처를 제출해 주세요.`,
      },
      {
        title: '이메일 확인 후 회신하기',
        body: `프로그램 팀이 ${notificationTime}에 선정된 발표자에게 이메일을 보냅니다. ${replyDeadline}까지 해당 이메일에 회신하여 발표 참여를 확정해 주세요.`,
      },
      {
        title: '체크인 후 발표 준비하기',
        body: `${checkInTime}에 발표자 체크인을 해 주세요. ${talkStart}~${talkEnd} 라이트닝 토크 시간에 5분 발표를 진행합니다.`,
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
