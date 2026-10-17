import { expect, test } from '@playwright/test';
import type { ScheduleItem } from '../../../lib/programme/types';

// Exercise the SSR missing-source path with PROGRAMME_ENVIRONMENT=test,
// PROGRAMME_SOURCE_EVENT=pyconhk2026 and PROGRAMME_SNAPSHOT_PATH set to
// src/years/2026/e2e/fixtures/speaker-avatars-missing.public.json at build time.
// Set SPEAKER_AVATAR_MISSING_FIXTURE=1 when running that focused test.

test('a failed speaker-page photo keeps the portrait, initials and name caption', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2026/en/schedule/');
  const payload = JSON.parse(
    (await page.locator('#programme-data').textContent()) ?? '{}'
  );
  const session = (payload.sessions as ScheduleItem[]).find((item) =>
    item.speakerProfiles?.some((person) => person.avatar)
  );
  expect(session, 'The public programme includes a speaker photo').toBeDefined();
  if (!session) return;
  const person = session.speakerProfiles?.find((profile) => profile.avatar);
  if (!person) return;
  await page.locator(`[data-day="${session.date}"]`).click();
  await page.locator('[data-programme-search]').fill(session.title);
  await page
    .locator(`[data-session-card="${session.id}"] [data-session-details]`)
    .click();
  const profile = page
    .locator('#modal-details [data-speaker-profile]')
    .filter({ has: page.getByRole('link', { name: person.name, exact: true }) });
  await profile.locator('[data-speaker-link]').click();
  const portrait = page.locator('[data-speaker-page] [data-speaker-portrait]');
  await expect(portrait).toHaveAttribute('aria-label', person.name);
  const image = portrait.locator('img');
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
      )
    )
    .toBe(true);
  const before = await portrait.boundingBox();
  const source = await image.evaluate((element: HTMLImageElement) => element.src);
  await page.route(
    (url) => url.href === source,
    (route) => route.abort()
  );
  await page.reload();
  await expect(portrait).toHaveAttribute('data-avatar-state', 'initials');
  await expect(portrait.locator('[data-speaker-initials]')).not.toHaveText('');
  await expect(portrait).toHaveAccessibleName(person.name);
  await expect(image).toBeHidden();
  await expect(page.locator('[data-speaker-page] [data-person-card] h4')).toHaveText(
    person.name
  );
  const after = await portrait.boundingBox();
  expect(before?.width).toBe(176);
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
});

test('a missing public avatar keeps its speaker slot and accessible name', async ({
  page,
}) => {
  await page.goto('/2026/en/schedule/');
  const payload = JSON.parse(
    (await page.locator('#programme-data').textContent()) ?? '{}'
  );
  const session = (payload.sessions as ScheduleItem[]).find(
    (item) =>
      (item.speakerProfiles?.length ?? 0) >= 3 &&
      item.speakerProfiles?.some((person) => !person.avatar)
  );
  if (process.env.SPEAKER_AVATAR_MISSING_FIXTURE === '1') {
    expect(
      session,
      'The explicit test fixture must exercise empty avatar URLs'
    ).toBeDefined();
    expect(session?.speakerProfiles?.map((person) => person.name)).toEqual([
      'First Speaker',
      'Middle Speaker',
      'Last Speaker',
    ]);
  }
  test.skip(
    !session,
    'Requires a published three-speaker session with a missing public avatar.'
  );
  if (!session) return;
  await page.locator(`[data-day="${session.date}"]`).click();
  await page.locator('[data-programme-search]').fill(session.title);
  const card = page.locator(`[data-session-card="${session.id}"]`);
  const portraits = card.locator('.programme-avatars [data-speaker-portrait]');
  await expect(portraits).toHaveCount(session.speakers.length);
  for (const [index, person] of (session.speakerProfiles ?? []).entries()) {
    await expect(portraits.nth(index)).toHaveAttribute('aria-label', person.name);
    if (person.avatar) continue;
    await expect(portraits.nth(index)).toHaveAttribute('data-avatar-state', 'initials');
    await expect(portraits.nth(index).locator('img')).toHaveCount(0);
    await expect(
      portraits.nth(index).locator('[data-speaker-initials]')
    ).not.toHaveText('');
  }
  await card.locator('[data-session-details]').click();
  await expect(page.locator('#modal-details [data-speaker-profile]')).toHaveCount(
    session.speakers.length
  );
  const missing = session.speakerProfiles?.find((person) => !person.avatar);
  if (!missing) return;
  await expect(
    page.locator('#modal-details').getByRole('img', { name: missing.name, exact: true })
  ).toBeVisible();
});

test('three speakers retain their slots when the middle and last photos are unavailable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/2026/en/schedule/');
  const payload = JSON.parse(
    (await page.locator('#programme-data').textContent()) ?? '{}'
  );
  const session = (payload.sessions as ScheduleItem[]).find(
    (item) => (item.speakerProfiles?.length ?? 0) >= 3
  );
  expect(
    session,
    'The public programme fixture includes a three-speaker session'
  ).toBeDefined();
  if (!session) return;
  const selected = session;

  async function showSession() {
    await page.locator(`[data-day="${selected.date}"]`).click();
    await page.locator('[data-programme-search]').fill(selected.title);
    const card = page.locator(`[data-session-card="${selected.id}"]`);
    await card.scrollIntoViewIfNeeded();
    return card;
  }

  const original = await showSession();
  const blocked = new Set<string>();
  for (const index of [1, 2]) {
    const image = original
      .locator('.programme-avatars [data-speaker-portrait]')
      .nth(index)
      .locator('img');
    if (await image.count())
      blocked.add(await image.evaluate((element: HTMLImageElement) => element.src));
    const profileSource = await page
      .locator(`[data-session-content="${selected.id}"]`)
      .evaluate((element: HTMLTemplateElement, position) => {
        const portrait = element.content.querySelectorAll('[data-speaker-portrait]')[
          position
        ];
        const image = portrait?.querySelector('img');
        return image
          ? new URL(image.getAttribute('src') ?? '', location.href).href
          : '';
      }, index);
    if (profileSource) blocked.add(profileSource);
  }
  // Exercise the same fallback for failed photo requests as for empty source URLs.
  await page.route('**/*', (route) =>
    blocked.has(route.request().url()) ? route.abort() : route.continue()
  );
  await page.reload();
  const card = await showSession();
  const portraits = card.locator('.programme-avatars [data-speaker-portrait]');
  await expect(portraits).toHaveCount(session.speakers.length);
  for (const [index, name] of session.speakers.entries()) {
    await expect(portraits.nth(index)).toHaveAttribute('aria-label', name);
    await expect(card.locator('.programme-speakers > p')).toContainText(name);
  }
  for (const index of [1, 2]) {
    const portrait = portraits.nth(index);
    await expect(portrait).toHaveAttribute('data-avatar-state', 'initials');
    await expect(portrait.locator('[data-speaker-initials]')).not.toHaveText('');
    await expect(portrait.locator('img')).toBeHidden();
  }
  const boxes = await portraits.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    })
  );
  expect(
    boxes.every((box) => box.y === boxes[0].y && box.width === 32 && box.height === 32)
  ).toBe(true);
  expect(boxes[1].x - boxes[0].x).toBeGreaterThan(0);
  expect(boxes[1].x - boxes[0].x).toBeLessThan(32);

  await card.locator('[data-session-details]').click();
  const profiles = page.locator('#modal-details [data-speaker-profile]');
  await expect(profiles).toHaveCount(session.speakers.length);
  for (const [index, name] of session.speakers.entries()) {
    await expect(
      profiles.nth(index).getByRole('img', { name, exact: true })
    ).toBeVisible();
  }
  for (const index of [1, 2]) {
    const portrait = profiles.nth(index).locator('[data-speaker-portrait]');
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveAttribute('data-avatar-state', 'initials');
    await expect(portrait.locator('img')).toBeHidden();
  }
});
