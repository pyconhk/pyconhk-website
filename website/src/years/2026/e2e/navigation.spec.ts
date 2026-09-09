import { expect, test } from '@playwright/test';

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

    // The next control must work after a client-side swap, without a reload.
    await page.locator('[data-theme-select]').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'dark');
    await page.goBack();
    await expect(page).toHaveURL(/\/2026\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('data-conference-theme', 'dark');
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('[data-mobile-nav-trigger]');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');

    if (nativeTransitions) {
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              (
                window as unknown as Window & {
                  navigationProbe: { transitions: number };
                }
              ).navigationProbe.transitions
          )
        )
        .toBeGreaterThanOrEqual(2);
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
  });
}
