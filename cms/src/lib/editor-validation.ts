import {
  type ConferenceContent,
  type ConferenceLocale,
  conferenceLocales,
  parseConferenceContent,
  validateConferenceTranslations,
} from "../../../website/src/lib/conference-schema";

type EntryData = Record<string, unknown>;
type EditorialEntry = {
  collection?: string;
  data?: EntryData;
  i18n?: Record<string, { data?: EntryData }>;
};

function localizedData(
  entry: EditorialEntry,
  locale: string,
): EntryData | undefined {
  return locale === "en" ? entry.data : entry.i18n?.[locale]?.data;
}

export function validateEditorialPublish(entry: EditorialEntry): void {
  if (entry.collection === "posts" || entry.collection === "posts_2025") {
    const locales =
      entry.collection === "posts"
        ? conferenceLocales
        : conferenceLocales.filter((locale) => locale !== "ko");
    const published = locales.some(
      (locale) => localizedData(entry, locale)?.status === "published",
    );
    if (!published) return;
    const incomplete = locales.filter((locale) => {
      const data = localizedData(entry, locale);
      const description =
        typeof data?.description === "string" ? data.description.trim() : "";
      const publishedAt = data?.publishedAt ?? entry.data?.publishedAt;
      const coverImage = data?.coverImage ?? entry.data?.coverImage;
      return (
        !data ||
        (data.status ?? entry.data?.status) !== "published" ||
        typeof data.title !== "string" ||
        !data.title.trim() ||
        typeof data.body !== "string" ||
        !data.body.trim() ||
        !description ||
        description.length > 240 ||
        /(?:\.\.\.|…)$/u.test(description) ||
        typeof publishedAt !== "string" ||
        Number.isNaN(Date.parse(publishedAt)) ||
        typeof coverImage !== "string" ||
        !coverImage.trim() ||
        !Array.isArray(data.tags) ||
        data.tags.length === 0 ||
        data.tags.some((tag) => typeof tag !== "string" || !tag.trim())
      );
    });
    if (incomplete.length > 0) {
      throw new Error(
        `Complete title, body, description (up to 240 characters, without an ellipsis), date, cover image and tags in every translation before publishing: ${incomplete.join(", ")}. You can still save an incomplete draft.`,
      );
    }
    for (const locale of locales) {
      const data = localizedData(entry, locale);
      if (!data) continue;
      for (const field of ["slug", "publishedAt", "coverImage"] as const) {
        if ((data[field] ?? entry.data?.[field]) !== entry.data?.[field]) {
          throw new Error(
            `${field} must match English in ${locale}; this field is shared across translations.`,
          );
        }
      }
    }
  }

  if (entry.collection === "conference_2026") {
    const contents: Partial<Record<ConferenceLocale, ConferenceContent>> = {};
    for (const locale of conferenceLocales) {
      const data = localizedData(entry, locale);
      if (!data) continue;
      contents[locale] = parseConferenceContent(
        { ...data, slug: data.slug ?? entry.data?.slug },
        locale,
      );
    }
    validateConferenceTranslations(contents);
  }
}
