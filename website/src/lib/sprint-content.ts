export const sprintLocales = ['en', 'zh-hk', 'zh-hant', 'zh-hans', 'ja', 'ko'] as const;
export type SprintLocale = (typeof sprintLocales)[number];
type Visibility = 'draft' | 'published';

export type SprintProject = {
  id: string;
  status: Visibility;
  title: string;
  description: string;
  lead: string;
  leadProfileUrl: string;
  level: '' | 'all-levels' | 'intermediate';
  repositoryUrl: string;
  setupUrl: string;
  discordUrl: string;
  skills: string[];
  contributions: string[];
};

export type SprintContent = {
  slug: 'settings';
  status: Visibility;
  intro: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  registrationUrl: string;
  proposalUrl: string;
  proposalDeadline: string;
  items: string[];
  qa: { id: string; question: string; answer: string }[];
  projects: SprintProject[];
};

const sprintFields = [
  'slug',
  'status',
  'intro',
  'date',
  'startTime',
  'endTime',
  'location',
  'registrationUrl',
  'proposalUrl',
  'proposalDeadline',
  'items',
  'qa',
  'projects',
];
const projectFields = [
  'id',
  'status',
  'title',
  'description',
  'lead',
  'leadProfileUrl',
  'level',
  'repositoryUrl',
  'setupUrl',
  'discordUrl',
  'skills',
  'contributions',
];

export function parseSprintContent(
  input: unknown,
  locale: string,
  options: { preview?: boolean } = {}
): SprintContent {
  const fail = (field: string, message: string): never => {
    throw new Error(`Invalid ${locale} Sprint content (${field}): ${message}`);
  };
  const record = (
    value: unknown,
    allowed: string[],
    field: string
  ): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return fail(field, 'expected an object');
    for (const key of Object.keys(value))
      if (!allowed.includes(key)) fail(`${field}.${key}`, 'unknown field');
    return value as Record<string, unknown>;
  };
  const text = (value: unknown, field: string): string => {
    if (value === undefined) return '';
    if (typeof value !== 'string') return fail(field, 'expected text');
    return value.trim();
  };
  const visibility = (value: unknown, field: string): Visibility => {
    if (value === undefined) return 'draft';
    if (value !== 'draft' && value !== 'published')
      return fail(field, 'must be draft or published');
    return value;
  };
  const projectLevel = (value: unknown, field: string): SprintProject['level'] => {
    // Decap's optional single-select emits null when its selection is cleared.
    if (value == null) return '';
    if (value !== '' && value !== 'all-levels' && value !== 'intermediate')
      return fail(field, 'must be empty, all-levels or intermediate');
    return value;
  };
  const list = (value: unknown, field: string): unknown[] => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) return fail(field, 'expected a list');
    return value;
  };
  const strings = (value: unknown, field: string): string[] =>
    list(value, field).map((item, index) => {
      const result = text(item, `${field}.${index}`);
      if (!result) fail(`${field}.${index}`, 'must not be empty');
      return result;
    });
  const identifier = (value: unknown, field: string): string => {
    const result = text(value, field);
    if (result && !/^[a-z0-9][a-z0-9-]*$/u.test(result))
      fail(field, 'use a stable lowercase ID');
    return result;
  };
  const url = (value: unknown, field: string): string => {
    const result = text(value, field);
    if (!result) return result;
    try {
      const parsed = new URL(result);
      if (
        parsed.protocol !== 'https:' ||
        !parsed.hostname ||
        parsed.username ||
        parsed.password ||
        /\s/u.test(result)
      )
        throw new Error('invalid URL');
    } catch {
      fail(field, 'use a complete HTTPS URL without credentials');
    }
    return result;
  };
  const required = (value: string, field: string) => {
    if (!value) fail(field, 'required before publishing');
  };
  const uniqueIds = (items: { id: string }[], field: string) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (!item.id) continue;
      if (seen.has(item.id)) fail(field, `duplicate ID ${item.id}`);
      seen.add(item.id);
    }
  };
  const source = record(input, sprintFields, 'settings');
  if (source.slug !== 'settings') fail('slug', 'must be settings');
  const content: SprintContent = {
    slug: 'settings',
    status: visibility(source.status, 'status'),
    intro: text(source.intro, 'intro'),
    date: text(source.date, 'date'),
    startTime: text(source.startTime, 'startTime'),
    endTime: text(source.endTime, 'endTime'),
    location: text(source.location, 'location'),
    registrationUrl: url(source.registrationUrl, 'registrationUrl'),
    proposalUrl: url(source.proposalUrl, 'proposalUrl'),
    proposalDeadline: text(source.proposalDeadline, 'proposalDeadline'),
    items: strings(source.items, 'items'),
    qa: list(source.qa, 'qa').map((value, index) => {
      const item = record(value, ['id', 'question', 'answer'], `qa.${index}`);
      return {
        id: identifier(item.id, `qa.${index}.id`),
        question: text(item.question, `qa.${index}.question`),
        answer: text(item.answer, `qa.${index}.answer`),
      };
    }),
    projects: list(source.projects, 'projects').map((value, index) => {
      const item = record(value, projectFields, `projects.${index}`);
      return {
        id: identifier(item.id, `projects.${index}.id`),
        status: visibility(item.status, `projects.${index}.status`),
        title: text(item.title, `projects.${index}.title`),
        description: text(item.description, `projects.${index}.description`),
        lead: text(item.lead, `projects.${index}.lead`),
        leadProfileUrl: url(item.leadProfileUrl, `projects.${index}.leadProfileUrl`),
        level: projectLevel(item.level, `projects.${index}.level`),
        repositoryUrl: url(item.repositoryUrl, `projects.${index}.repositoryUrl`),
        setupUrl: url(item.setupUrl, `projects.${index}.setupUrl`),
        discordUrl: url(item.discordUrl, `projects.${index}.discordUrl`),
        skills: strings(item.skills, `projects.${index}.skills`),
        contributions: strings(item.contributions, `projects.${index}.contributions`),
      };
    }),
  };
  const isDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  if (content.date && !isDate(content.date))
    fail('date', 'use a real date in YYYY-MM-DD format');
  for (const field of ['startTime', 'endTime'] as const)
    if (content[field] && !/^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(content[field]))
      fail(field, 'use Hong Kong time in HH:mm format');
  if (content.startTime && content.endTime && content.endTime <= content.startTime)
    fail('endTime', 'must follow the start time');
  if (
    content.proposalDeadline &&
    (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/u.test(
      content.proposalDeadline
    ) ||
      !isDate(content.proposalDeadline.slice(0, 10)) ||
      Number.isNaN(Date.parse(content.proposalDeadline)))
  )
    fail('proposalDeadline', 'use an ISO timestamp with a timezone');
  uniqueIds(content.qa, 'qa');
  uniqueIds(content.projects, 'projects');
  if (content.status === 'published' && !options.preview) {
    for (const field of ['intro', 'date', 'location', 'registrationUrl'] as const)
      required(content[field], field);
    if (content.qa.length === 0)
      fail('qa', 'add at least one approved question before publishing');
    content.qa.forEach((item, index) => {
      for (const field of ['id', 'question', 'answer'] as const)
        required(item[field], `qa.${index}.${field}`);
    });
  }
  content.projects.forEach((project, index) => {
    if (project.status !== 'published' || options.preview) return;
    for (const field of [
      'id',
      'title',
      'description',
      'lead',
      'repositoryUrl',
    ] as const)
      required(project[field], `projects.${index}.${field}`);
  });
  return content;
}

export function validateSprintTranslations(
  contents: Partial<Record<SprintLocale, SprintContent>>
): void {
  if (!sprintLocales.some((locale) => contents[locale]?.status === 'published')) return;
  const missing = sprintLocales.filter(
    (locale) => contents[locale]?.status !== 'published'
  );
  if (missing.length)
    throw new Error(`Sprint requires published translations: ${missing.join(', ')}`);
  const shared = (content: SprintContent) => ({
    date: content.date,
    startTime: content.startTime,
    endTime: content.endTime,
    registrationUrl: content.registrationUrl,
    proposalUrl: content.proposalUrl,
    proposalDeadline: content.proposalDeadline,
    qa: content.qa.map((item) => item.id),
    projects: content.projects
      .filter((project) => project.status === 'published')
      .map((project) => ({
        id: project.id,
        lead: project.lead,
        leadProfileUrl: project.leadProfileUrl,
        level: project.level,
        repositoryUrl: project.repositoryUrl,
        setupUrl: project.setupUrl,
        discordUrl: project.discordUrl,
      })),
  });
  const english = contents.en;
  if (!english) throw new Error('English Sprint content is required');
  const expected = JSON.stringify(shared(english));
  for (const locale of sprintLocales) {
    const translated = contents[locale];
    if (translated && JSON.stringify(shared(translated)) !== expected)
      throw new Error(
        `Sprint shared dates, links, published project details and question IDs/order must match English in ${locale}`
      );
  }
}
