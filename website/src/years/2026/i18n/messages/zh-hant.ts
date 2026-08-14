import type { HomeMessages } from '@/years/2026/i18n/schema';
import { zhHk } from './zh-hk';

export const zhHant: HomeMessages = {
  ...zhHk,
  meta: {
    title: 'PyCon HK 2026 | Ride and Leverage with AI 乘風破浪 智領未來',
    description:
      '香港 Python 年會 PyCon HK 2026 — 匯聚 Python 社群、創新思維與開源力量，在香港核心啟動技術盛會。',
  },
  hongKongThread: {
    ...zhHk.hongKongThread,
    title: '屬於香港的獨特節奏',
    description:
      '紅白藍膠袋圖案是香港人熟知的文化標誌 —— 實用、堅韌，正如每條交織的經緯線讓結構更為強大，正是我們 Python 社群的最佳寫照。',
  },
};
