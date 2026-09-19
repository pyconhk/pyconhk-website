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
      // Background-removal remnants can span the entire canvas at very low
      // opacity. They must not displace the visible artwork inside its plate.
      if (data[(y * info.width + x) * info.channels + info.channels - 1] <= 32)
        continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return null;
  // Retain the soft antialiased edge surrounding the visible artwork.
  const padding = Math.max(1, Math.ceil(Math.max(info.width, info.height) / 500));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(info.width - 1, right + padding);
  bottom = Math.min(info.height - 1, bottom + padding);
  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    canvasWidth: info.width,
    canvasHeight: info.height,
  };
}
