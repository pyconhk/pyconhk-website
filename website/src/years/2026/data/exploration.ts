import type { CfpLocale } from '@/years/2026/locales';

export type ExplorationDestination =
  | 'schedule'
  | 'floor-plans'
  | 'access-guide'
  | 'catering-guide'
  | 'booth-stamp-journey'
  | 'lightning-talks'
  | 'job-board'
  | 'pyshare'
  | 'sprint';

type ExplorationCopy = {
  title: string;
  navLabel: string;
  intro: string;
  planTitle: string;
  joinTitle: string;
  descriptions: Record<ExplorationDestination, string>;
};

export const explorationCopy: Record<CfpLocale, ExplorationCopy> = {
  en: {
    title: 'Conference Exploration',
    navLabel: 'Conference Exploration',
    intro: 'Find your way around PyCon HK and discover ways to take part.',
    planTitle: 'Plan your visit',
    joinTitle: 'Join in',
    descriptions: {
      schedule:
        'Browse the talks, session times and rooms to plan your conference day.',
      'floor-plans': 'Find rooms and facilities on the ground floor and sixth floor.',
      'access-guide': 'Plan your journey with MTR, bus and taxi directions.',
      'catering-guide': 'Browse nearby dining options and food information.',
      'booth-stamp-journey':
        'Explore booths and poster sessions, collect 6 stamps and visit gift redemption in LW658 (6/F).',
      'lightning-talks':
        'Share an idea in five minutes. Read how to sign up and prepare.',
      'job-board':
        'Share a job or internship opportunity, or find your next connection in LW659 (6/F).',
      pyshare:
        'Leave a thought, share a dream and read community messages in LW659 (6/F).',
      sprint:
        'Collaborate on Python and open-source projects. See how to prepare and register.',
    },
  },
  'zh-hk': {
    title: 'Conference Exploration',
    navLabel: 'Conference Exploration',
    intro: '搵齊 PyCon HK 會場資訊，再睇吓有咩活動可以一齊參加。',
    planTitle: '準備嚟會場',
    joinTitle: '一齊參與',
    descriptions: {
      schedule: '睇演講、時段同課室，安排你嘅大會行程。',
      'floor-plans': '睇地下同六樓平面圖，搵課室同會場設施。',
      'access-guide': '睇港鐵、巴士同的士交通資訊，計劃點樣嚟。',
      'catering-guide': '睇附近有咩食，同埋相關餐飲資訊。',
      'booth-stamp-journey': '行吓攤位同海報展示，集齊 6 個印，去六樓 LW658 換禮品。',
      'lightning-talks': '用五分鐘分享一個諗法，了解點報名同準備。',
      'job-board': '喺六樓 LW659 分享工作或實習機會，認識你嘅下一位隊友。',
      pyshare: '喺六樓 LW659 留低一個諗法、分享一個夢想，睇吓社群嘅心聲。',
      sprint: '一齊參與 Python 同開源項目，了解點準備同報名。',
    },
  },
  'zh-hant': {
    title: 'Conference Exploration',
    navLabel: 'Conference Exploration',
    intro: '查閱 PyCon HK 會場資訊，探索不同的參與方式。',
    planTitle: '規劃行程',
    joinTitle: '參與活動',
    descriptions: {
      schedule: '瀏覽演講、時段及課室資訊，規劃您的大會行程。',
      'floor-plans': '查看地下及六樓平面圖，尋找課室與會場設施。',
      'access-guide': '查閱港鐵、巴士及的士交通資訊，規劃前往會場的路線。',
      'catering-guide': '瀏覽附近用餐選擇及餐飲資訊。',
      'booth-stamp-journey':
        '參觀攤位及海報展示，集齊 6 個印章，到六樓 LW658 換領禮品。',
      'lightning-talks': '用五分鐘分享一個想法，了解報名與準備方式。',
      'job-board': '在六樓 LW659 分享工作或實習機會，建立新的職涯連繫。',
      pyshare: '在六樓 LW659 留下想法、分享夢想，閱讀社群成員的心聲。',
      sprint: '協作開發 Python 與開源專案，了解準備與報名方式。',
    },
  },
  'zh-hans': {
    title: 'Conference Exploration',
    navLabel: 'Conference Exploration',
    intro: '查阅 PyCon HK 会场信息，探索不同的参与方式。',
    planTitle: '规划行程',
    joinTitle: '参与活动',
    descriptions: {
      schedule: '浏览演讲、时段及教室信息，规划您的大会行程。',
      'floor-plans': '查看地面层及六楼平面图，寻找教室与会场设施。',
      'access-guide': '查阅港铁、巴士及出租车交通信息，规划前往会场的路线。',
      'catering-guide': '浏览附近用餐选择及餐饮信息。',
      'booth-stamp-journey':
        '参观展位及海报展示，集齐 6 个印章，到六楼 LW658 领取礼品。',
      'lightning-talks': '用五分钟分享一个想法，了解报名与准备方式。',
      'job-board': '在六楼 LW659 分享工作或实习机会，建立新的职业联系。',
      pyshare: '在六楼 LW659 留下想法、分享梦想，阅读社区成员的心声。',
      sprint: '协作开发 Python 与开源项目，了解准备与报名方式。',
    },
  },
  ja: {
    title: 'Conference Exploration',
    navLabel: 'Conference Exploration',
    intro: 'PyCon HK の会場情報や、参加できるアクティビティをご紹介します。',
    planTitle: '来場の準備',
    joinTitle: '参加しよう',
    descriptions: {
      schedule: 'トーク、時間、会場を確認して、当日の参加予定を立てましょう。',
      'floor-plans': '地上階と6階のマップで教室や設備の場所を確認できます。',
      'access-guide': 'MTR、バス、タクシーでの会場への行き方をご案内します。',
      'catering-guide': '会場周辺の飲食店や食事に関する情報を確認できます。',
      'booth-stamp-journey':
        'ブースやポスター発表を巡り、スタンプ6個を集めて6階 LW658 のギフト引換へ。',
      'lightning-talks':
        '5分間でアイデアを共有。申込方法や準備のポイントをご案内します。',
      'job-board':
        '6階 LW659 で求人やインターンシップの情報を共有し、新たなつながりを見つけましょう。',
      pyshare:
        '6階 LW659 で考えや夢を書き残し、コミュニティのメッセージを読んでみましょう。',
      sprint:
        'Python やオープンソースのプロジェクトで協力。準備や登録の方法をご案内します。',
    },
  },
  ko: {
    title: 'Conference Exploration',
    navLabel: 'Conference Exploration',
    intro: 'PyCon HK 행사장 정보와 함께 참여할 수 있는 활동을 살펴보세요.',
    planTitle: '방문 준비',
    joinTitle: '함께 참여하기',
    descriptions: {
      schedule: '발표, 시간, 강의실을 확인하고 컨퍼런스 일정을 계획하세요.',
      'floor-plans': '지상층과 6층 안내도에서 강의실과 시설의 위치를 확인하세요.',
      'access-guide': 'MTR, 버스, 택시로 행사장에 오는 방법을 확인하세요.',
      'catering-guide': '행사장 주변 식당과 식사 정보를 살펴보세요.',
      'booth-stamp-journey':
        '부스와 포스터 세션에서 스탬프 6개를 모아 6층 LW658의 기념품 수령처를 방문하세요.',
      'lightning-talks':
        '5분 동안 아이디어를 나눠 보세요. 신청과 준비 방법을 안내합니다.',
      'job-board':
        '6층 LW659에서 채용이나 인턴십 기회를 공유하고 새로운 인연을 찾아보세요.',
      pyshare: '6층 LW659에서 생각과 꿈을 남기고 커뮤니티의 이야기를 읽어 보세요.',
      sprint:
        'Python과 오픈 소스 프로젝트에 함께 기여하세요. 준비와 등록 방법을 안내합니다.',
    },
  },
};
