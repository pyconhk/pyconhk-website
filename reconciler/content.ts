import { createHash } from 'node:crypto';

export function newsContentHash(tree: {
  truncated?: boolean;
  tree: { path: string; type: string; mode: string; sha: string }[];
}) {
  if (tree.truncated)
    throw new Error('News tree is truncated; refusing an incomplete content version');
  const entries = tree.tree
    .filter((entry) =>
      /^website\/(?:outstatic\/content\/(?:2025|2026)-posts\/|public\/outstatic\/images\/)/u.test(
        entry.path
      )
    )
    .map(({ path, mode, sha }) => ({ path, mode, sha }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return createHash('sha256').update(JSON.stringify(entries)).digest('hex');
}
