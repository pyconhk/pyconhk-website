import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import sharp from 'sharp';

const defaultLocalBase = 'http://127.0.0.1:8790';
const defaultLiveBase = 'https://pycon.hk';

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

function parseArgs(argv) {
  const args = {
    concurrency: 1,
    localBase: defaultLocalBase,
    liveBase: defaultLiveBase,
    outDir: path.join(os.tmpdir(), 'pyconhk-ui-diff'),
    paths: [],
    viewports: ['desktop', 'mobile'],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--path') {
      args.paths.push(normalizeUrlPath(argv[index + 1]));
      index += 1;
      continue;
    }

    if (arg.startsWith('--path=')) {
      args.paths.push(normalizeUrlPath(arg.slice('--path='.length)));
      continue;
    }

    if (arg === '--paths') {
      args.paths.push(
        ...argv[index + 1].split(',').filter(Boolean).map(normalizeUrlPath)
      );
      index += 1;
      continue;
    }

    if (arg.startsWith('--paths=')) {
      args.paths.push(
        ...arg.slice('--paths='.length).split(',').filter(Boolean).map(normalizeUrlPath)
      );
      continue;
    }

    if (arg === '--viewport') {
      args.viewports = [argv[index + 1]];
      index += 1;
      continue;
    }

    if (arg.startsWith('--viewport=')) {
      args.viewports = [arg.slice('--viewport='.length)];
      continue;
    }

    if (arg === '--viewports') {
      args.viewports = argv[index + 1].split(',').filter(Boolean);
      index += 1;
      continue;
    }

    if (arg.startsWith('--viewports=')) {
      args.viewports = arg.slice('--viewports='.length).split(',').filter(Boolean);
      continue;
    }

    if (arg === '--out') {
      args.outDir = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--out=')) {
      args.outDir = arg.slice('--out='.length);
      continue;
    }

    if (arg === '--local-base') {
      args.localBase = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--local-base=')) {
      args.localBase = arg.slice('--local-base='.length);
      continue;
    }

    if (arg === '--live-base') {
      args.liveBase = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--live-base=')) {
      args.liveBase = arg.slice('--live-base='.length);
      continue;
    }

    if (arg === '--concurrency') {
      args.concurrency = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith('--concurrency=')) {
      args.concurrency = Number(arg.slice('--concurrency='.length));
      continue;
    }

    if (!arg.startsWith('--')) {
      args.paths.push(normalizeUrlPath(arg));
    }
  }

  args.paths = [...new Set(args.paths)];
  args.viewports = [...new Set(args.viewports)];

  if (args.paths.length === 0) {
    throw new Error('Pass at least one URL path with --path or --paths.');
  }

  for (const viewport of args.viewports) {
    if (!viewports[viewport]) {
      throw new Error(`Unknown viewport "${viewport}". Use desktop or mobile.`);
    }
  }

  if (!Number.isInteger(args.concurrency) || args.concurrency < 1) {
    throw new Error('--concurrency must be a positive integer.');
  }

  return args;
}

function normalizeUrlPath(urlPath) {
  const cleanPath = urlPath.trim();

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return new URL(cleanPath).pathname;
  }

  const withLeadingSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function slugFor(urlPath) {
  const slug = urlPath.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-');
  return slug || 'home';
}

function joinBase(base, urlPath) {
  return new URL(urlPath, `${base.replace(/\/$/, '')}/`).href;
}

function runCommand(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const output = [];
    const errors = [];
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => {
        if (child.exitCode === null) {
          child.kill('SIGKILL');
        }
      }, 1500);
    }, timeoutMs);

    child.stdout.on('data', (chunk) => output.push(chunk));
    child.stderr.on('data', (chunk) => errors.push(chunk));
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        code,
        stderr: Buffer.concat(errors).toString('utf8'),
        stdout: Buffer.concat(output).toString('utf8'),
      });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: 1, stderr: error.message, stdout: '' });
    });
  });
}

async function captureScreenshot({ url, viewport, outputPath }) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pyconhk-pw-'));
  const commandResult = await runCommand(
    'bunx',
    [
      'playwright',
      'screenshot',
      '--browser=chromium',
      '--channel=chrome',
      '--block-service-workers',
      '--timeout=20000',
      '--wait-for-timeout=1000',
      `--user-data-dir=${userDataDir}`,
      `--viewport-size=${viewport.width},${viewport.height}`,
      url,
      outputPath,
    ],
    30_000
  );
  await fs.rm(userDataDir, { recursive: true, force: true });

  const screenshotWasWritten = await fileHasBytes(outputPath);

  if (commandResult.code !== 0) {
    if (screenshotWasWritten) {
      const info = await extractPageInfo(url);

      return {
        ok: true,
        path: outputPath,
        warning: commandResult.stderr.trim() || commandResult.stdout.trim(),
        ...info,
      };
    }

    return {
      ok: false,
      error: commandResult.stderr.trim() || commandResult.stdout.trim(),
    };
  }

  const info = await extractPageInfo(url);

  return {
    ok: true,
    path: outputPath,
    ...info,
  };
}

async function fileHasBytes(filePath) {
  try {
    return (await fs.stat(filePath)).size > 0;
  } catch {
    return false;
  }
}

async function extractPageInfo(url) {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'pyconhk-ui-diff/1.0' },
      signal: AbortSignal.timeout(12_000),
    });
    const html = await response.text();
    const title = stripTags(matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
    const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean);
    const imageCount = [...html.matchAll(/<img\b/gi)].length;
    const textSample = stripTags(html).replace(/\s+/g, ' ').trim().slice(0, 500);

    return {
      fetchStatus: response.status,
      h1,
      imageCount,
      textSample,
      title,
    };
  } catch (error) {
    return {
      fetchError: error.message,
      h1: [],
      imageCount: 0,
      textSample: '',
      title: '',
    };
  }
}

function matchFirst(source, pattern) {
  const match = source.match(pattern);
  return match ? match[1] : '';
}

function stripTags(source) {
  return source
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function compareScreenshots(localPath, livePath, diffPath) {
  const local = await sharp(localPath).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const live = await sharp(livePath).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const width = Math.min(local.info.width, live.info.width);
  const height = Math.min(local.info.height, live.info.height);
  const localStride = local.info.width * 4;
  const liveStride = live.info.width * 4;
  const diff = Buffer.alloc(width * height * 4);
  let changed = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const localOffset = y * localStride + x * 4;
      const liveOffset = y * liveStride + x * 4;
      const diffOffset = (y * width + x) * 4;
      const distance =
        Math.abs(local.data[localOffset] - live.data[liveOffset]) +
        Math.abs(local.data[localOffset + 1] - live.data[liveOffset + 1]) +
        Math.abs(local.data[localOffset + 2] - live.data[liveOffset + 2]);

      if (distance > 60) {
        changed += 1;
        diff[diffOffset] = 255;
        diff[diffOffset + 1] = 32;
        diff[diffOffset + 2] = 32;
        diff[diffOffset + 3] = 255;
      } else {
        diff[diffOffset] = local.data[localOffset];
        diff[diffOffset + 1] = local.data[localOffset + 1];
        diff[diffOffset + 2] = local.data[localOffset + 2];
        diff[diffOffset + 3] = 80;
      }
    }
  }

  await sharp(diff, {
    raw: { width, height, channels: 4 },
  }).png().toFile(diffPath);

  return {
    changedPixels: changed,
    changedRatio: changed / (width * height),
    comparedHeight: height,
    comparedWidth: width,
    liveHeight: live.info.height,
    liveWidth: live.info.width,
    localHeight: local.info.height,
    localWidth: local.info.width,
  };
}

async function runQueue(items, concurrency, worker) {
  const results = [];
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const itemIndex = nextIndex;
        nextIndex += 1;
        results[itemIndex] = await worker(items[itemIndex]);
      }
    })
  );

  return results;
}

async function comparePath({ args, urlPath, viewportName }) {
  const viewport = viewports[viewportName];
  const slug = `${slugFor(urlPath)}-${viewportName}`;
  const localUrl = joinBase(args.localBase, urlPath);
  const liveUrl = joinBase(args.liveBase, urlPath);
  const localPath = path.join(args.outDir, `${slug}-local.png`);
  const livePath = path.join(args.outDir, `${slug}-live.png`);
  const diffPath = path.join(args.outDir, `${slug}-diff.png`);

  const [local, live] = await Promise.all([
    captureScreenshot({ url: localUrl, viewport, outputPath: localPath }),
    captureScreenshot({ url: liveUrl, viewport, outputPath: livePath }),
  ]);
  let diff = null;

  if (local.ok && live.ok) {
    diff = await compareScreenshots(localPath, livePath, diffPath);
  }

  return {
    diff,
    diffPath: local.ok && live.ok ? diffPath : null,
    live,
    liveUrl,
    local,
    localUrl,
    notes: summarizeDifference(local, live, diff),
    urlPath,
    viewport: viewportName,
  };
}

function summarizeDifference(local, live, diff) {
  const notes = [];

  if (!local.ok) {
    notes.push(`Local failed: ${local.error}`);
  } else if (local.warning) {
    notes.push('Local screenshot completed with a Playwright warning');
  }

  if (!live.ok) {
    notes.push(`Live failed: ${live.error}`);
  } else if (live.warning) {
    notes.push('Live screenshot completed with a Playwright warning');
  }

  if (!local.ok || !live.ok || !diff) {
    return notes;
  }

  if (local.fetchStatus !== live.fetchStatus) {
    notes.push(`HTTP differs: local ${local.fetchStatus}, live ${live.fetchStatus}`);
  }

  if (local.title !== live.title) {
    notes.push(`Title differs: local "${local.title}" vs live "${live.title}"`);
  }

  if (JSON.stringify(local.h1) !== JSON.stringify(live.h1)) {
    notes.push(`H1 differs: local ${JSON.stringify(local.h1)} vs live ${JSON.stringify(live.h1)}`);
  }

  if (local.imageCount !== live.imageCount) {
    notes.push(`HTML image count differs: local ${local.imageCount}, live ${live.imageCount}`);
  }

  if (diff.changedRatio > 0.35) {
    notes.push(`Large viewport visual delta: ${(diff.changedRatio * 100).toFixed(1)}%`);
  }

  if (notes.length === 0) {
    notes.push(`Small viewport visual delta: ${(diff.changedRatio * 100).toFixed(1)}%`);
  }

  return notes;
}

const args = parseArgs(process.argv.slice(2));
await fs.mkdir(args.outDir, { recursive: true });

const jobs = args.paths.flatMap((urlPath) =>
  args.viewports.map((viewportName) => ({ args, urlPath, viewportName }))
);
const results = await runQueue(jobs, args.concurrency, comparePath);
const summaryPath = path.join(args.outDir, 'summary.json');
await fs.writeFile(
  summaryPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
);

for (const result of results) {
  const status = result.local.ok && result.live.ok ? 'ok' : 'failed';
  console.log(
    `${status} ${result.urlPath} ${result.viewport}: ${result.notes.join('; ')}`
  );
}

console.log(`summary: ${summaryPath}`);
