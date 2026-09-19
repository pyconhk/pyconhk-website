export type ChineseLocale = 'zh-hant' | 'zh-hk';

// Shared interface terms, written separately for each audience. These are looked
// up by meaning; they are never applied as replacements to sentences or names.
export const chineseTerms = {
  viewMap: { 'zh-hant': '查看地圖', 'zh-hk': '睇地圖' },
  viewSponsors: { 'zh-hant': '查看所有贊助夥伴', 'zh-hk': '睇晒贊助夥伴' },
  contactUs: { 'zh-hant': '聯絡我們', 'zh-hk': '聯絡我哋' },
  calendar: { 'zh-hant': '加入行事曆', 'zh-hk': '加入日曆' },
  volunteers: { 'zh-hant': '義工團隊', 'zh-hk': '義工團隊' },
  news: { 'zh-hant': '最新消息', 'zh-hk': '最新消息' },
  allNews: { 'zh-hant': '所有消息', 'zh-hk': '睇晒消息' },
  readArticle: { 'zh-hant': '閱讀文章', 'zh-hk': '睇文章' },
  backToNews: { 'zh-hant': '返回最新消息', 'zh-hk': '返去最新消息' },
  register: { 'zh-hant': '立即報名', 'zh-hk': '即刻報名' },
  visitWebsite: { 'zh-hant': '瀏覽網站', 'zh-hk': '去網站睇吓' },
  programme: { 'zh-hant': '大會議程', 'zh-hk': '大會議程' },
  sponsors: { 'zh-hant': '贊助夥伴', 'zh-hk': '贊助夥伴' },
  speakers: { 'zh-hant': '講者', 'zh-hk': '講者' },
  featuredSpeakers: { 'zh-hant': '精選講者', 'zh-hk': '精選講者' },
  aboutUs: { 'zh-hant': '關於我們', 'zh-hk': '關於我哋' },
  aboutConference: { 'zh-hant': '關於大會', 'zh-hk': '關於大會' },
  venue: { 'zh-hant': '活動場地', 'zh-hk': '活動場地' },
  accessGuide: { 'zh-hant': '交通指南', 'zh-hk': '交通指南' },
  cateringGuide: { 'zh-hant': '餐飲指南', 'zh-hk': '餐飲指南' },
  sprint: { 'zh-hant': '衝刺開發', 'zh-hk': '衝刺開發' },
  sprintDay: { 'zh-hant': '衝刺開發日', 'zh-hk': '衝刺開發日' },
  sprintQa: { 'zh-hant': '衝刺開發常見問題', 'zh-hk': '衝刺開發常見問題' },
  organizingTeam: { 'zh-hant': '籌辦團隊', 'zh-hk': '籌辦團隊' },
  organizers: { 'zh-hant': '主辦單位', 'zh-hk': '主辦單位' },
  patrons: { 'zh-hant': '個人贊助', 'zh-hk': '個人贊助' },
  sponsorships: { 'zh-hant': '贊助合作', 'zh-hk': '贊助合作' },
  sponsorshipOpportunities: { 'zh-hant': '贊助機會', 'zh-hk': '贊助機會' },
  communities: { 'zh-hant': '社群夥伴', 'zh-hk': '社群夥伴' },
  conference: { 'zh-hant': '會議資訊', 'zh-hk': '會議資訊' },
  menuLabel: { 'zh-hant': '開啟導覽選單', 'zh-hk': '打開選單' },
  closeMenu: { 'zh-hant': '關閉導覽選單', 'zh-hk': '閂埋選單' },
  comingSoon: { 'zh-hant': '詳情即將公布。', 'zh-hk': '詳情好快會公布。' },
  ticketsSoon: { 'zh-hant': '門票資訊即將公布', 'zh-hk': '門票詳情好快公布' },
  directions: { 'zh-hant': '前往會場', 'zh-hk': '點去會場' },
  sponsorshipEnquiries: { 'zh-hant': '查詢贊助合作', 'zh-hk': '查詢贊助合作' },
  clearFilters: { 'zh-hant': '清除篩選', 'zh-hk': '清除篩選' },
  sessionDetails: { 'zh-hant': '場次詳情', 'zh-hk': '場次詳情' },
  close: { 'zh-hant': '關閉', 'zh-hk': '閂埋' },
  allRooms: { 'zh-hant': '所有房間', 'zh-hk': '所有房間' },
  allLanguages: { 'zh-hant': '所有語言', 'zh-hk': '所有語言' },
  savedTalks: { 'zh-hant': '已儲存講座', 'zh-hk': '已儲存講座' },
  saveTalk: { 'zh-hant': '儲存講座', 'zh-hk': '儲低講座' },
  removeSavedTalk: { 'zh-hant': '取消儲存', 'zh-hk': '取消儲存' },
  speakerSessions: { 'zh-hant': '講者場次', 'zh-hk': '講者嘅場次' },
  backToSchedule: { 'zh-hant': '返回議程', 'zh-hk': '返去議程' },
  aboutSession: { 'zh-hant': '場次介紹', 'zh-hk': '場次介紹' },
  aboutSpeaker: { 'zh-hant': '講者介紹', 'zh-hk': '講者介紹' },
  room: { 'zh-hant': '房間', 'zh-hk': '房間' },
  time: { 'zh-hant': '時間', 'zh-hk': '時間' },
  minutes: { 'zh-hant': '分鐘', 'zh-hk': '分鐘' },
  followUs: { 'zh-hant': '追蹤我們', 'zh-hk': '追蹤我哋' },
  history: { 'zh-hant': '歷屆大會', 'zh-hk': '歷屆大會' },
  viewTalk: { 'zh-hant': '查看講座', 'zh-hk': '睇講座' },
  appearance: { 'zh-hant': '顯示模式', 'zh-hk': '顯示模式' },
  system: { 'zh-hant': '跟隨系統', 'zh-hk': '跟系統' },
  light: { 'zh-hant': '淺色', 'zh-hk': '淺色' },
  dark: { 'zh-hant': '深色', 'zh-hk': '深色' },
  next: { 'zh-hant': '切換至', 'zh-hk': '轉做' },
} as const satisfies Record<string, Record<ChineseLocale, string>>;

type ChineseTermMessages<Locale extends ChineseLocale> = {
  readonly [Key in keyof typeof chineseTerms]: (typeof chineseTerms)[Key][Locale];
};

export function getChineseTerms<Locale extends ChineseLocale>(
  locale: Locale
): ChineseTermMessages<Locale> {
  return Object.fromEntries(
    Object.entries(chineseTerms).map(([key, translations]) => [
      key,
      translations[locale],
    ])
  ) as ChineseTermMessages<Locale>;
}

// Editorial examples only: whole sentences still need to be written and reviewed
// in context. Never run these pairs over CMS prose, proper names, policies or talks.
export const chineseEditorialPairs = [
  { written: '的', cantonese: '嘅', example: ['大會的議程', '大會嘅議程'] },
  { written: '我們', cantonese: '我哋', example: ['聯絡我們', '聯絡我哋'] },
  {
    written: '沒有',
    cantonese: '冇',
    example: ['沒有符合條件的場次', '冇符合條件嘅場次'],
  },
  { written: '在', cantonese: '喺', example: ['在此查看', '喺呢度睇'] },
  { written: '給', cantonese: '畀', example: ['留給參加者', '留畀參加者'] },
] as const;
