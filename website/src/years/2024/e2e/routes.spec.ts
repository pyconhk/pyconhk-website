import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}
const specialLegacySlugRedirects = [
  {
    path: '/2024/python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup-%F0%9F%8E%83%F0%9F%90%8D/',
    location:
      '/2024/python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup-%F0%9F%8E%83%F0%9F%90%8D',
    text: /Python Thrills and Chills: Halloween Highlights/u,
  },
  {
    path: '/2024/python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup-🎃🐍/',
    location:
      '/2024/python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup-%F0%9F%8E%83%F0%9F%90%8D',
    text: /Python Thrills and Chills: Halloween Highlights/u,
  },
];
const legacyHighlightRedirectChecks = [
  {
    from: '/conference-highlights/pycon-hk-2024-photos/',
    to: '/2024/photos',
    title: 'PyCon HK 2024 Photos - PyCon HK',
  },
];
const criticalPages = [
  {
    path: '/2024/',
    title: /PyCon HK - The leading Python Conference in Hong Kong/,
    text: /PyCon HK 2024/,
  },
  {
    path: '/2024/news/',
    title: /2024 - PyCon HK/,
    text: /PyCon HK 2024 Photos/,
  },
  {
    path: '/2024/photos/',
    title: /PyCon HK 2024 Photos/,
    text: /PyCon HK 2024 Photos/u,
  },
];
const legacyCompatibilityAssetPaths = [
  '/wp-content/uploads/2024/09/logo_1200px-150x150.gif',
  '/wp-content/uploads/2024/11/welcome-to-PyCon-HK-2024.jpg',
];
const legacy2024TitleCanonicalChecks = [
  {
    path: '/2024/',
    title: 'PyCon HK - The leading Python Conference in Hong Kong',
    canonicalPath: '/2024',
  },
  {
    path: '/2024/schedule/',
    title: 'Schedule – PyCon HK 2024 - PyCon HK',
    canonicalPath: '/2024/schedule',
  },
  {
    path: '/2024/2024-sponsors/',
    title: 'Sponsors – PyCon HK 2024 - PyCon HK',
    canonicalPath: '/2024/2024-sponsors',
  },
  {
    path: '/2024/2024-code-of-conduct/',
    title: 'Code of Conduct – As of 2024 - PyCon HK',
    canonicalPath: '/2024/2024-code-of-conduct',
  },
];
for (const check of specialLegacySlugRedirects) {
  test(`serves special legacy slug alias without Unicode corruption: ${check.path}`, async ({
    request,
  }) => {
    const response = await request.get(check.path, { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(response.headers().location).toBeUndefined();
    expect(await response.text()).toMatch(check.text);
  });
}

for (const check of legacyHighlightRedirectChecks) {
  test(`redirects legacy highlight to year-local canonical route: ${check.from}`, async ({
    page,
    request,
  }) => {
    const redirect = await request.get(check.from, { maxRedirects: 0 });

    expect(redirect.status()).toBe(308);
    expect(normalizeRedirectLocation(redirect.headers().location)).toBe(check.to);

    const response = await page.goto(check.to, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://pycon.hk${check.to}`
    );
  });
}

for (const pageCheck of criticalPages) {
  test(`serves critical page ${pageCheck.path}`, async ({ page }) => {
    const response = await page.goto(pageCheck.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(pageCheck.title);
    await expect(page.getByText(pageCheck.text).first()).toBeVisible();
  });
}

test('keeps the 2024 landing and news archive distinct on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const check of [
    {
      path: '/2024/',
      title: 'PyCon HK - The leading Python Conference in Hong Kong',
      heading: 'PyCon HK 2024',
    },
    {
      path: '/2024/news/',
      title: '2024 - PyCon HK',
      heading: 'PyCon HK 2024 Photos',
    },
  ]) {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
    await expect(
      page.getByRole('heading', { name: check.heading }).first()
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
    ).toBeLessThanOrEqual(4);

    const menuTrigger = page
      .locator('header .wp-block-navigation__responsive-container-open')
      .first();
    const menu = page
      .locator('header .wp-block-navigation__responsive-container')
      .first();

    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toHaveClass(/is-menu-open/u);
    await expect(menu.getByRole('link', { name: 'News' })).toHaveAttribute(
      'href',
      '/2024/news/'
    );
    await menu.locator('.wp-block-navigation__responsive-container-close').click();
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).not.toHaveClass(/is-menu-open/u);
  }
});

test('keeps the 2024 header on one row across its navigation breakpoint', async ({
  page,
}) => {
  for (const path of ['/2024/', '/2024/news/']) {
    for (const viewport of [
      { width: 1199, compact: true },
      { width: 1200, compact: false },
      { width: 1440, compact: false },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: 900 });
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);

      const headerRow = page
        .locator('header .wp-container-core-group-is-layout-9366075c')
        .first();
      const brand = page
        .locator('header .wp-container-core-group-is-layout-fbcf6490')
        .first();
      const navigation = page
        .locator('header .wp-container-core-group-is-layout-bc8e6f51')
        .first();
      const menuTrigger = page
        .locator('header .wp-block-navigation__responsive-container-open')
        .first();

      if (viewport.compact) {
        await expect(menuTrigger).toBeVisible();
      } else {
        await expect(menuTrigger).toBeHidden();
      }

      const [headerBox, brandBox, navigationBox] = await Promise.all([
        headerRow.boundingBox(),
        brand.boundingBox(),
        navigation.boundingBox(),
      ]);

      expect(headerBox).not.toBeNull();
      expect(brandBox).not.toBeNull();
      expect(navigationBox).not.toBeNull();
      expect(headerBox?.height).toBeLessThanOrEqual(80);
      expect(brandBox?.y ?? 0).toBeLessThan(
        (navigationBox?.y ?? 0) + (navigationBox?.height ?? 0)
      );
      expect(navigationBox?.y ?? 0).toBeLessThan(
        (brandBox?.y ?? 0) + (brandBox?.height ?? 0)
      );
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
      ).toBeLessThanOrEqual(4);
    }
  }
});

test('renders 2024 schedule with exported Pretalx widget shell', async ({
  page,
  request,
}) => {
  const redirect = await request.get('/2024/schedule/', { maxRedirects: 0 });

  expect(redirect.status()).toBe(200);
  expect(redirect.headers().location).toBeUndefined();

  await page.setViewportSize({ width: 1440, height: 900 });

  const response = await page.goto('/2024/schedule');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Schedule – PyCon HK 2024/);

  const script = page.locator(
    'script[src="https://pretalx.com/democon/schedule/widget/v2.en.js"]'
  );
  const scrollContainer = page.locator('.scroll-container');
  const pretalxSchedule = page.locator(
    'pretalx-schedule[event-url="https://pretalx.com/pyconhk2024/"][locale="en"][format="grid"]'
  );

  await expect(script).toBeAttached();
  await expect(scrollContainer).toBeVisible();
  await expect(pretalxSchedule).toBeAttached();
  await expect(pretalxSchedule).toHaveAttribute(
    'style',
    /--pretalx-clr-primary:\s*#7CC0C0/u
  );
  expect(await page.content()).toContain(
    'href="https://pretalx.com/pyconhk2024/schedule/"'
  );

  const desktopMetrics = await scrollContainer.evaluate((element) => ({
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    overflowX: getComputedStyle(element).overflowX,
    scrollWidth: element.scrollWidth,
  }));

  expect(desktopMetrics.clientHeight).toBeGreaterThan(300);
  expect(desktopMetrics.clientWidth).toBeGreaterThan(1_000);
  expect(desktopMetrics.overflowX).toBe('auto');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2024/schedule');

  const mobileScrollContainer = page.locator('.scroll-container');
  const mobileBox = await mobileScrollContainer.boundingBox();
  const mobileMetrics = await mobileScrollContainer.evaluate((element) => ({
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));

  expect(Math.round(mobileBox?.width ?? 0)).toBeLessThanOrEqual(390);
  expect(mobileMetrics.clientHeight).toBeGreaterThan(300);
  expect(mobileMetrics.scrollWidth).toBeGreaterThanOrEqual(mobileMetrics.clientWidth);
});

test('renders 2024 detail pages with Voyago article chrome', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const response = await page.goto('/2024/pycon-hk-2024-pre-event-notice');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('PyCon HK 2024 Pre-Event Notice - PyCon HK');
  await expect(page.locator('body.wp-singular.wp-theme-voyago')).toBeVisible();
  await expect(page.locator('header.wp-block-template-part')).toBeVisible();
  await expect(page.locator('footer.wp-block-template-part')).toBeVisible();
  await expect(
    page.locator('header .wp-block-image img[src*="icon-1-150x150.gif"]')
  ).toBeVisible();
  const navigation = page.locator('.header-navigation').first();

  await expect(navigation.getByRole('link', { name: 'Schedule' })).toHaveAttribute(
    'href',
    '/2024/schedule/'
  );
  await expect(navigation.locator('a[href="/2024/2024-patrons/"]')).toHaveText(
    'Patrons'
  );
  await expect(navigation.locator('a[href="/2024/2024-volunteers/"]')).toHaveText(
    'Volunteers'
  );
  await expect(navigation.locator('a[href="/2024/2024-staff-procedure/"]')).toHaveText(
    'Enforcement Procedures'
  );
  await expect(
    navigation.locator('a[href="/2024/2024-attendee-reporting/"]')
  ).toHaveText('Procedures for Reporting Incidents');

  await navigation.getByRole('link', { name: 'Sponsors' }).hover();
  const sponsorsDropdown = navigation
    .locator('.wp-block-navigation__submenu-container')
    .first();

  await expect(sponsorsDropdown).toBeVisible();
  const sponsorsDropdownStyle = await sponsorsDropdown.evaluate((element) => {
    const style = getComputedStyle(element);
    const linkStyle = getComputedStyle(element.querySelector('a')!);

    return {
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      color: linkStyle.color,
      width: element.getBoundingClientRect().width,
    };
  });

  expect(sponsorsDropdownStyle.backgroundColor).toBe('rgb(0, 32, 32)');
  expect(sponsorsDropdownStyle.borderRadius).toBe('0px');
  expect(sponsorsDropdownStyle.color).toBe('rgb(255, 255, 255)');
  expect(sponsorsDropdownStyle.width).toBeGreaterThanOrEqual(200);
  await expect(page.getByRole('link', { name: 'Current site' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Back to 2024 archive/u })).toHaveCount(
    0
  );

  const article = page.locator('main[data-pagefind-body]');

  await expect(
    article.getByRole('heading', { name: 'PyCon HK 2024 Pre-Event Notice' })
  ).toBeVisible();
  await expect(article.locator('.wp-block-post-date time')).toHaveAttribute(
    'datetime',
    '2024-11-14T10:09:07+08:00'
  );
  await expect(
    article.locator(
      '.wp-block-post-featured-image img[src*="welcome-to-PyCon-HK-2024.jpg"]'
    )
  ).toHaveAttribute('alt', 'PyCon HK 2024 Pre-Event Notice');
  await expect(article.locator('.entry-content')).toContainText(
    '#20241116 #ConferenceDay'
  );

  const typography = await article.evaluate((element) => {
    const style = getComputedStyle(element);
    const titleStyle = getComputedStyle(element.querySelector('.wp-block-post-title')!);
    const imageStyle = getComputedStyle(
      element.querySelector('.wp-block-post-featured-image img')!
    );

    return {
      borderRadius: imageStyle.borderRadius,
      fontFamily: style.fontFamily,
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      titleFontSize: Number.parseFloat(titleStyle.fontSize),
    };
  });
  const articleBox = await article.boundingBox();

  expect(typography.fontFamily).toContain('Montserrat');
  expect(typography.fontSize).toBe(16);
  expect(typography.lineHeight).toBeGreaterThan(25);
  expect(typography.titleFontSize).toBeGreaterThan(28);
  expect(typography.borderRadius).toBe('40px');
  expect(Math.round(articleBox?.width ?? 0)).toBeGreaterThan(1_000);
});

test('preserves 2024 news archive and pagination redirect', async ({
  page,
  request,
}) => {
  const response2024 = await page.goto('/2024/news/');

  expect(response2024?.status()).toBe(200);
  await expect(page).toHaveTitle('2024 - PyCon HK');
  await expect(page.locator('body.archive.date.wp-theme-voyago')).toBeVisible();
  await expect(page.locator('header.wp-block-template-part')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'PyCon HK 2024 Photos' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'PyCon HK 2024 Photos', exact: true }).first()
  ).toHaveAttribute('href', '/2024/photos/');
  await expect(page.locator('footer.wp-block-template-part')).toBeVisible();

  const pageTwo2024Response = await request.get('/2024/page/2/', {
    maxRedirects: 0,
  });

  expect(pageTwo2024Response.status()).toBe(308);
  expect(normalizeRedirectLocation(pageTwo2024Response.headers().location)).toBe(
    '/2024/news'
  );
});

test('redirects year categories and omits obsolete archive namespaces', async ({
  request,
}) => {
  const category = await request.get('/category/2024/', { maxRedirects: 0 });

  expect(category.status()).toBe(308);
  expect(normalizeRedirectLocation(category.headers().location)).toBe('/2024/news');

  for (const path of ['/tag/communities/', '/author/sammyfung/']) {
    const response = await request.get(path);

    expect(response.status(), path).toBe(404);
  }
});

for (const path of legacyCompatibilityAssetPaths) {
  test(`does not publish root WordPress asset URL: ${path}`, async ({ request }) => {
    const response = await request.get(path);

    expect(response.status()).toBe(404);
  });
}

for (const check of legacy2024TitleCanonicalChecks) {
  test(`uses decided 2024 title and canonical policy: ${check.path}`, async ({
    page,
  }) => {
    const response = await page.goto(check.path);

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(check.title);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      `https://pycon.hk${check.canonicalPath}`
    );
    await expect(canonical).not.toHaveAttribute('href', /legacy\.pycon\.hk/u);
  });
}

const legacy2024MediaQaChecks = [
  {
    path: '/2024/2024-sponsors/',
    heading: 'Sponsors – PyCon HK 2024',
    minImages: 7,
    minLinks: 7,
    texts: [/Diamond Sponsor/u, /MySQL/u],
  },
  {
    path: '/2024/2024-patrons/',
    heading: 'Patrons – PyCon HK 2024',
    minImages: 0,
    minLinks: 0,
    texts: [/generous patrons/u, /PyCon香港補完計画/u],
  },
  {
    path: '/2024/2024-supporting-organizations/',
    heading: 'Supporting Organizations – PyCon HK 2024',
    minImages: 6,
    minLinks: 6,
    texts: [/Codeaholics/u, /Women Techmakers Hong Kong/u],
  },
  {
    path: '/2024/2024-organizers/',
    heading: 'Organizers – PyCon HK 2024',
    minImages: 3,
    minLinks: 3,
    texts: [/Hong Kong Python User Group/u, /Open Source Hong Kong/u],
  },
  {
    path: '/2024/2024-volunteers/',
    heading: 'Volunteers – PyCon HK 2024',
    minImages: 55,
    minLinks: 20,
    texts: [/Conference Chair/u, /On-site Volunteers/u],
  },
  {
    path: '/2024/2024-booths/',
    heading: 'Booths – PyCon HK 2024',
    minImages: 0,
    minLinks: 8,
    texts: [/AWS/u, /Python Software Foundation/u],
  },
];
const legacy2024AccessGuideQaChecks = [
  {
    path: '/2024/2024-access-guide-conference-day/',
    heading: 'Access Guide – Conference Day – PyCon HK 2024',
    minImages: 7,
    minLinks: 1,
    texts: [/City University of Hong Kong/u, /Google Map/u],
  },
  {
    path: '/2024/2024-access-guide-development-sprint-day/',
    heading: 'Access Guide – Development Sprint Day – PyCon HK 2024',
    minImages: 1,
    minLinks: 1,
    texts: [/AWS Experience Space/u, /Tower 535/u],
  },
];
const legacy2024NewsQaChecks = [
  {
    path: '/2024/pycon-hk-2024-call-for-proposal/',
    heading: 'PyCon HK 2024 – Call For Proposal',
    minImages: 1,
    minLinks: 4,
    texts: [/CFP deadline/u, /PyCon Hong Kong 2024/u],
  },
  {
    path: '/2024/pycon-hk-2024-celebrate-10-years-of-pycon-in-hong-kong-a-decade-of-achievements-recharged/',
    heading: /Celebrate 10 Years of PyCon in Hong Kong/u,
    minImages: 1,
    minLinks: 12,
    texts: [/Register for PyCon HK 2024 NOW/u, /Development Sprints/u],
  },
  {
    path: '/2024/pycon-hk-2024-join-us-on-november-16-for-an-exciting-python-community-event/',
    heading: /Join Us on November 16/u,
    minImages: 0,
    minLinks: 3,
    texts: [/over 80 submissions/u, /future Python meetups/u],
  },
  {
    path: '/2024/pycon-hk-2024-pre-event-notice/',
    heading: 'PyCon HK 2024 Pre-Event Notice',
    minImages: 1,
    minLinks: 18,
    texts: [/#20241116 #ConferenceDay/u, /#20241117 #SprintDay/u],
    internalLinks: [
      '/2024/2024-access-guide-conference-day/',
      '/2024/2024-access-guide-development-sprint-day/',
      '/2024/2024-sprint/',
    ],
  },
  {
    path: '/2024/discover-the-latest-in-python-at-our-recent-events-and-pycon-hk-2024/',
    heading: /Discover the Latest in Python/u,
    minImages: 1,
    minLinks: 4,
    texts: [/PyCon HK 2024/u, /Recent Events/u],
  },
  {
    path: '/2024/important-notice-about-sprint-day/',
    heading: 'Important Notice about Sprint Day',
    minImages: 1,
    minLinks: 0,
    texts: [/Sprint Day/u, /FIRST-COME, FIRST-SERVED/u],
  },
  {
    path: '/2024/python-thrills-and-chills-halloween-highlights-from-oshk-x-hkpug-meetup-🎃🐍/',
    heading: /Python Thrills and Chills/u,
    minImages: 6,
    minLinks: 2,
    texts: [/Halloween vibes/u, /Open Source Hong Kong X Hong Kong Python User Group/u],
  },
];
for (const group of [
  { label: 'QA 2024 media layout', checks: legacy2024MediaQaChecks },
  { label: 'QA 2024 access guide', checks: legacy2024AccessGuideQaChecks },
  { label: 'QA 2024 news post', checks: legacy2024NewsQaChecks },
]) {
  for (const check of group.checks) {
    test(`${group.label}: ${check.path}`, async ({ page, request }) => {
      await page.setViewportSize({ width: 390, height: 1000 });
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      await expect(page.locator('body.wp-singular.wp-theme-voyago')).toBeVisible();
      const heading = page.getByRole('heading', { name: check.heading }).first();
      await expect(heading).toBeVisible();
      for (const text of check.texts) {
        await expect(page.getByText(text).first()).toBeVisible();
      }
      await expect(page.getByRole('heading', { name: 'Follow Us' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

      const fontFamily = await page
        .locator('body.wp-singular.wp-theme-voyago')
        .evaluate((element) => getComputedStyle(element).fontFamily);

      expect(fontFamily).toMatch(/Montserrat/u);
      expect(await page.locator('main a').count()).toBeGreaterThanOrEqual(
        check.minLinks
      );

      const imageSources = await page.locator('main img').evaluateAll((elements) =>
        elements
          .map((element) => {
            const image = element as HTMLImageElement;

            return image.currentSrc || image.src;
          })
          .filter(Boolean)
      );

      expect(imageSources.length).toBeGreaterThanOrEqual(check.minImages);
      for (const src of imageSources) {
        const imageResponse = await request.get(src);

        expect(imageResponse.status()).toBe(200);
        expect((await imageResponse.body()).byteLength).toBeGreaterThan(0);
      }

      if ('internalLinks' in check && check.internalLinks) {
        for (const href of check.internalLinks) {
          await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
        }
      }

      const horizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth
      );

      expect(horizontalOverflow).toBeLessThanOrEqual(4);
    });
  }
}
