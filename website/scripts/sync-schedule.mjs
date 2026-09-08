import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fetchProgramme } from './programme-snapshot.mjs';

const { values } = parseArgs({ options: {
  event: { type: 'string' }, url: { type: 'string' }, output: { type: 'string' },
  baseline: { type: 'string' }, environment: { type: 'string', default: 'production' },
  'allow-unpublished': { type: 'boolean', default: false },
} });

try {
  if (!/^pyconhk\d{4}$/.test(values.event ?? '') || !values.url || !values.output
    || !['production', 'test', 'preview'].includes(values.environment)) {
    throw new Error('Required: --event pyconhkYYYY --url PUBLIC_HTTPS_URL --output PATH [--environment production|test|preview].');
  }
  const url = new URL(values.url);
  if (url.protocol !== 'https:' || url.username || url.password || !url.pathname.includes(`/${values.event}/schedule/export/`)) {
    throw new Error('Use an anonymous public HTTPS schedule export for the configured event.');
  }
  const baseline = values.baseline ? JSON.parse(await readFile(values.baseline, 'utf8')) : undefined;
  const snapshot = await fetchProgramme({
    event: values.event, environment: values.environment, sourceUrl: url.href,
    baseline, allowUnpublished: values['allow-unpublished'],
  });
  const output = resolve(values.output);
  await mkdir(dirname(output), { recursive: true });
  const temporary = `${output}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, output);
  const result = {
    changed: baseline?.hash !== snapshot.hash, status: snapshot.status,
    snapshot_path: output, programme_hash: snapshot.hash, event: snapshot.event,
    environment: snapshot.environment, session_count: snapshot.sessions.length,
  };
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, Object.entries(result).map(([key, value]) => `${key}=${value}\n`).join(''));
  }
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
