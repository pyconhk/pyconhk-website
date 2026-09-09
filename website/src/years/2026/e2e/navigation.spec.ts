import { expect, test } from '@playwright/test';
import { setTheme } from './theme';

test('visible talk links reuse prefetched HTML without another stylesheet round trip', async ({
  page,
  context,
}) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 10_000_000,
    uploadThroughput: 10_000_000,
  });
  const talkPath = '/2026/en/talks/python-history-software-engineering-and-ai/';
  let prefetched = false;
  let usedPrefetch = false;
  let clicked = false;
  const newStylesheets: string[] = [];
  cdp.on('Network.responseReceived', ({ type, response }) => {
    if (new URL(response.url).pathname === talkPath) {
      if (type === 'Other') prefetched = true;
      if (type === 'Fetch')
        usedPrefetch = Boolean(response.fromPrefetchCache || response.fromDiskCache);
    }
  });
  page.on('request', (request) => {
    if (clicked && request.resourceType() === 'stylesheet')
      newStylesheets.push(request.url());
  });
  await page.goto('/2026/en/');
  const card = page.locator(`[data-featured-speaker][href="${talkPath}"]`);
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => prefetched).toBe(true);
  clicked = true;
  await card.click();
  await expect(page.locator('[data-featured-talk="NLFQSW"]')).toBeVisible();
  expect(usedPrefetch).toBe(true);
  expect(newStylesheets).toEqual([]);
  await expect(page.locator('main h1')).toContainText('Was, Is, Will Be');
});

for (const nativeTransitions of [true, false]) {
  test(`page navigation stays interactive with native transitions ${nativeTransitions}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript((native) => {
      const state = { transitions: 0, animations: [] as string[] };
      Object.assign(window, { navigationProbe: state });
      if (!native) {
        Object.defineProperty(document, 'startViewTransition', { value: undefined });
        return;
      }
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        transition.ready.then(() => {
          state.animations.push(
            ...document
              .getAnimations()
              .filter(
                (animation): animation is CSSAnimation =>
                  animation instanceof CSSAnimation
              )
              .map((animation) => animation.animationName)
              .filter((name) =>
                /view-transition|astroFade|astroSlide|heroEntranceFade/.test(name)
              )
          );
          state.transitions++;
        });
        return transition;
      };
    }, nativeTransitions);

    await page.goto('/2026/en/');
    await page
      .getByRole('navigation', { name: 'Main Navigation', exact: true })
      .getByRole('link', { name: 'About', exact: true })
      .click();
    await expect(page).toHaveURL(/\/2026\/en\/about\/?$/);
    await expect(page.locator('main[data-pagefind-body]')).toBeVisible();
    const transitionCount = () =>
      page.evaluate(
        () =>
          (window as unknown as Window & { navigationProbe: { transitions: number } })
            .navigationProbe.transitions
      );
    if (nativeTransitions) await expect.poll(transitionCount).toBe(1);

    // The next control must work after a client-side swap, without a reload.
    await setTheme(page, 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'dark');
    await page.goBack();
    await expect(page).toHaveURL(/\/2026\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'dark');
    if (nativeTransitions) {
      // Resizing the viewport can cancel a pending native view transition.
      await expect.poll(transitionCount).toBe(2);
      expect(
        await page.evaluate(
          () =>
            (
              window as unknown as Window & {
                navigationProbe: { animations: string[] };
              }
            ).navigationProbe.animations
        )
      ).toEqual([]);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('[data-mobile-nav-trigger]');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  });
}
