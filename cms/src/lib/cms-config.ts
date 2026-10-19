import {
  type CmsEnvironment,
  getCmsContentRoot,
  getCmsDefaultLocale,
  getCmsLocales,
  getCmsMediaFolder,
  getCmsPublicFolder,
  getCmsStage,
} from "./env";

type CmsField = Record<string, unknown>;
type CmsCollection = Record<string, unknown>;
type CmsConfigOptions = {
  contentRoot?: string;
  mediaFolder?: string;
  publicFolder?: string;
  publishMode?: string;
};

export const cmsEditorLocale = "pycon-en";
export const websiteVisibilityOptions = [
  { label: "Draft — do not publish", value: "draft" },
  { label: "Publish this language after checks", value: "published" },
];

function createPostFields(year: number): CmsField[] {
  return [
    {
      label: "Website visibility",
      name: "status",
      widget: year === 2026 ? "website-visibility" : "select",
      hint:
        year === 2026
          ? "Choose visibility for this language, then Save. English can publish first; keep unfinished translations as Draft. Copying another locale also copies its visibility, so review it before saving."
          : "Choose visibility, then Save. Archived 2025 News requires all five translations to pass checks together before publishing.",
      options:
        year === 2026
          ? websiteVisibilityOptions
          : [
              websiteVisibilityOptions[0],
              {
                label: "Publish all five translations after checks",
                value: "published",
              },
            ],
      default: "draft",
      i18n: year === 2026 ? true : "duplicate",
    },
    {
      label: "Title",
      name: "title",
      widget: "string",
      required: false,
      i18n: true,
    },
    {
      label: "Description",
      name: "description",
      widget: "text",
      required: false,
      hint: "Short summary used for cards, meta descriptions, and social previews.",
      i18n: true,
    },
    {
      label: "Publish Date",
      name: "publishedAt",
      widget: "datetime",
      required: false,
      i18n: "duplicate",
    },
    {
      label: "Slug",
      name: "slug",
      widget: "string",
      hint: "Shared across all locales. This is also used in the filename.",
      i18n: "duplicate",
    },
    {
      label: "Author",
      name: "author",
      widget: "object",
      i18n: true,
      collapsed: true,
      fields: [
        {
          label: "Name",
          name: "name",
          widget: "string",
          default: "PyCon HK",
          i18n: true,
        },
        {
          label: "Avatar URL",
          name: "picture",
          widget: "string",
          required: false,
          i18n: "duplicate",
        },
      ],
    },
    {
      label: "Cover Image",
      name: "coverImage",
      widget: "image",
      required: false,
      i18n: "duplicate",
    },
    {
      label: "Tags",
      name: "tags",
      widget: "list",
      field: { label: "Tag", name: "tag", widget: "string" },
      required: false,
      i18n: true,
    },
    {
      label: "Body",
      name: "body",
      widget: "markdown",
      required: false,
      i18n: true,
    },
  ];
}

const postCollectionDefinitions = [
  { name: "posts", label: "2026 News", year: 2026 },
  { name: "posts_2025", label: "2025 News", year: 2025 },
] as const;

type CmsConfig = {
  i18nStructure: string;
  publishMode: string;
  mediaFolder: string;
  publicFolder: string;
  locales: string[];
  defaultLocale: string;
  collections: CmsCollection[];
};

function createPostCollection(
  contentRoot: string,
  definition: (typeof postCollectionDefinitions)[number],
  stage: ReturnType<typeof getCmsStage>,
): CmsCollection {
  const { label, name, year } = definition;

  return {
    // Keep the test editor's collection IDs distinct from production.
    name: stage === "test" ? `${name}_test` : name,
    label,
    folder: `${contentRoot}/${year}-posts`,
    create: true,
    i18n:
      year === 2025
        ? {
            locales: ["en", "zh-hk", "zh-hant", "zh-hans", "ja"],
            default_locale: "en",
          }
        : true,
    extension: "mdx",
    format: "news-frontmatter",
    identifier_field: "slug",
    slug: "{{slug}}",
    summary: "{{title}}",
    editor: { preview: false },
    fields: createPostFields(year),
  };
}

export function createCmsConfig(
  environment: CmsEnvironment,
  options: CmsConfigOptions = {},
): CmsConfig {
  const contentRoot = options.contentRoot || getCmsContentRoot(environment);
  const locales = getCmsLocales(environment);
  const stage = getCmsStage(environment);

  return {
    i18nStructure: "multiple_files",
    publishMode: options.publishMode || "simple",
    mediaFolder: options.mediaFolder || getCmsMediaFolder(environment),
    publicFolder: options.publicFolder || getCmsPublicFolder(environment),
    locales,
    defaultLocale: getCmsDefaultLocale(environment, locales),
    collections: postCollectionDefinitions.map((definition) =>
      createPostCollection(contentRoot, definition, stage),
    ),
  };
}
