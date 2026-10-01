export const defaultPublishedAt = '1970-01-01T00:00:00.000Z';

export function normalizePublishedAt(value: string | Date | null | undefined): string {
  if (value == null || (typeof value === 'string' && !value.trim())) {
    return defaultPublishedAt;
  }

  // Preserve Date values from legacy callers as well as Decap timestamp strings.
  const date = value instanceof Date ? value : new Date(value.trim());
  if (Number.isNaN(date.getTime())) {
    throw new Error('News publishedAt must be a valid date');
  }
  return date.toISOString();
}
