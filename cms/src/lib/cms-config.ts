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

export const postCollectionDefinitions = [
  { name: "posts", label: "2026 News", year: 2026, previewAppearance: true },
  {
    name: "posts_2025",
    label: "2025 News",
    year: 2025,
    previewAppearance: false,
  },
] as const;

export const sprintCollectionDefinition = {
  name: "sprint_2026",
  label: "2026 Sprint",
  year: 2026,
} as const;

function createSprintFields(): CmsField[] {
  const shared = (label: string, name: string, hint?: string): CmsField => ({
    label,
    name,
    widget: "string",
    required: false,
    i18n: "duplicate",
    ...(hint ? { hint } : {}),
  });
  const localizedText = (label: string, name: string): CmsField => ({
    label,
    name,
    widget: "text",
    required: false,
    i18n: true,
  });
  const textList = (label: string, name: string): CmsField => ({
    label,
    name,
    widget: "list",
    required: false,
    default: [],
    i18n: true,
    field: { label: "Item", name: "item", widget: "string" },
  });

  return [
    { name: "slug", widget: "hidden", default: "settings", i18n: "duplicate" },
    {
      label: "Website visibility",
      name: "status",
      widget: "select",
      options: [
        { label: "Draft — do not publish", value: "draft" },
        {
          label: "Publish all six translations after checks",
          value: "published",
        },
      ],
      default: "draft",
      i18n: "duplicate",
      hint: "Sprint publishes all six languages together. Complete every translation before choosing Publish. Save stores your changes in CMS; the website changes only after checks and deployment succeed.",
    },
    localizedText("Introduction", "intro"),
    {
      label: "Sprint date",
      name: "date",
      widget: "datetime",
      date_format: "YYYY-MM-DD",
      time_format: false,
      format: "YYYY-MM-DD",
      picker_utc: true,
      required: false,
      i18n: "duplicate",
    },
    shared(
      "Start time (Hong Kong)",
      "startTime",
      "Optional. Use 24-hour time, for example 10:00.",
    ),
    shared(
      "End time (Hong Kong)",
      "endTime",
      "Optional. Use 24-hour time, for example 17:00.",
    ),
    {
      label: "Location",
      name: "location",
      widget: "string",
      required: false,
      i18n: true,
    },
    shared(
      "Registration URL",
      "registrationUrl",
      "Use an HTTPS link for Sprint registration.",
    ),
    shared(
      "Project proposal URL",
      "proposalUrl",
      "Use an HTTPS link for project and Sprint Lead proposals.",
    ),
    shared(
      "Project proposal deadline",
      "proposalDeadline",
      "Optional. Include the time zone, for example 2026-11-14T23:59:00+08:00 for Hong Kong time.",
    ),
    textList("Additional information", "items"),
    {
      label: "Questions and answers",
      name: "qa",
      widget: "list",
      required: false,
      default: [],
      i18n: true,
      summary: "{{fields.question}}",
      hint: "Use the same stable question IDs and order in all six languages.",
      fields: [
        {
          label: "Question ID",
          name: "id",
          widget: "string",
          required: false,
          hint: "Keep this ID unchanged across translations, for example preparation.",
        },
        {
          label: "Question",
          name: "question",
          widget: "string",
          required: false,
        },
        localizedText("Answer", "answer"),
      ],
    },
    {
      label: "Projects",
      name: "projects",
      widget: "list",
      required: false,
      default: [],
      i18n: true,
      summary: "{{fields.title}} · {{fields.status}}",
      hint: "Draft projects may be unfinished and stay off the public website. Published project IDs, order, lead names, levels and repository/setup/Discord links must match across all six languages.",
      fields: [
        {
          label: "Project ID",
          name: "id",
          widget: "string",
          required: false,
          hint: "Keep this ID unchanged across translations, for example python-docs.",
        },
        {
          label: "Project visibility",
          name: "status",
          widget: "select",
          options: [
            { label: "Draft — hide from website", value: "draft" },
            { label: "Published — include on Sprint page", value: "published" },
          ],
          default: "draft",
        },
        {
          label: "Project title",
          name: "title",
          widget: "string",
          required: false,
        },
        localizedText("Description", "description"),
        {
          label: "Sprint Lead",
          name: "lead",
          widget: "string",
          required: false,
        },
        {
          label: "Participant level",
          name: "level",
          widget: "select",
          required: false,
          default: "",
          options: [
            { label: "Not specified", value: "" },
            { label: "All levels", value: "all-levels" },
            { label: "Intermediate", value: "intermediate" },
          ],
          hint: "Use the confirmed participant level. Keep the same value across translations.",
        },
        {
          label: "Repository URL",
          name: "repositoryUrl",
          widget: "string",
          required: false,
          hint: "HTTPS link. Keep the same link across translations.",
        },
        {
          label: "Setup instructions URL",
          name: "setupUrl",
          widget: "string",
          required: false,
          hint: "HTTPS link. Keep the same link across translations.",
        },
        {
          label: "Discord URL",
          name: "discordUrl",
          widget: "string",
          required: false,
          default: "",
          hint: "Optional. Use only a confirmed HTTPS invite or channel link for this project. Keep the same link across translations.",
        },
        textList("Useful skills", "skills"),
        textList("Goals and contribution tasks", "contributions"),
      ],
    },
  ];
}

function createSprintCollection(
  contentRoot: string,
  stage: ReturnType<typeof getCmsStage>,
): CmsCollection {
  return {
    name:
      stage === "test"
        ? `${sprintCollectionDefinition.name}_test`
        : sprintCollectionDefinition.name,
    label: sprintCollectionDefinition.label,
    folder: `${contentRoot}/2026-sprint`,
    create: false,
    delete: false,
    i18n: true,
    extension: "json",
    format: "json",
    identifier_field: "slug",
    slug: "settings",
    filter: { field: "slug", value: "settings" },
    summary: "Sprint settings",
    editor: { preview: true },
    fields: createSprintFields(),
  };
}

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
    editor: { preview: true },
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
    collections: [
      ...postCollectionDefinitions.map((definition) =>
        createPostCollection(contentRoot, definition, stage),
      ),
      createSprintCollection(contentRoot, stage),
    ],
  };
}
