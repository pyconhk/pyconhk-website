import {
  type CmsEnvironment,
  getCmsContentRoot,
  getCmsDefaultLocale,
  getCmsLocales,
  getCmsMediaFolder,
  getCmsPublicFolder,
} from "./env";

type CmsField = Record<string, unknown>;
type CmsCollection = Record<string, unknown>;
type CmsConfigOptions = {
  contentRoot?: string;
  mediaFolder?: string;
  publicFolder?: string;
  publishMode?: string;
};

function createPostFields(): CmsField[] {
  return [
    { label: "Title", name: "title", widget: "string", i18n: true },
    {
      label: "Description",
      name: "description",
      widget: "text",
      hint: "Short summary used for cards, meta descriptions, and social previews.",
      i18n: true,
    },
    {
      label: "Publish Date",
      name: "publishedAt",
      widget: "datetime",
      i18n: "duplicate",
    },
    {
      label: "Status",
      name: "status",
      widget: "select",
      options: ["draft", "published"],
      default: "draft",
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
      min: 1,
      i18n: true,
    },
    { label: "Body", name: "body", widget: "markdown", i18n: true },
  ];
}

const postCollectionDefinitions = [
  { name: "posts", label: "2026 Posts", year: 2026 },
  { name: "posts_2025", label: "2025 Posts", year: 2025 },
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
): CmsCollection {
  const { label, name, year } = definition;

  return {
    name,
    label,
    folder: `${contentRoot}/${year}-posts`,
    create: true,
    i18n: true,
    extension: "mdx",
    format: "frontmatter",
    identifier_field: "slug",
    slug: "{{slug}}",
    summary: "{{title}}",
    editor: { preview: false },
    fields: createPostFields(),
  };
}

export function createCmsConfig(
  environment: CmsEnvironment,
  options: CmsConfigOptions = {},
): CmsConfig {
  const contentRoot = options.contentRoot || getCmsContentRoot(environment);
  const locales = getCmsLocales(environment);

  return {
    i18nStructure: "multiple_files",
    publishMode: options.publishMode || "editorial_workflow",
    mediaFolder: options.mediaFolder || getCmsMediaFolder(environment),
    publicFolder: options.publicFolder || getCmsPublicFolder(environment),
    locales,
    defaultLocale: getCmsDefaultLocale(environment, locales),
    collections: postCollectionDefinitions.map((definition) =>
      createPostCollection(contentRoot, definition),
    ),
  };
}
