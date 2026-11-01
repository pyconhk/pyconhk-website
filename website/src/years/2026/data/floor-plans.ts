import type { CfpLocale } from '@/years/2026/locales';

type FloorPlanCopy = {
  title: string;
  intro: string;
  jumpLink: string;
  openImage: string;
  groundFloor: { title: string; description: string; alt: string };
  sixthFloor: { title: string; description: string; alt: string };
};

export const floorPlanCopy: Record<CfpLocale, FloorPlanCopy> = {
  en: {
    title: 'Floor plans',
    intro:
      'Find rooms and facilities using the maps below. Open the original image to zoom in.',
    jumpLink: 'View floor plans',
    openImage: 'Open full-size image',
    groundFloor: {
      title: 'Ground floor (G/F)',
      description:
        'VTC Auditorium, LW001–LW003, C004 (Day 2), sponsor booth, lift to 6/F, washrooms and water dispenser.',
      alt: 'Ground-floor venue map showing the VTC Auditorium, rooms, sponsor booth, lift, washrooms and water dispenser.',
    },
    sixthFloor: {
      title: 'Sixth floor (6/F)',
      description:
        'LW658: gift redemption · LW659: Job Board & PyShare · LW661: Poster Session · LW662: Booth Room.',
      alt: 'Sixth-floor venue map showing LW658 for gift redemption, LW659 for Job Board & PyShare, LW661 for the Poster Session and LW662 as the Booth Room.',
    },
  },
  'zh-hk': {
    title: '會場平面圖',
    intro: '可以用下面嘅平面圖搵課室同設施；開啟原圖就可以放大睇。',
    jumpLink: '睇會場平面圖',
    openImage: '開啟原圖放大睇',
    groundFloor: {
      title: '地下（G/F）',
      description:
        'VTC Auditorium、LW001–LW003、C004（第二日）、贊助商攤位、去 6/F 嘅升降機、洗手間同飲水機。',
      alt: '地下會場平面圖，標示 VTC Auditorium、課室、贊助商攤位、升降機、洗手間同飲水機。',
    },
    sixthFloor: {
      title: '六樓（6/F）',
      description:
        'LW658：禮品換領 · LW659：Job Board 同 PyShare · LW661：Poster Session · LW662：Booth Room。',
      alt: '六樓會場平面圖，標示 LW658 禮品換領、LW659 Job Board 同 PyShare、LW661 Poster Session 同 LW662 Booth Room。',
    },
  },
  'zh-hant': {
    title: '會場平面圖',
    intro: '以下平面圖可協助您尋找課室及設施。開啟原圖即可放大查看。',
    jumpLink: '查看會場平面圖',
    openImage: '開啟全尺寸圖片',
    groundFloor: {
      title: '地下（G/F）',
      description:
        'VTC Auditorium、LW001–LW003、C004（第二天）、贊助商攤位、前往 6/F 的升降機、洗手間及飲水機。',
      alt: '地下會場平面圖，標示 VTC Auditorium、課室、贊助商攤位、升降機、洗手間及飲水機。',
    },
    sixthFloor: {
      title: '六樓（6/F）',
      description:
        'LW658：禮品換領 · LW659：Job Board 與 PyShare · LW661：Poster Session · LW662：Booth Room。',
      alt: '六樓會場平面圖，標示 LW658 禮品換領、LW659 Job Board 與 PyShare、LW661 Poster Session 及 LW662 Booth Room。',
    },
  },
  'zh-hans': {
    title: '会场平面图',
    intro: '以下平面图可帮助您查找教室及设施。打开原图即可放大查看。',
    jumpLink: '查看会场平面图',
    openImage: '打开完整尺寸图片',
    groundFloor: {
      title: '地面层（G/F）',
      description:
        'VTC Auditorium、LW001–LW003、C004（第二天）、赞助商展位、前往 6/F 的电梯、洗手间及饮水机。',
      alt: '地面层会场平面图，标示 VTC Auditorium、教室、赞助商展位、电梯、洗手间及饮水机。',
    },
    sixthFloor: {
      title: '六楼（6/F）',
      description:
        'LW658：礼品领取 · LW659：Job Board 与 PyShare · LW661：Poster Session · LW662：Booth Room。',
      alt: '六楼会场平面图，标示 LW658 礼品领取、LW659 Job Board 与 PyShare、LW661 Poster Session 及 LW662 Booth Room。',
    },
  },
  ja: {
    title: '会場フロアマップ',
    intro:
      '下のフロアマップで教室や設備の場所をご確認ください。元の画像を開くと拡大できます。',
    jumpLink: 'フロアマップを見る',
    openImage: '元のサイズの画像を開く',
    groundFloor: {
      title: '地上階（G/F）',
      description:
        'VTC Auditorium、LW001〜LW003、C004（2日目）、スポンサーブース、6/F 行きエレベーター、トイレ、給水機。',
      alt: 'VTC Auditorium、各教室、スポンサーブース、エレベーター、トイレ、給水機を示す地上階の会場マップ。',
    },
    sixthFloor: {
      title: '6階（6/F）',
      description:
        'LW658：ギフト引換 · LW659：Job Board & PyShare · LW661：Poster Session · LW662：Booth Room。',
      alt: 'LW658 のギフト引換、LW659 の Job Board & PyShare、LW661 の Poster Session、LW662 の Booth Room を示す6階の会場マップ。',
    },
  },
  ko: {
    title: '행사장 층별 안내도',
    intro:
      '아래 안내도로 강의실과 시설의 위치를 확인하세요. 원본 이미지를 열면 확대해서 볼 수 있습니다.',
    jumpLink: '층별 안내도 보기',
    openImage: '원본 크기 이미지 열기',
    groundFloor: {
      title: '지상층 (G/F)',
      description:
        'VTC Auditorium, LW001–LW003, C004(둘째 날), 후원사 부스, 6/F행 엘리베이터, 화장실 및 정수기.',
      alt: 'VTC Auditorium, 강의실, 후원사 부스, 엘리베이터, 화장실 및 정수기가 표시된 지상층 행사장 안내도.',
    },
    sixthFloor: {
      title: '6층 (6/F)',
      description:
        'LW658: 기념품 수령 · LW659: Job Board & PyShare · LW661: Poster Session · LW662: Booth Room.',
      alt: 'LW658 기념품 수령, LW659 Job Board & PyShare, LW661 Poster Session 및 LW662 Booth Room이 표시된 6층 행사장 안내도.',
    },
  },
};
