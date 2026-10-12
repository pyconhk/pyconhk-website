function normalizeOptionalString(
  data: Record<string, unknown>,
  field: string,
  label = field,
): void {
  const value = data[field];
  if (value == null || (typeof value === "string" && !value.trim())) {
    delete data[field];
  } else if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
}

// Decap represents cleared optional widgets as null. Use omission at every
// boundary, without coercing invalid types or changing nonempty text/body.
export function normalizeNewsFrontmatter(
  input: unknown,
): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("News frontmatter must be an object");
  }
  const data = { ...input } as Record<string, unknown>;
  for (const field of [
    "title",
    "description",
    "publishedAt",
    "coverImage",
    "body",
  ]) {
    normalizeOptionalString(data, field);
  }
  if ("slug" in data && typeof data.slug !== "string") {
    throw new Error("slug must be a string");
  }
  if ("tags" in data) {
    if (data.tags == null || (Array.isArray(data.tags) && !data.tags.length)) {
      delete data.tags;
    } else if (
      !Array.isArray(data.tags) ||
      data.tags.some((tag) => typeof tag !== "string")
    ) {
      throw new Error("tags must be a list of strings");
    }
  }
  if ("author" in data) {
    if (
      !data.author ||
      typeof data.author !== "object" ||
      Array.isArray(data.author)
    ) {
      throw new Error("author must be an object");
    }
    const author = { ...data.author } as Record<string, unknown>;
    if ("name" in author && typeof author.name !== "string") {
      throw new Error("author.name must be a string");
    }
    normalizeOptionalString(author, "picture", "author.picture");
    data.author = author;
  }
  return data;
}
