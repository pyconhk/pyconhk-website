import { buildPagefind } from './build-pagefind';
import { copyEventAssets } from './copy-event-assets';
import { finalizeEventRedirects } from './finalize-event-redirects';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { fetchProgramme, validateSnapshot } from '../src/lib/programme/snapshot';

export default function conferenceBuild(): AstroIntegration {
  let root = '';
  return {
    name: 'pyconhk:conference-build',
    hooks: {
      'astro:config:setup': async ({ command, config, logger }) => {
        root = fileURLToPath(config.root);
        if (command !== 'build') return;
        const event = process.env.PROGRAMME_SOURCE_EVENT ?? 'pyconhk2026';
        const environment = process.env.PROGRAMME_ENVIRONMENT ?? 'production';
        if (environment === 'production' && event !== 'pyconhk2026') {
          throw new Error('Production cannot publish a previous-year sample programme.');
        }
        // Explicit snapshots keep offline fixtures and local reproduction deterministic.
        if (process.env.PROGRAMME_SNAPSHOT_PATH) {
          validateSnapshot(JSON.parse(await readFile(resolve(root, process.env.PROGRAMME_SNAPSHOT_PATH), 'utf8')), event, environment);
          return;
        }
        const sourceUrl = process.env.PROGRAMME_SOURCE_URL
          ?? `https://${event === 'pyconhk2026' ? 'cfp.pycon.hk' : 'pretalx.com'}/${event}/schedule/export/schedule.json`;
        const output = resolve(root, process.env.PROGRAMME_OUTPUT_PATH ?? `.cache/programme/${environment}/${event}.json`);
        const baselinePath = process.env.PROGRAMME_BASELINE_PATH;
        const baseline = baselinePath ? validateSnapshot(JSON.parse(await readFile(baselinePath, 'utf8')), event, environment) : undefined;
        const snapshot = await fetchProgramme({ event, environment, sourceUrl, baseline, allowUnpublished: true });
        await mkdir(dirname(output), { recursive: true });
        const temporary = `${output}.${process.pid}.tmp`;
        await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
        await rename(temporary, output);
        process.env.PROGRAMME_SNAPSHOT_PATH = output;
        logger.info(`Loaded ${snapshot.sessions.length} public sessions for ${event} (${environment}).`);
      },
      'astro:build:done': async () => {
        await copyEventAssets(root);
        await finalizeEventRedirects(root);
        await buildPagefind(root);
      },
    },
  };
}
