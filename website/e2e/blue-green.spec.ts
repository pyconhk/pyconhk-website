import { expect, test } from '@playwright/test';

function normalizeRedirectLocation(location: string | undefined): string {
  if (!location) {
    return '';
  }

  return location.replace(/\/+$/u, '');
}

function cookieDomain(baseURL: string | undefined): string {
  if (!baseURL) {
    return '127.0.0.1';
  }

  return new URL(baseURL).hostname;
}

const criticalPages = [
  {
    path: '/',
    title: /PyCon HK 2026 CFP \| Many Voices, One Python Story/,
    text: /Many Voices, One Python Story/u,
  },
  {
    path: '/2026/',
    title: /PyCon HK 2026 CFP \| Many Voices, One Python Story/,
    text: /Many Voices, One Python Story/u,
  },
  {
    path: '/en/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/zh-hk/',
    title: /PyCon HK 2026 CFP/,
    text: /多元聲音/u,
  },
  {
    path: '/2026/en/',
    title: /PyCon HK 2026 CFP/,
    text: /Many Voices/u,
  },
  {
    path: '/news/pre-event-notice/',
    title: /Don't Miss the Boat! Your PyCon HK 2025 Pre-Event Essentials/,
    text: /PyCon HK 2025 Pre-Event Essentials/u,
  },
  {
    path: '/2024/',
    title: /PyCon HK - The leading Python Conference in Hong Kong/,
    text: /PyCon HK 2024/,
  },
  {
    path: '/2024/photos/',
    title: /PyCon HK 2024 Photos/,
    text: /PyCon HK 2024 Photos/u,
  },
];

const redirectChecks = [
  { path: '/news/', status: 308, location: '/2025/news' },
  { path: '/2026/en/', status: 200 },
  { path: '/2025/', status: 200 },
  { path: '/2025/schedule/', status: 200 },
  { path: '/2000/', status: 301, location: 'https://legacy.pycon.hk/2000' },
  { path: '/2019/schedule/', status: 301, location: 'https://legacy.pycon.hk/2019/schedule' },
];

const specialLegacySlugRedirects = [
  {
    path: '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83/',
    location:
      '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83',
    text: /廣東話香港Python社群聚會/u,
  },
  {
    path: '/2020-spring/廣東話香港python社群聚會/',
    location:
      '/2020-spring/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E9%A6%99%E6%B8%AFpython%E7%A4%BE%E7%BE%A4%E8%81%9A%E6%9C%83',
    text: /廣東話香港Python社群聚會/u,
  },
  {
    path: '/2020-spring/a-day-has-only-24%C2%B11-hours/',
    location: '/2020-spring/a-day-has-only-24%C2%B11-hours',
    text: /A Day Has Only 24±1 Hours/u,
  },
  {
    path: '/2020-spring/a-day-has-only-24±1-hours/',
    location: '/2020-spring/a-day-has-only-24%C2%B11-hours',
    text: /A Day Has Only 24±1 Hours/u,
  },
  {
    path: '/2021/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E8%87%AA%E8%82%A5%E4%BC%81%E7%94%BB-cantonese-selfish-project/',
    location:
      '/2021/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E8%87%AA%E8%82%A5%E4%BC%81%E7%94%BB-cantonese-selfish-project',
    text: /廣東話自肥企画 Cantonese Selfish Project/u,
  },
  {
    path: '/2021/廣東話自肥企画-cantonese-selfish-project/',
    location:
      '/2021/%E5%BB%A3%E6%9D%B1%E8%A9%B1%E8%87%AA%E8%82%A5%E4%BC%81%E7%94%BB-cantonese-selfish-project',
    text: /廣東話自肥企画 Cantonese Selfish Project/u,
  },
  {
    path: '/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript/',
    location: '/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript',
    text: /玩轉 Python 與 Javascript/u,
  },
  {
    path: '/2023/玩轉-python-與-javascript/',
    location: '/2023/%E7%8E%A9%E8%BD%89-python-%E8%88%87-javascript',
    text: /玩轉 Python 與 Javascript/u,
  },
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
    from: '/conference-highlights/2015-photos/',
    to: '/2015/photos',
    title: 'PyCon HK 2015 Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/2016-photos/',
    to: '/2016/photos',
    title: 'PyCon HK 2016 Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/2017-photos/',
    to: '/2017/photos',
    title: 'PyCon HK 2017 Photos | PyCon HK',
  },
  {
    from: '/conference-highlights/2017-recording/',
    to: '/2017/recording',
    title: 'PyCon HK 2017 Recording | PyCon HK',
  },
  {
    from: '/conference-highlights/2018-photos/',
    to: '/2018/photos',
    title: 'PyCon HK 2018 Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/2020-spring-photos/',
    to: '/2020-spring/photos',
    title: 'PyCon HK 2020 Spring Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/conference-coverage/',
    to: '/2020-spring/conference-coverage',
    title: 'Conference Coverage | PyCon HK',
  },
  {
    from: '/conference-highlights/pycon-hk-2020-fall-photos/',
    to: '/2020-fall/photos',
    title: 'PyCon HK 2020 Fall Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/pycon-hk-2021-photos/',
    to: '/2021/photos',
    title: 'PyCon HK 2021 Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/pycon-hk-2022-photos/',
    to: '/2022/photos',
    title: 'PyCon HK 2022 Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/pycon-hk-2023-photos/',
    to: '/2023/photos',
    title: 'PyCon HK 2023 Photos - PyCon HK',
  },
  {
    from: '/conference-highlights/pycon-hk-2024-photos/',
    to: '/2024/photos',
    title: 'PyCon HK 2024 Photos | PyCon HK',
  },
];

const legacyCompatibilityRedirectChecks = [
  {
    from: '/2023/about/code-of-conduct/',
    to: '/2023/2023-code-of-conduct',
    text: /Code of Conduct – As of 2023/u,
  },
];

const legacyArchiveSlashRedirectChecks = [
  {
    from: '/2020-spring/',
    to: '/2020-spring',
    title: /2020 Spring - PyCon HK/u,
    heading: 'Category: 2020 Spring',
    fontFamily: /Lato/u,
    mainBackground: 'rgb(238, 238, 238)',
  },
  {
    from: '/2020-fall/',
    to: '/2020-fall',
    title: /2020 Fall - PyCon HK/u,
    heading: 'Category: 2020 Fall',
    fontFamily: /Lato/u,
    mainBackground: 'rgb(238, 238, 238)',
  },
  { from: '/2021/', to: '/2021', title: /2021 - PyCon HK/u },
  { from: '/2021/page/2/', to: '/2021/page/2', title: /2021 - PyCon HK/u },
];

const legacyTitleSuffixChecks = [
  {
    path: '/2018/schedule-2018/',
    title: 'Schedule 2018 - PyCon HK',
  },
  {
    path: '/2018/call-for-proposals-2018/',
    title: 'Call for Proposals 2018 - PyCon HK',
  },
  {
    path: '/2020-spring/opening-of-pycon-hk-2020-spring/',
    title: 'Opening of PyCon HK 2020 Spring - PyCon HK',
  },
  {
    path: '/2020-fall/mysql-speaks-at-pycon-hk/',
    title: 'MySQL speaks at PyCon HK - PyCon HK',
  },
  {
    path: '/2021/2021-qa-prize/',
    title: 'Q&A Prize – PyCon HK 2021 - PyCon HK',
  },
  {
    path: '/2022/2022-schedule/',
    title: 'Schedule – PyCon HK 2022 - PyCon HK',
  },
  {
    path: '/2023/2023-schedule/',
    title: 'Schedule – PyCon HK 2023 - PyCon HK',
  },
];

const legacyArticlePresentationChecks = [
  {
    path: '/2020-spring/geospatial-data-processing-using-python/',
    heading: /Geospatial Data Processing using Python/u,
  },
  {
    path: '/2020-fall/2020-fall-schedule/',
    heading: /Schedule – PyCon HK 2020 Fall/u,
  },
  {
    path: '/2021/financial-data-forecaster/',
    heading: /Financial Data Forecaster/u,
  },
];

const legacyMarketinglyMobileHeaderChecks = [
  {
    path: '/2020-spring/',
    heading: 'Category: 2020 Spring',
    maxHeaderHeight: 260,
    maxHeadingTop: 210,
  },
  {
    path: '/2020-fall/',
    heading: 'Category: 2020 Fall',
    maxHeaderHeight: 260,
    maxHeadingTop: 210,
  },
  {
    path: '/2020-spring/geospatial-data-processing-using-python/',
    heading: /Geospatial Data Processing using Python/u,
    maxHeaderHeight: 380,
    maxHeadingTop: 210,
  },
  {
    path: '/2020-fall/2020-fall-schedule/',
    heading: /Schedule – PyCon HK 2020 Fall/u,
    maxHeaderHeight: 380,
    maxHeadingTop: 210,
  },
  {
    path: '/2021/financial-data-forecaster/',
    heading: /Financial Data Forecaster/u,
    maxHeaderHeight: 380,
    maxHeadingTop: 210,
  },
];

const legacy2018FeaturedImageChecks = [
  '/2018/current-use-cases-for-machine-learning-in-the-industry/',
  '/2018/nosql-development-for-mysql-document-store-using-python/',
];

const legacy2018ContentQaChecks = [
  {
    path: '/2018/schedule-2018/',
    heading: 'Schedule 2018',
    minTables: 2,
    texts: [/23 November 2018, Friday/u, /Function Room 1-3/u],
  },
  {
    path: '/2018/sponsors-2018/',
    heading: 'Sponsors in 2018',
    minImages: 5,
    texts: [/Gold Sponsor – HK01/u, /Python Software Foundation/u],
  },
  {
    path: '/2018/organisers-and-partners-2018/',
    heading: 'Organisers and Partners 2018',
    minImages: 5,
    texts: [/Organisers/u, /Suppporting Organiastions/u],
  },
  {
    path: '/2018/ticket-pycon-hk-2018/',
    heading: 'Ticket – PyCon HK 2018',
    texts: [/Regular Ticket/u, /Financial Assistance program/u],
  },
  {
    path: '/2018/volunteers-2018/',
    heading: 'Volunteers 2018',
    texts: [/Conference Chair/u, /Session Hosts/u],
  },
  {
    path: '/2018/privacy-statement-2018/',
    heading: 'Privacy Statement 2018',
    texts: [/Microsoft’s privacy statement/u, /opt-out/u],
  },
];

const legacyCompatibilityAssetPaths = [
  '/wp-content/uploads/2018/11/Delon.png',
  '/wp-content/uploads/2023/10/SCHEDULE-850x478.jpg',
  '/wp-content/uploads/2024/09/logo_1200px-150x150.gif',
  '/wp-content/uploads/2024/11/welcome-to-PyCon-HK-2024.jpg',
];

const legacyScheduleMobileChecks = [
  { path: '/2022/2022-schedule/', maxDocumentHeight: 5_600 },
  { path: '/2023/2023-schedule/', maxDocumentHeight: 6_200 },
];

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

test.describe('blue-green launch smoke', () => {
  test('serves neutral entry pages like the live CFP page', async ({
    baseURL,
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/2026/en');
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP \| Many Voices, One Python Story/);
    await expect(page.getByRole('heading', { name: /Many Voices/u })).toBeVisible();

    await context.clearCookies();
    await context.addCookies([
      {
        domain: cookieDomain(baseURL),
        name: 'preferredLocale',
        path: '/',
        value: 'zh-hk',
      },
    ]);
    await page.goto('/');
    expect(new URL(page.url()).pathname).toBe('/2026/zh-hk');
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP/);
    await expect(page.getByRole('heading', { name: /多元聲音/u })).toBeVisible();

    await context.clearCookies();
    await page.goto('/2026/');
    expect(new URL(page.url()).pathname).toBe('/2026/en');
    await expect(page).toHaveTitle(/PyCon HK 2026 CFP \| Many Voices, One Python Story/);
    await expect(page.getByRole('heading', { name: /Many Voices/u })).toBeVisible();
  });

  for (const path of [
    '/2025/en/',
    '/2025/zh-hk/',
    '/2025/en/news/',
    '/2025/en/news/pre-event-notice/',
  ]) {
    test(`keeps non-live public route at 404: ${path}`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(404);
    });
  }

  for (const check of redirectChecks) {
    test(`serves redirect ${check.path}`, async ({ request }) => {
      const response = await request.get(check.path, { maxRedirects: 0 });

      expect(response.status()).toBe(check.status);
      if ('location' in check) {
        expect(normalizeRedirectLocation(response.headers().location)).toBe(
          normalizeRedirectLocation(check.location)
        );
      } else {
        expect(response.headers().location).toBeUndefined();
      }
    });
  }

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

      const response = await page.goto(check.to);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(check.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://pycon.hk${check.to}`
      );
    });
  }

  for (const check of legacyCompatibilityRedirectChecks) {
    test(`redirects legacy compatibility route to canonical year route: ${check.from}`, async ({
      page,
      request,
    }) => {
      const redirect = await request.get(check.from, { maxRedirects: 0 });

      expect(redirect.status()).toBe(308);
      expect(normalizeRedirectLocation(redirect.headers().location)).toBe(check.to);

      const response = await page.goto(check.from);

      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(check.to);
      await expect(page.getByText(check.text).first()).toBeVisible();
    });
  }

  for (const check of legacyArchiveSlashRedirectChecks) {
    test(`serves legacy archive slash alias: ${check.from}`, async ({ page }) => {
      const response = await page.goto(check.from);

      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(check.from);
      await expect(page).toHaveTitle(check.title);
      if ('heading' in check && check.heading) {
        const heading = page.getByRole('heading', { name: check.heading });

        await expect(heading).toBeVisible();
        if ('fontFamily' in check && check.fontFamily) {
          const fontFamily = await heading.evaluate(
            (element) => getComputedStyle(element).fontFamily
          );

          expect(fontFamily).toMatch(check.fontFamily);
        }
      }
      if ('mainBackground' in check && check.mainBackground) {
        const mainBackground = await page
          .locator('body')
          .evaluate((element) => getComputedStyle(element).backgroundColor);

        expect(mainBackground).toBe(check.mainBackground);
      }
    });
  }

  for (const check of legacyTitleSuffixChecks) {
    test(`uses live legacy title suffix: ${check.path}`, async ({ page }) => {
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(check.title);
    });
  }

  for (const check of legacyArticlePresentationChecks) {
    test(`uses shared 2020-2021 legacy article presentation: ${check.path}`, async ({
      page,
    }) => {
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      const heading = page.getByRole('heading', { name: check.heading });
      await expect(heading).toBeVisible();
      await expect(page.locator('article.posts-entry')).toBeVisible();
      await expect(page.locator('#colophon a[href="/2021/"]')).toBeVisible();

      const fontFamily = await heading.evaluate((element) => getComputedStyle(element).fontFamily);
      const mainBackground = await page
        .locator('body')
        .evaluate((element) => getComputedStyle(element).backgroundColor);

      expect(fontFamily).toMatch(/Lato/u);
      expect(mainBackground).toBe('rgb(238, 238, 238)');
    });
  }

  for (const check of legacyMarketinglyMobileHeaderChecks) {
    test(`keeps 2020-2021 legacy header compact on mobile: ${check.path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      const headerBox = await page.locator('#masthead').boundingBox();
      const headingBox = await page
        .getByRole('heading', { name: check.heading })
        .boundingBox();

      expect(Math.round(headerBox?.height ?? 0)).toBeLessThanOrEqual(
        check.maxHeaderHeight
      );
      expect(Math.round(headingBox?.y ?? 0)).toBeLessThanOrEqual(check.maxHeadingTop);
    });
  }

  for (const path of legacy2018FeaturedImageChecks) {
    test(`preserves 2018 featured image aspect ratio: ${path}`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);

      const image = page.locator('.featured-thumbnail > img').first();

      await expect(image).toBeVisible();

      const metrics = await image.evaluate((element) => {
        const imageElement = element as HTMLImageElement;
        const box = imageElement.getBoundingClientRect();

        return {
          naturalRatio: imageElement.naturalWidth / imageElement.naturalHeight,
          objectFit: getComputedStyle(imageElement).objectFit,
          renderedRatio: box.width / box.height,
        };
      });

      expect(metrics.objectFit).not.toBe('cover');
      expect(Math.abs(metrics.renderedRatio - metrics.naturalRatio)).toBeLessThan(0.05);
    });
  }

  for (const check of legacy2018ContentQaChecks) {
    test(`keeps 2018 content QA page readable on mobile: ${check.path}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 1000 });
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { name: check.heading })).toBeVisible();
      for (const text of check.texts) {
        await expect(page.getByText(text).first()).toBeVisible();
      }

      if (check.minTables) {
        expect(await page.locator('.entry-content table').count()).toBeGreaterThanOrEqual(
          check.minTables
        );
      }

      if (check.minImages) {
        const images = page.locator('.entry-content img');

        expect(await images.count()).toBeGreaterThanOrEqual(check.minImages);
        const imageMetrics = await images.evaluateAll((elements) =>
          elements.map((element) => {
            const image = element as HTMLImageElement;

            return {
              complete: image.complete,
              naturalWidth: image.naturalWidth,
            };
          })
        );

        for (const image of imageMetrics) {
          expect(image.complete).toBe(true);
          expect(image.naturalWidth).toBeGreaterThan(0);
        }
      }

      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );

      expect(horizontalOverflow).toBeLessThanOrEqual(4);
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

  test('serves 2026 locale slash aliases without Astro interstitials', async ({
    page,
    request,
  }) => {
    const redirect = await request.get('/2026/en/', { maxRedirects: 0 });

    expect(redirect.status()).toBe(200);
    expect(redirect.headers().location).toBeUndefined();
    expect(await redirect.text()).not.toContain(
      'Your site is configured with <code>trailingSlash</code> set to <code>never</code>'
    );

    const response = await page.goto('/2026/en/');

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/2026/en/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://pycon.hk/2026/en'
    );
  });

  test('renders 2025 schedule with live-width Pretalx frame', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    const response = await page.goto('/2025/schedule');

    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/2025/schedule');
    await expect(page).toHaveTitle(/PyCon HK 2025/);

    const scheduleContainer = page.locator('#schedule-container');
    const pretalxSchedule = page.locator('pretalx-schedule');

    await expect(pretalxSchedule).toBeAttached({ timeout: 45_000 });
    await expect
      .poll(
        async () => {
          const box = await pretalxSchedule.boundingBox();

          return Math.round(box?.height ?? 0);
        },
        { timeout: 45_000 }
      )
      .toBeGreaterThan(4_000);

    const scheduleBox = await scheduleContainer.boundingBox();
    const pretalxBox = await pretalxSchedule.boundingBox();

    expect(scheduleBox).not.toBeNull();
    expect(pretalxBox).not.toBeNull();
    expect(Math.round(scheduleBox?.x ?? -1)).toBe(0);
    expect(Math.round(pretalxBox?.x ?? -1)).toBe(0);
    expect(Math.round(scheduleBox?.width ?? 0)).toBe(1440);
    expect(Math.round(pretalxBox?.width ?? 0)).toBe(1440);
    expect(Math.round(scheduleBox?.y ?? 0)).toBe(630);
    expect(Math.round(pretalxBox?.y ?? 0)).toBe(630);
    expect(Math.round(pretalxBox?.height ?? 0)).toBeLessThan(5_400);
    await expect
      .poll(async () => page.evaluate(() => document.body.scrollWidth), {
        timeout: 10_000,
      })
      .toBeGreaterThan(1_900);
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
    await expect(navigation.locator('a[href="/2024/2024-attendee-reporting/"]')).toHaveText(
      'Procedures for Reporting Incidents'
    );
    await expect(page.getByRole('link', { name: 'Current site' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Back to 2024 archive/u })).toHaveCount(0);

    const article = page.locator('main[data-pagefind-body]');

    await expect(
      article.getByRole('heading', { name: 'PyCon HK 2024 Pre-Event Notice' })
    ).toBeVisible();
    await expect(article.locator('.wp-block-post-date time')).toHaveAttribute(
      'datetime',
      '2024-11-14T10:09:07+08:00'
    );
    await expect(
      article.locator('.wp-block-post-featured-image img[src*="welcome-to-PyCon-HK-2024.jpg"]')
    ).toHaveAttribute('alt', 'PyCon HK 2024 Pre-Event Notice');
    await expect(article.locator('.entry-content')).toContainText('#20241116 #ConferenceDay');

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

  test('serves legacy year archives with live WordPress archive structure', async ({
    page,
  }) => {
    const response2018 = await page.goto('/2018/');

    expect(response2018?.status()).toBe(200);
    await expect(page).toHaveTitle(/2018 - PyCon HK/);
    await expect(page.getByRole('heading', { name: /Category:\s*2018/u })).toBeVisible();
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
    await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
      /PyCon HK 2018 Photos/u
    );
    await expect(page.locator('#secondary .search-form')).toBeVisible();
    await expect(page.locator('#secondary .widget_archive')).toBeVisible();
    await expect(page.locator('a.next.page-numbers[href="/2018/page/2/"]')).toBeVisible();

    const marketinglyYearArchives = [
      {
        year: '2020',
        firstTitle: /PyCon HK 2020 Fall Photos/u,
        pageTwoFirstTitle: /The status of Python community/u,
        pageTwoCount: 21,
        pageThreeFirstTitle: /django-scim2: User provisioning at scale/u,
        pageThreeCount: 16,
      },
      {
        year: '2021',
        firstTitle: /PyCon HK 2021 Photos/u,
        pageTwoFirstTitle: /Is the news media polarized\?/u,
        pageTwoCount: 16,
      },
      {
        year: '2022',
        firstTitle: /PyCon HK 2022 Photos/u,
        pageTwoFirstTitle: /Sponsors – PyCon Hong Kong 2022/u,
        pageTwoCount: 7,
      },
      {
        year: '2023',
        firstTitle: /PyCon HK 2023 Photos/u,
        pageTwoFirstTitle: /Discover the Future with Our Networking Hour Partner OpenSSF/u,
        pageTwoLastTitle: /Code of Conduct – As of 2023/u,
        pageTwoCount: 21,
      },
    ];

    for (const archive of marketinglyYearArchives) {
      const response = await page.goto(`/${archive.year}/`);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK`));
      const headingKind = archive.year === '2020' ? 'Year' : 'Category';

      await expect(
        page.getByRole('heading', {
          name: new RegExp(`${headingKind}:\\s*${archive.year}`, 'u'),
        })
      ).toBeVisible();
      await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(21);
      await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
        archive.firstTitle
      );
      await expect(
        page.locator(`a.next.page-numbers[href="/${archive.year}/page/2/"]`)
      ).toBeVisible();

      if (archive.year === '2020') {
        const pageOneResponse = await page.goto('/2020/page/1/');

        expect(pageOneResponse?.status()).toBe(200);
        expect(page.url()).toContain('/2020/page/1');
        await expect(page).toHaveTitle(/2020 - PyCon HK/);
        await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
          archive.firstTitle
        );
      }

      const pageTwoResponse = await page.goto(`/${archive.year}/page/2/`);

      expect(pageTwoResponse?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK - Page 2`));
      await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(
        archive.pageTwoCount
      );
      await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
        archive.pageTwoFirstTitle
      );
      if ('pageTwoLastTitle' in archive) {
        await expect(page.locator('article.posts-entry.blogposts-list').last()).toContainText(
          archive.pageTwoLastTitle
        );
      }
      await expect(page.locator('span.page-numbers.current')).toHaveText('2');
      const firstPageHref =
        archive.year === '2020' ? '/2020/page/1/' : `/${archive.year}/`;

      await expect(
        page.locator(`a.prev.page-numbers[href="${firstPageHref}"]`)
      ).toBeVisible();
      await expect(
        page.locator(`a.page-numbers[href="${firstPageHref}"]`, {
          hasText: '1',
        })
      ).toBeVisible();

      if ('pageThreeFirstTitle' in archive) {
        await expect(
          page.locator(`a.next.page-numbers[href="/${archive.year}/page/3/"]`)
        ).toBeVisible();

        const pageThreeResponse = await page.goto(`/${archive.year}/page/3/`);

        expect(pageThreeResponse?.status()).toBe(200);
        await expect(page).toHaveTitle(new RegExp(`${archive.year} - PyCon HK - Page 3`));
        await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(
          archive.pageThreeCount
        );
        await expect(page.locator('article.posts-entry.blogposts-list').first()).toContainText(
          archive.pageThreeFirstTitle
        );
        if ('pageThreeLastTitle' in archive) {
          await expect(page.locator('article.posts-entry.blogposts-list').last()).toContainText(
            archive.pageThreeLastTitle
          );
        }
        await expect(page.locator('span.page-numbers.current')).toHaveText('3');
        await expect(
          page.locator(`a.prev.page-numbers[href="/${archive.year}/page/2/"]`)
        ).toBeVisible();
      }
    }

    const response2024 = await page.goto('/2024/');

    expect(response2024?.status()).toBe(200);
    await expect(page).toHaveTitle('PyCon HK - The leading Python Conference in Hong Kong');
    await expect(page.locator('body.home.wp-theme-voyago')).toBeVisible();
    await expect(page.locator('header.wp-block-template-part')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PyCon HK 2024', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About PyCon HK 2024' })).toBeVisible();
    await expect(page.getByRole('link', { name: /PyCon HK 2024 Photos/u })).toHaveAttribute(
      'href',
      'https://bit.ly/pyconhk2024'
    );
    await expect(page.locator('footer.wp-block-template-part')).toBeVisible();

    const pageTwoResponse = await page.goto('/2018/page/2/');

    expect(pageTwoResponse?.status()).toBe(200);
    await expect(page).toHaveTitle(/2018 - PyCon HK - Page 2/);
    await expect(page.locator('article.posts-entry.blogposts-list')).toHaveCount(18);
    await expect(page.locator('article.posts-entry.blogposts-list').last()).toContainText(
      /Call for Proposals 2018/u
    );
    await expect(page.locator('span.page-numbers.current')).toHaveText('2');
    await expect(page.locator('a.prev.page-numbers[href="/2018/"]')).toBeVisible();
    await expect(
      page.locator('a.page-numbers[href="/2018/"]', { hasText: '1' })
    ).toBeVisible();

    const pageOne2018Response = await page.goto('/2018/page/1/');

    expect(pageOne2018Response?.status()).toBe(404);
    expect(page.url()).toContain('/2018/page/1');

    for (const path of ['/2022/page/3/', '/2023/page/3/']) {
      const response = await page.goto(path);

      expect(response?.status(), path).toBe(404);
      expect(page.url()).toContain(path.slice(0, -1));
    }

    const pageTwo2024Response = await page.goto('/2024/page/2/');

    expect(pageTwo2024Response?.status()).toBe(404);
    expect(page.url()).toContain('/2024/page/2');
  });

  test('does not publish root legacy archive pagination', async ({ request }) => {
    for (const path of ['/page/1/', '/page/2/']) {
      const response = await request.get(path);

      expect(response.status(), path).toBe(404);
    }
  });

  test('uses year-local highlight links on canonical archive pages', async ({
    page,
  }) => {
    for (const check of [
      { path: '/2018/', link: '/2018/photos', text: /PyCon HK 2018 Photos/u },
    ]) {
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      await expect(
        page
          .locator(`main a[href="${check.link}"], main a[href="${check.link}/"]`, {
            hasText: check.text,
          })
          .first()
      ).toBeVisible();
      await expect(page.locator('main a[href^="/conference-highlights/"]')).toHaveCount(0);
    }

    const photos2024Response = await page.goto('/2024/photos/');

    expect(photos2024Response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'PyCon HK 2024 Photos' })).toBeVisible();
    await expect(page.locator('a[href^="/conference-highlights/"]')).toHaveCount(0);

    const photosResponse = await page.goto('/2015/photos/');

    expect(photosResponse?.status()).toBe(200);
    await expect(page.locator('a[href^="/conference-highlights/"]')).toHaveCount(0);
    await expect(page.locator('a[rel="next"][href="/2016/photos/"]')).toBeVisible();
  });

  test('keeps Marketingly year archive navigation collapsed on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const path of [
      '/2018/',
      '/2018/page/2/',
      '/2020/',
      '/2020/page/2/',
      '/2020/page/3/',
      '/2021/',
      '/2021/page/2/',
      '/2022/',
      '/2022/page/2/',
      '/2023/',
      '/2023/page/2/',
    ]) {
      await page.goto(path);

      await expect(
        page.locator('.mobile-menu-toggle, .toggle-mobile-menu:not(.smenu-hide)').first()
      ).toBeVisible();
      await expect(page.locator('#masthead .center-main-menu').first()).toBeHidden();

      const headerBox = await page.locator('#masthead').first().boundingBox();

      expect(Math.round(headerBox?.height ?? 0)).toBeLessThanOrEqual(55);
    }
  });

  test('serves robots and sitemap for production crawling', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    const robotsText = await robots.text();

    expect(robots.status()).toBe(200);
    expect(robotsText).toContain('Allow: /');
    expect(robotsText).not.toMatch(/^Disallow:\s*\/\s*$/imu);
    for (const path of [
      '/author/',
      '/category/',
      '/conference-highlights/',
      '/page/',
      '/tag/',
    ]) {
      expect(robotsText).toContain(`Disallow: ${path}`);
    }
    expect(robotsText).toContain('Sitemap: https://pycon.hk/sitemap.xml');

    const sitemap = await request.get('/sitemap.xml');
    const sitemapText = await sitemap.text();

    expect(sitemap.status()).toBe(200);
    for (const url of [
      'https://pycon.hk/2026/en',
      'https://pycon.hk/2026/zh-hk',
      'https://pycon.hk/2015',
      'https://pycon.hk/2016',
      'https://pycon.hk/2017/recording',
      'https://pycon.hk/2018',
      'https://pycon.hk/2020-spring',
      'https://pycon.hk/2020-fall',
      'https://pycon.hk/2024/photos',
      'https://pycon.hk/2025',
      'https://pycon.hk/2025/news/pre-event-notice',
    ]) {
      expect(sitemapText).toContain(`<loc>${url}</loc>`);
    }
    for (const url of [
      'https://pycon.hk/2025/en/',
      'https://pycon.hk/2025/en/news/pre-event-notice/',
      'https://pycon.hk/author/sammyfung',
      'https://pycon.hk/category/2024',
      'https://pycon.hk/conference-highlights/pycon-hk-2024-photos',
      'https://pycon.hk/page/1',
      'https://pycon.hk/tag/communities',
    ]) {
      expect(sitemapText).not.toContain(`<loc>${url}</loc>`);
    }
  });

  test('redirects year categories and omits obsolete archive namespaces', async ({ request }) => {
    const category = await request.get('/category/2024/', { maxRedirects: 0 });

    expect(category.status()).toBe(308);
    expect(normalizeRedirectLocation(category.headers().location)).toBe('/2024');

    for (const path of ['/tag/communities/', '/author/sammyfung/']) {
      const response = await request.get(path);

      expect(response.status(), path).toBe(404);
    }
  });

  test('serves key static assets', async ({ request }) => {
    for (const assetPath of [
      '/favicon.ico',
      '/2026/open-graph.webp',
      '/outstatic/images/2025-pyconhk-preevent-notice-g3MT.webp',
    ]) {
      const response = await request.get(assetPath);

      expect(response.status()).toBe(200);
      expect((await response.body()).byteLength).toBeGreaterThan(0);
    }
  });

  for (const path of legacyCompatibilityAssetPaths) {
    test(`does not publish root WordPress asset URL: ${path}`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(404);
    });
  }

  for (const check of legacyScheduleMobileChecks) {
    test(`keeps legacy schedule tables horizontally scannable on mobile: ${check.path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 1000 });
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      await expect(page.locator('.entry-content .wp-block-table').first()).toBeVisible();

      const metrics = await page.evaluate(() => {
        const figures = Array.from(
          document.querySelectorAll<HTMLElement>('.entry-content .wp-block-table')
        );

        return {
          documentHeight: document.documentElement.scrollHeight,
          tables: figures.map((figure) => {
            const table = figure.querySelector<HTMLElement>('table');

            return {
              figureClientWidth: figure.clientWidth,
              figureScrollWidth: figure.scrollWidth,
              overflowX: getComputedStyle(figure).overflowX,
              tableDisplay: table ? getComputedStyle(table).display : '',
              tableWidth: table?.getBoundingClientRect().width ?? 0,
            };
          }),
        };
      });

      expect(metrics.documentHeight).toBeLessThan(check.maxDocumentHeight);
      expect(metrics.tables.length).toBeGreaterThan(0);
      for (const table of metrics.tables) {
        expect(table.overflowX).toBe('auto');
        expect(table.tableDisplay).toBe('table');
        expect(table.figureScrollWidth).toBeGreaterThanOrEqual(table.figureClientWidth);
        expect(table.tableWidth).toBeGreaterThanOrEqual(table.figureClientWidth - 1);
      }
    });
  }

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
        expect(await page.locator('main a').count()).toBeGreaterThanOrEqual(check.minLinks);

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
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );

        expect(horizontalOverflow).toBeLessThanOrEqual(4);
      });
    }
  }

  for (const check of legacy2024TitleCanonicalChecks) {
    test(`uses decided 2024 title and canonical policy: ${check.path}`, async ({ page }) => {
      const response = await page.goto(check.path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(check.title);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', `https://pycon.hk${check.canonicalPath}`);
      await expect(canonical).not.toHaveAttribute('href', /legacy\.pycon\.hk/u);
    });
  }
});
