import { test } from '@playwright/test';
import { verifyPublishedPages } from '../../../../e2e/support/published-pages';

test('2018 published pages and bundled assets resolve over HTTP', async ({
  request,
}) => {
  test.setTimeout(60_000);
  await verifyPublishedPages(request, '2018');
});
