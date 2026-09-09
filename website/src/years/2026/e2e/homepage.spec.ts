import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

const names = ['Paul Everitt', 'Jacky Chan', 'Hon Kwan Shun Quinson', 'Indy Ho'];
const talks = [
  [
    'NLFQSW',
    'python-history-software-engineering-and-ai',
    'Was, Is, Will Be: Python History, Software Engineering, And AI Our Way',
  ],
  ['TSBGZH', 'ai-audio-associations', 'AI 聽到聲音時，會聯想到乜嘢？'],
  [
    '9NKPSV',
    'property-based-testing-with-hypothesis',
    'Property-Based Testing with Hypothesis',
  ],
  [
    'TF3HKJ',
    'python-applications-in-sports-science',
    'Python Applications in Sports Science, Injury Prevention and Physical Fitness Promotion',
  ],
];

for (const locale of ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
  test(`${locale} featured cards open their own 2026 talk and return to the homepage`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/2026/${locale}/`);
    for (const [index, [code, slug, title]] of talks.entries()) {
      const card = page.locator('[data-featured-speaker]').nth(index);
      await expect(card).toHaveAttribute('href', `/2026/${locale}/talks/${slug}/`);
      await expect(card).toHaveCSS('cursor', 'pointer');
      await card.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/2026/${locale}/talks/${slug}/?$`));
      await expect(page.locator('main h1')).toHaveText(title);
      const talk = page.locator(`[data-featured-talk="${code}"]`);
      await expect(talk.locator('h3')).toHaveText(names[index]);
      expect(
        (await talk.locator('[data-talk-abstract]').innerText()).length
      ).toBeGreaterThan(100);
      expect(
        (await talk.locator('[data-talk-biography]').innerText()).length
      ).toBeGreaterThan(80);
      await expect(talk.locator('img')).toHaveAttribute('src', /^\/_astro\/.+\.webp$/);
      await expect(page.locator('[data-sample-notice]')).toHaveCount(0);
      await expect(talk.locator('a[href*="pretalx"], a[href*="2025"]')).toHaveCount(0);
      await talk.locator(`a[href="/2026/${locale}/#featured-speakers"]`).click();
      await expect(page).toHaveURL(new RegExp(`/2026/${locale}/#featured-speakers$`));
      await expect(page.locator('#featured-title')).toBeInViewport();
    }
    expect(errors).toEqual([]);
  });

  test(`${locale} homepage shows the selected 2026 speakers with bundled portraits`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/2026/${locale}/`);
    const featured = page.locator('[data-featured-speakers]');
    await featured.scrollIntoViewIfNeeded();
    await expect(featured.locator('h3')).toHaveText(names);
    await expect(featured.locator('[data-keynote="true"] h3')).toHaveText(
      'Paul Everitt'
    );
    await expect(featured.locator('[data-keynote="false"]')).toHaveCount(3);
    await expect(
      featured.getByText('AI 聽到聲音時，會聯想到乜嘢？', { exact: true })
    ).toBeVisible();
    await expect(featured.locator('a[href*="2025"], a[href*="pretalx"]')).toHaveCount(
      0
    );
    for (const name of names) {
      const portrait = featured.getByRole('img', { name, exact: true });
      await portrait.scrollIntoViewIfNeeded();
      await expect(portrait).toHaveAttribute('src', /^\/_astro\/.+\.webp$/);
      await expect
        .poll(() =>
          portrait.evaluate(
            (image: HTMLImageElement) => image.complete && image.naturalWidth > 0
          )
        )
        .toBe(true);
    }
    const sections = await page
      .locator('main > section[id]')
      .evaluateAll((elements) => elements.map((element) => element.id));
    expect(sections.filter((id) => !['news', 'sponsors'].includes(id))).toEqual([
      'home',
      'featured-speakers',
      'participate',
    ]);
    if (sections.includes('news')) expect(sections.indexOf('news')).toBe(1);
    if (sections.includes('sponsors'))
      expect(sections.indexOf('sponsors')).toBeLessThan(
        sections.indexOf('featured-speakers')
      );
    await expect(page.locator('#home .brand-plate img')).toHaveAttribute(
      'src',
      '/2026/logos/pyconlogo.svg'
    );
    await expect(page.locator('#participate a')).toHaveCount(2);
    await expect(page.locator('#participate p')).toHaveCount(3);
    for (const card of await page.locator('#participate a').all()) {
      await expect(card.locator('h3')).not.toBeEmpty();
      await expect(card.locator('p')).not.toBeEmpty();
      await expect(card).toHaveAttribute('data-astro-prefetch', 'viewport');
    }
    await expect(page.locator('#participate details, [data-home-dates]')).toHaveCount(
      0
    );
    await page.locator(`#participate a[href="/2026/${locale}/sprint/"]`).click();
    await expect(page).toHaveURL(new RegExp(`/2026/${locale}/sprint/?$`));
    await expect(page.locator('main h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 1920]) {
  test(`featured talk details remain usable at ${width}px in both themes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [, slug] of talks) {
      await page.goto(`/2026/zh-hk/talks/${slug}/`);
      for (const theme of ['light', 'dark']) {
        await setTheme(page, theme);
        await expect(page.locator('main h1')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
        ).toBe(true);
        const talk = page.locator('[data-featured-talk]');
        expect(
          await talk.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1
          )
        ).toBe(true);
      }
    }
  });
}

for (const width of [320, 390, 640, 768, 1024, 1280, 1920]) {
  test(`homepage remains usable at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/2026/en/');
    await page.locator('[data-featured-speakers]').scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      await expect(page.locator('#home h1')).toHaveText('Ride and Leverage with AI');
      for (const card of await page.locator('[data-featured-speaker]').all()) {
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible();
        const box = await card.boundingBox();
        expect(box).not.toBeNull();
        if (!box) throw new Error('Featured speaker card has no visible bounds');
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(
          await card.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1
          )
        ).toBe(true);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
      ).toBe(true);
    }
    await page
      .locator('#participate a[href="/2026/en/sponsorships/opportunities/"]')
      .click();
    await expect(page).toHaveURL(/\/2026\/en\/sponsorships\/opportunities\/?$/);
    await expect(page.locator('main h1')).toBeVisible();
  });
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
]) {
  test(`homepage sections fill the screen below the header at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/2026/en/');
    await page.evaluate(() => document.fonts.ready);
    for (const height of [viewport.height, viewport.height - 100]) {
      await page.setViewportSize({ width: viewport.width, height });
      const { available, sections } = await page.evaluate(() => ({
        available:
          innerHeight -
          (document.querySelector('[data-site-header]')?.getBoundingClientRect()
            .height ?? Number.NaN),
        sections: [...document.querySelectorAll('main > section')].map((section) => {
          const box = section.getBoundingClientRect();
          const content = section.firstElementChild?.getBoundingClientRect();
          if (!content) throw new Error('Section has no content');
          return {
            id: section.id,
            height: box.height,
            minimum: Number.parseFloat(getComputedStyle(section).minHeight),
            topGap: content.top - box.top,
            bottomGap: box.bottom - content.bottom,
          };
        }),
      }));
      for (const section of sections) {
        expect(section.minimum).toBeCloseTo(available, 0);
        expect(section.height).toBeGreaterThanOrEqual(available - 1);
        expect(section.topGap).toBeGreaterThanOrEqual(0);
        expect(section.bottomGap).toBeGreaterThanOrEqual(0);
        if (viewport.width >= 1440) {
          expect(section.height).toBeCloseTo(available, 0);
          expect(section.topGap).toBeCloseTo(section.bottomGap, 0);
        }
      }
      if (viewport.width === 390) {
        expect(
          sections.find((section) => section.id === 'featured-speakers')?.height
        ).toBeGreaterThan(available);
      }
    }
    await page.goto('/2026/en/#featured-speakers');
    await expect
      .poll(() =>
        page
          .locator('#featured-speakers')
          .evaluate((section) =>
            Math.abs(
              section.getBoundingClientRect().top -
                (document.querySelector('[data-site-header]')?.getBoundingClientRect()
                  .bottom ?? Number.NaN)
            )
          )
      )
      .toBeLessThan(2);
    await page.locator('[data-featured-speaker]').first().click();
    await expect(page.locator('main')).not.toHaveAttribute('data-full-screen-sections');
  });
}
