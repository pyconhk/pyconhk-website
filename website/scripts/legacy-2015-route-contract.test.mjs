import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import routeContract from '../src/years/2015/data/routes.json' with { type: 'json' };

const distDir = new URL('../dist/', import.meta.url);

function outputFileForRoute(route) {
  const clean = route.replace(/^\/|\/$/gu, '');
  return path.join(distDir.pathname, clean, 'index.html');
}

describe('PyCon HK 2015 route contract', () => {
  it('has no duplicate required routes', () => {
    assert.equal(
      new Set(routeContract.requiredRoutes).size,
      routeContract.requiredRoutes.length
    );
  });

  it('includes the year-scoped photos route instead of top-level-only photos', () => {
    assert.ok(routeContract.requiredRoutes.includes('/2015/photos/'));
    assert.deepEqual(routeContract.migratedTopLevelRoutes, [
      { from: '/conference-highlights/2015-photos/', to: '/2015/photos/' },
    ]);
  });

  it('emits one built HTML file for every required 2015 route', () => {
    const missing = routeContract.requiredRoutes
      .map((route) => [route, outputFileForRoute(route)])
      .filter(([, filePath]) => !fs.existsSync(filePath));

    assert.deepEqual(missing, []);
  });
});
