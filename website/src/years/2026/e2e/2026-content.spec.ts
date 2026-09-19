import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const locales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'];
const pendingRoutes = ['catering-guide', 'sprint', 'sprint/qna'];

const publishedRoutes = [
  'access-guide',
  'sponsorships',
  'sponsorships/patrons',
  'about',
  'organizers',
  'supporting-organizations',
  'volunteers',
];

test('meeting updates expose confirmed content and keep unavailable patron forms inactive', async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(`/2026/${locale}/supporting-organizations/`);
    const supporters = page.locator('[data-conference-content="supporters"]');
    await expect(
      supporters.getByRole('heading', { name: 'HKU Computer Science Association' })
    ).toBeVisible();
    await expect(supporters).not.toContainText('City University');
    await expect(supporters.locator('p:not([lang="en"])')).toHaveCount(0);
    for (const href of [
      'https://www.meetup.com/producttank-hong-kong/',
      'https://pyladies.kr/en/',
      'https://wtmhk.org/',
    ]) {
      expect(await supporters.locator(`a[href="${href}"]`).count()).toBeGreaterThan(0);
    }
    await page.goto(`/2026/${locale}/sponsorships/patrons/`);
    await expect(page.locator('[data-conference-content="patrons"] li')).toHaveCount(4);
    await expect(page.locator('[data-patron-form-pending]')).toBeVisible();
    await expect(page.locator('[data-patron-application]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('[Name]');
    await page.goto(`/2026/${locale}/sponsorships/`);
    const sponsors = page.locator('[data-conference-content="sponsors"]');
    for (const name of ['Navicat', 'JetBrains', 'LIHKG'])
      await expect(sponsors.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(
      sponsors.getByRole('heading', { name: 'CaLoMei Studio', exact: true })
    ).toHaveCount(2);
    await expect(sponsors).not.toContainText('Apify');
    await page.goto(`/2026/${locale}/access-guide/`);
    await expect(page.locator('[data-conference-content="venue"]')).toContainText(
      'HKIIT'
    );
  }
});

for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
  test(`visible supporter artwork stays centered at ${width}px in both themes`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/supporting-organizations/');
    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      await expect(page.locator('html')).toHaveAttribute(
        'data-conference-theme',
        theme
      );
      const logos = page.locator('[data-logo-frame] img');
      expect(await logos.count()).toBeGreaterThan(0);
      for (const logo of await logos.all()) {
        await logo.scrollIntoViewIfNeeded();
        const visible = await logo.evaluate(async (image: HTMLImageElement) => {
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas unavailable');
          context.drawImage(image, 0, 0);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let left = canvas.width;
          let top = canvas.height;
          let right = -1;
          let bottom = -1;
          let whitePixels = 0;
          const centerDarkArtwork = image.src.endsWith('/pyladies_tokyo.webp');
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const pixel = (y * canvas.width + x) * 4;
              // Inspect the clearly visible mark, independently of its CSS frame.
              if (pixels[pixel + 3] < 128) continue;
              if (Math.min(pixels[pixel], pixels[pixel + 1], pixels[pixel + 2]) > 230)
                whitePixels++;
              // Tokyo's original composition centers its wordmark and face;
              // the decorative white petals intentionally extend to the left.
              if (
                centerDarkArtwork &&
                Math.min(pixels[pixel], pixels[pixel + 1], pixels[pixel + 2]) > 180
              )
                continue;
              left = Math.min(left, x);
              top = Math.min(top, y);
              right = Math.max(right, x);
              bottom = Math.max(bottom, y);
            }
          }
          const rect = image.getBoundingClientRect();
          const plateElement = image.closest('.organization-logo-plate');
          if (!plateElement) throw new Error('Logo plate missing');
          const plate = plateElement.getBoundingClientRect();
          const frame = image.parentElement?.getBoundingClientRect();
          if (!frame) throw new Error('Logo frame missing');
          const centerX = rect.x + ((left + right + 1) / 2 / canvas.width) * rect.width;
          const centerY =
            rect.y + ((top + bottom + 1) / 2 / canvas.height) * rect.height;
          return {
            name: image.alt,
            file: new URL(image.src).pathname.split('/').pop(),
            background: getComputedStyle(plateElement).backgroundColor,
            backgroundImage: getComputedStyle(plateElement).backgroundImage,
            whiteCoverage: whitePixels / (canvas.width * canvas.height),
            hasArtwork: right >= left,
            offsetX: Math.abs(centerX - (plate.x + plate.width / 2)),
            offsetY: Math.abs(centerY - (plate.y + plate.height / 2)),
            contained: frame.left >= plate.left && frame.right <= plate.right,
          };
        });
        expect(visible.hasArtwork, visible.name).toBe(true);
        if (visible.file === 'DimSumLab.webp')
          expect(
            visible.whiteCoverage,
            'Dim Sum Labs retains its white artwork'
          ).toBeGreaterThan(0.2);
        if (visible.file === 'pyladies_tokyo.webp') {
          expect(visible.backgroundImage).toBe(
            'linear-gradient(rgb(248, 200, 202), rgb(255, 213, 212))'
          );
        } else {
          const backgrounds: Record<string, string> = {
            'hku-csa.png': 'rgb(0, 0, 0)',
            'codeaholics.webp': 'rgb(0, 0, 0)',
            'DimSumLab.webp': 'rgb(225, 31, 48)',
          };
          expect(visible.background, `${visible.name}: ${theme}`).toBe(
            backgrounds[visible.file ?? ''] ?? 'rgb(255, 255, 255)'
          );
        }
        expect(visible.contained, visible.name).toBe(true);
        expect(visible.offsetX, `${visible.name}: ${width} ${theme}`).toBeLessThan(4);
        expect(visible.offsetY, `${visible.name}: ${width} ${theme}`).toBeLessThan(4);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
  });
}

test('wide supporter logos fill their plates and OSHK stays square', async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/supporting-organizations/');
    for (const file of ['aws_ug_hk.svg', 'hkace.webp']) {
      const logo = page.locator(`img[src$="${file}"]`);
      await logo.scrollIntoViewIfNeeded();
      await logo.evaluate((image: HTMLImageElement) => image.decode());
      const frame = await logo.locator('..').boundingBox();
      const plate = await logo.locator('../..').boundingBox();
      if (!frame || !plate) throw new Error(`Logo plate is missing: ${file}`);
      expect(frame.width).toBeGreaterThan(plate.width * 0.7);
      expect(frame.width / frame.height).toBeGreaterThan(2);
    }
    await page.goto('/2026/en/organizers/');
    const oshk = page.locator('img[src$="/oshk.webp"]');
    await oshk.scrollIntoViewIfNeeded();
    await oshk.evaluate((image: HTMLImageElement) => image.decode());
    expect(
      await oshk.evaluate(
        (image: HTMLImageElement) => image.naturalWidth / image.naturalHeight
      )
    ).toBe(1);
    const plate = await oshk.locator('..').boundingBox();
    if (!plate) throw new Error('OSHK logo plate is missing');
    expect(Math.abs(plate.width - plate.height)).toBeLessThan(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  }
});

test('every conference logo and placeholder has a transparent image background', async ({
  page,
}) => {
  const sources = new Set<string>([
    '/2026/logos/pyconlogo.png',
    '/2026/logos/pyconlogo.svg',
    '/2026/logos/horse-mark.svg',
    '/2026/logos/logo.png',
    '/2026/logos/logo2.png',
    '/2026/organizers-volunteers/volunteers/placeholder.webp',
  ]);
  for (const route of ['organizers', 'supporting-organizations']) {
    await page.goto(`/2026/en/${route}/`);
    for (const src of await page
      .locator('[data-conference-content] img')
      .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).src)))
      sources.add(src);
  }
  for (const src of sources) {
    const transparentPixels = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 64;
      const context = canvas.getContext('2d');
      if (!context)
        throw new Error('Canvas is unavailable for image transparency checks');
      context.drawImage(image, 0, 0, 64, 64);
      const pixels = context.getImageData(0, 0, 64, 64).data;
      return pixels.filter((alpha, index) => index % 4 === 3 && alpha === 0).length;
    }, src);
    expect(transparentPixels, src).toBeGreaterThan(64 * 64 * 0.1);
  }
});

test('unpublished conference details show pending content in all six locales', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const locale of locales) {
    for (const route of pendingRoutes) {
      const response = await page.goto(`/2026/${locale}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('[data-content-pending]')).toBeVisible();
      await expect(page.locator('[data-conference-content]')).toHaveCount(0);
    }
  }
});

test('complete migrated conference content remains public in all six locales', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const locale of locales) {
    for (const route of publishedRoutes) {
      const response = await page.goto(`/2026/${locale}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-content-pending]')).toHaveCount(0);
      await expect(page.locator('[data-conference-content]')).toBeVisible();
    }

    const response = await page.goto(`/2026/${locale}/sponsorships/opportunities/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-content-pending]')).toHaveCount(0);
    await expect(page.locator('[data-published-sponsorship]')).toBeVisible();
  }
});

for (const width of [390, 1440]) {
  test(`Cantonese CMS content stays distinct from written Chinese at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/zh-hk/about/');
    const about = page.locator('[data-conference-content="about"]');
    await expect(about).toContainText('等一班 Python 愛好者可以聚埋一齊');
    await expect(about).toContainText('佢喺東京參加 PyCon APAC 2013 時得到啟發');
    await expect(about).not.toContainText('匯聚眾多 Python 愛好者，分享真知灼見');

    const header = page.locator('[data-site-header]');
    if (width < 768) {
      await header.locator('[data-mobile-nav-trigger]').click();
      await header
        .locator('[data-mobile-nav-panel] [data-locale-switch="zh-hant"]')
        .click();
    } else {
      await header.locator('summary').first().click();
      await header.locator('[data-locale-switch="zh-hant"]').first().click();
    }
    await expect(page).toHaveURL(/\/2026\/zh-hant\/about\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
    await expect(about).toContainText('匯聚眾多 Python 愛好者，分享真知灼見');
    await expect(about).not.toContainText('等一班 Python 愛好者可以聚埋一齊');

    for (const [route, kind, snippet] of [
      [
        'organizers',
        'organizers',
        '佢哋定期舉辦聚會、工作坊同各類活動，提供一個開放嘅環境',
      ],
      [
        'sponsorships/patrons',
        'patrons',
        '維持免費或者大家負擔得起嘅票價，等更多人可以參加',
      ],
      ['access-guide', 'venue', '確認校園之後，我哋會補返交通同無障礙通道資料。'],
    ]) {
      await page.goto(`/2026/zh-hk/${route}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant-HK');
      await expect(page.locator(`[data-conference-content="${kind}"]`)).toContainText(
        snippet
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
    }

    await page.goto('/2026/zh-hk/cfp/');
    await expect(page.locator('main')).toContainText(
      '提案徵集已經截止。如果你之前交咗提案，仲可以登入睇返。'
    );
    await expect(
      page
        .locator('main a[href="https://cfp.pycon.hk/pyconhk2026/me/submissions/"]')
        .first()
    ).toHaveText('睇返已提交嘅提案');
    const privacy = page.locator('footer').getByRole('link', {
      name: 'Privacy Policy',
      exact: true,
    });
    await privacy.click();
    await expect(page).toHaveURL(/\/2026\/zh-hk\/privacy-policy\/?$/);
    await expect(page.locator('[data-policy-body]')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'PyCon Hong Kong Privacy Policy Statement'
    );
  });
}

test('registration is pending and calendar uses the actual 2026 event dates', async ({
  page,
}) => {
  await page.goto('/2026/en/');
  await expect(page.locator('main [data-registration-pending]').first()).toBeVisible();
  await expect(page.locator('[data-registration-link]')).toHaveCount(0);
  const calendar = page.getByRole('link', { name: 'Add to calendar', exact: true });
  const href = new URL((await calendar.getAttribute('href')) ?? '');
  expect(href.hostname).toBe('calendar.google.com');
  expect(href.searchParams.get('dates')).toBe('20261114/20261116');
  expect(href.searchParams.get('ctz')).toBe('Asia/Hong_Kong');
  await expect(page.locator('[data-published-sponsors]')).toBeVisible();
});

test('mobile navigation opens a real access guide route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2026/en/');
  const menu = page.locator('[data-mobile-nav-trigger]');
  await menu.click();
  const mobileNav = page.locator('[data-mobile-nav-drawer]');
  await mobileNav.getByText('Conference', { exact: true }).click();
  await mobileNav.getByRole('link', { name: 'Access Guide', exact: true }).click();
  await expect(page).toHaveURL(/\/2026\/en\/access-guide\/?$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Access Guide' })
  ).toBeVisible();
});

test('CFP is closed and uses the current conference theme in every locale', async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(`/2026/${locale}/cfp/`);
    await expect(page.locator('[data-cfp-closed]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      (
        {
          en: 'Code, Connect and Carry On',
          'zh-hk': '編程・連結・前行',
          'zh-hant': '編程・連結・前行',
          'zh-hans': '编程・连接・前行',
          ja: 'コードを書き、つながり、前へ',
          ko: '코딩하고, 연결하고, 계속 나아가다',
        } as Record<string, string>
      )[locale]
    );
    await expect(
      page.locator('a[href="https://cfp.pycon.hk/pyconhk2026/cfp"]')
    ).toHaveCount(0);
    await expect(
      page
        .locator('main a[href="https://cfp.pycon.hk/pyconhk2026/me/submissions/"]')
        .first()
    ).toBeVisible();
  }
});
