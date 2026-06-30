import {
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

const postFields: CmsField[] = [
  {
    label: "Collection Year",
    name: "collectionYear",
    widget: "string",
    pattern: ["^\\d{4}$", "Use a four-digit year like 2026."],
    hint: "Used to place the file under folders like 2026-posts.",
    i18n: "duplicate",
  },
  { label: "Title", name: "title", widget: "string", i18n: true },
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
  { label: "Body", name: "body", widget: "markdown", i18n: true },
];

type CmsConfig = {
  i18nStructure: string;
  publishMode: string;
  mediaFolder: string;
  publicFolder: string;
  locales: string[];
  defaultLocale: string;
  collections: CmsCollection[];
};

export function getCmsConfig(): CmsConfig {
  return createCmsConfig();
}

export function createCmsConfig(options: CmsConfigOptions = {}): CmsConfig {
  const contentRoot = options.contentRoot || getCmsContentRoot();
  const locales = getCmsLocales();

  return {
    i18nStructure: "multiple_files",
    publishMode: options.publishMode || "editorial_workflow",
    mediaFolder: options.mediaFolder || getCmsMediaFolder(),
    publicFolder: options.publicFolder || getCmsPublicFolder(),
    locales,
    defaultLocale: getCmsDefaultLocale(locales),
    collections: [
      {
        name: "posts",
        label: "Posts",
        folder: contentRoot,
        path: "{{collectionYear}}-posts/{{slug}}",
        create: true,
        i18n: true,
        extension: "mdx",
        format: "frontmatter",
        identifier_field: "slug",
        slug: "{{slug}}",
        summary: "{{collectionYear}} - {{slug}} - {{title}}",
        editor: { preview: false },
        fields: postFields,
      },
    ],
  };
}
