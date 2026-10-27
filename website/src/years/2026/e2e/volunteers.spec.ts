import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const marketingHeadings = {
  en: 'Marketing',
  'zh-hk': '市場推廣',
  'zh-hant': '市場推廣',
  'zh-hans': '市场推广',
  ja: 'マーケティング',
  ko: '마케팅',
};

const onSiteHeadings = {
  en: 'On-site Volunteers',
  'zh-hk': '大會現場義工',
  'zh-hant': '大會現場義工',
  'zh-hans': '大会现场志愿者',
  ja: '当日運営ボランティア',
  ko: '현장 운영 자원봉사자',
};

const programmeHeadings = {
  en: 'Programme Team',
  'zh-hk': '議程團隊',
  'zh-hant': '議程團隊',
  'zh-hans': '议程团队',
  ja: 'プログラムチーム',
  ko: '프로그램팀',
};

const reviewerHeadings = {
  en: 'Proposal Reviewers',
  'zh-hk': '投稿審稿人',
  'zh-hant': '投稿審稿人',
  'zh-hans': '投稿审稿人',
  ja: '発表提案のレビュアー',
  ko: '발표 제안 심사위원',
};

const programmeNames = [
  'Mr. Alex Au',
  'Mr. Adrian Tam',
  'Ms. Cintia Ching',
  'Mr. Scotty Kwok',
  'Mr. Tommy Han',
  'Ming Tou',
  'Jim Ngoo',
  'Harry Ho',
  'Luciano Scarpulla',
];

const reviewerNames = [
  '(James) Kanin Kearpimy',
  'Alex Au',
  'Allen Wyma',
  'Amanda So',
  'Anastasia Yip',
  'Calpa',
  'Calvin Tsang',
  'Cheuk Ting Ho',
  'Cintia Ching',
  'Claire Chung',
  'Adrian Tam',
  'Harry Ho',
  'Henry, Wai Yin Wong',
  'Ho Wa Wong',
  'Ismail Sunni',
  'Jim Ngoo',
  'Kirill Pavlov',
  'Kit Yeung',
  'Luciano Scarpulla',
  'Matthew Yuen',
  'Ming Tou',
  'Paul Kuok',
  'Sammy Fung',
  'Scotty Kwok',
  'Tommy Han',
  'Winnie Yeung',
  'Wright C',
];

const onSiteNames = [
  'Amy Li',
  'Kingman Leung',
  'Alex Chang',
  'Peggy C',
  'Ho Ming Li',
  'Alan Chu',
  'Kapo Leung',
  'Tim Ching',
  'Keto',
  'Sam Lau',
  'Tim Tan',
  'Ronald (Hamsterthon)',
  'Ronald (OSHK)',
  'Brisson Lam',
  'Ivan',
  'Nicole',
  'Anna Law',
  'Quincy Chan',
  'Ken Wong',
  'Mitch Chan',
  'Kelly Wong',
  'Tina Fung',
  'Mimi Kwok',
  'Starry Chau',
  'Ricardo',
  'Tommy',
  'Anthony Wong',
  'Megand Chiu',
  'Sienna Chung',
  'Cyrus Wong',
  'YAO Ka Chun',
  'HUANG Zhipeng',
  'WONG Wing Ho',
  'CHAN Cheuk Man Jimmy',
  'CHAN Yin Fung',
  'Ho Chun Hin',
  'CHUI Kin Keung Kenny',
  'YUEN King Hin',
  'CHAN Ka Ming',
  'CHEN Fengyi',
  'DAI RUIRAN',
  'HE HAOYU',
  'LUO ERJIE',
  'ZHANG Junning',
  'ZHANG Xuan',
];

const profiles = [
  ['Jackson Chan', 'https://www.linkedin.com/in/jacksonchanhongkong/'],
  ['Coby Lam', 'https://www.linkedin.com/in/shun-hang-lam-62097431b'],
  ['Sophia Wong', 'https://www.linkedin.com/in/sophia-wong-digital/'],
];
const profileLabels: Record<string, [string, string]> = {
  en: ['LinkedIn profile of {name}', 'Personal website of {name}'],
  'zh-hk': ['{name} 嘅 LinkedIn 個人檔案', '{name} 嘅個人網站'],
  'zh-hant': ['{name} 的 LinkedIn 個人檔案', '{name} 的個人網站'],
  'zh-hans': ['{name} 的 LinkedIn 个人资料', '{name} 的个人网站'],
  ja: ['{name} の LinkedIn プロフィール', '{name} の個人ウェブサイト'],
  ko: ['{name}의 LinkedIn 프로필', '{name}의 개인 웹사이트'],
};

for (const [locale, heading] of Object.entries(marketingHeadings)) {
  test(`Marketing volunteers have their supplied photos and links in ${locale}`, async ({
    page,
  }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`/2026/${locale}/volunteers/`);
      expect(response?.status()).toBe(200);
      const group = page.locator('[data-volunteer-group]').filter({
        has: page.getByRole('heading', { name: heading, exact: true }),
      });
      await expect(group).toHaveCount(1);
      await expect(group.locator('[data-person-card]')).toHaveCount(3);
      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        for (const [name, url] of profiles) {
          const card = group.locator('[data-person-card]').filter({
            has: page.getByRole('heading', { name, exact: true }),
          });
          await expect(card).toHaveCount(1);
          const image = card.getByRole('img', { name, exact: true });
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element: HTMLImageElement) => element.decode());
          await expect(image).toBeVisible();
          const label = profileLabels[locale][0].replace('{name}', name);
          const link = card.getByRole('link', { name: label, exact: true });
          await expect(link).toHaveAttribute('href', url);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          await expect(link).toHaveAttribute('title', label);
        }
        const websiteLabel = profileLabels[locale][1].replace(
          '{name}',
          'Ms. Daisy Maris Fung'
        );
        const personalWebsite = page.getByRole('link', {
          name: websiteLabel,
          exact: true,
        });
        await expect(personalWebsite).toHaveAttribute(
          'href',
          'https://www.daisymarisfung.com/'
        );
        await expect(personalWebsite).toHaveAttribute('title', websiteLabel);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
        ).toBe(true);
      }
    }
  });
}

for (const locale of Object.keys(
  marketingHeadings
) as (keyof typeof marketingHeadings)[]) {
  test(`Active volunteer roster is complete without invented portraits in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/2026/${locale}/volunteers/`);
    const roster = page.locator('[data-conference-content="people"]');
    await expect(roster.locator('[data-person-card]')).toHaveCount(101);
    const nameOnlyCards = roster.locator('[data-person-card][data-portrait="false"]');
    await expect(nameOnlyCards.locator('img')).toHaveCount(0);
    await expect(roster.locator('img[src*="placeholder"]')).toHaveCount(0);
    const onsite = roster.locator('[data-volunteer-group]').filter({
      has: page.getByRole('heading', { name: onSiteHeadings[locale], exact: true }),
    });
    await expect(onsite).toHaveCount(1);
    await expect(onsite.locator('[data-person-card]')).toHaveCount(45);
    expect(
      (await onsite.locator('[data-person-card] h4').allTextContents()).sort()
    ).toEqual([...onSiteNames].sort());
    const programme = roster.locator('[data-volunteer-group]').filter({
      has: page.getByRole('heading', { name: programmeHeadings[locale], exact: true }),
    });
    await expect(programme).toHaveCount(1);
    await expect(programme.locator('[data-person-card]')).toHaveCount(9);
    expect(
      (await programme.locator('[data-person-card] h4').allTextContents()).sort()
    ).toEqual([...programmeNames].sort());
    const reviewers = roster.locator('[data-volunteer-group]').filter({
      has: page.getByRole('heading', { name: reviewerHeadings[locale], exact: true }),
    });
    await expect(reviewers).toHaveCount(1);
    await expect(reviewers.locator('[data-person-card]')).toHaveCount(27);
    expect(
      (await reviewers.locator('[data-person-card] h4').allTextContents())
        .map((name) => name.replace(/^(?:Mr|Ms)\.\s+/, ''))
        .sort()
    ).toEqual([...reviewerNames].sort());
    await expect(
      roster.getByRole('heading', { name: /CityU|HKIIT|城大|香港城市|홍콩시립/ })
    ).toHaveCount(0);
    for (const name of [
      'Alan Chu',
      'Kapo Leung',
      'Kelly Wong',
      'Rainbow Cheng',
      'Harry Ho',
      'Jim Ngoo',
      'Ming Tou',
      '(James) Kanin Kearpimy',
      'Calpa',
      'Ismail Sunni',
      'Matthew Yuen',
      'Cheuk Ting Ho',
      'Kirill Pavlov',
      'Winnie Yeung',
      'Henry, Wai Yin Wong',
      'Sammy Fung',
      'Ms. Cathy Hui',
      'Luciano Scarpulla',
      'Allen Wyma',
      'Amanda So',
      'Claire Chung',
      'Ho Wa Wong',
      'Kit Yeung',
      'Wright C',
      'Jared',
      'Amy Li',
      'Alex Chang',
      'Ho Ming Li',
      'Tim Ching',
      'Nicole',
      'Anna Law',
      'Quincy Chan',
      'Ken Wong',
      'Cyrus Wong',
    ]) {
      const portrait = roster.getByRole('img', { name, exact: true }).first();
      await portrait.scrollIntoViewIfNeeded();
      await portrait.evaluate((image: HTMLImageElement) => image.decode());
      await expect(portrait).toBeVisible();
      expect(
        new URL((await portrait.getAttribute('src')) ?? '', page.url()).origin
      ).toBe(new URL(page.url()).origin);
    }
    for (const name of [
      'Ronald (Hamsterthon)',
      'Ronald (OSHK)',
      'Brisson Lam',
      'Tim Tan',
      'Jared',
      'Rainbow Cheng',
      'Cyrus Wong',
      'CHEN Fengyi',
    ]) {
      await expect(
        roster.getByRole('heading', { name, exact: true }).first()
      ).toBeVisible();
    }
    for (const name of ['Clara Chan', 'Katrina', 'Magnus Law']) {
      await expect(roster.getByRole('heading', { name, exact: true })).toHaveCount(0);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  });
}
