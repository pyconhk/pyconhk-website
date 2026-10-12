import { FrontmatterInfer } from "decap-cms-core/dist/esm/formats/frontmatter.js";
import { normalizeNewsFrontmatter } from "./news-frontmatter";

// Decap serializes each locale independently. Normalizing here covers every
// translation without replacing the preSave entry's data/i18n envelope.
export const newsFrontmatterFormat = {
  fromFile(content: string) {
    const data = FrontmatterInfer.fromFile(content) as Record<string, unknown>;
    // Decap's YAML parser reads unquoted timestamps as Date objects.
    return normalizeNewsFrontmatter({
      ...data,
      ...(data.publishedAt instanceof Date
        ? { publishedAt: data.publishedAt.toISOString() }
        : {}),
    });
  },
  toFile(
    data: object,
    sortedKeys?: string[],
    comments?: Record<string, string>,
  ) {
    return FrontmatterInfer.toFile(
      normalizeNewsFrontmatter(data),
      sortedKeys,
      comments,
    );
  },
};
