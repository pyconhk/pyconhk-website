import path from 'node:path';
import sharp from 'sharp';

const publicRoot = path.resolve('public');
const cache = new Map<string, Promise<LogoBounds | null>>();

type LogoBounds = {
  width: number;
  height: number;
  left: number;
  top: number;
  canvasWidth: number;
  canvasHeight: number;
};

// Measure at build time so transparent padding does not shrink the visible mark.
// The original image bytes and aspect ratio stay unchanged.
export function getLogoBounds(source: string): Promise<LogoBounds | null> {
  if (!source.startsWith('/') || source.startsWith('//')) return Promise.resolve(null);
  const filename = path.resolve(publicRoot, `.${source}`);
  if (!filename.startsWith(`${publicRoot}${path.sep}`)) return Promise.resolve(null);
  let result = cache.get(filename);
  if (!result) {
    result = measure(filename);
    cache.set(filename, result);
  }
  return result;
}

async function measure(filename: string): Promise<LogoBounds | null> {
  const { data, info } = await sharp(filename)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + info.channels - 1] === 0)
        continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return null;
  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    canvasWidth: info.width,
    canvasHeight: info.height,
  };
}
