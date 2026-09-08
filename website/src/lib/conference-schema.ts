import { z } from 'astro/zod';

export const conferenceLocales = [
  'en',
  'zh-hk',
  'zh-hant',
  'zh-hans',
  'ja',
  'ko',
] as const;
export type ConferenceLocale = (typeof conferenceLocales)[number];

const text = z.string().trim().default('');
const status = z.enum(['draft', 'published']).default('draft');
const url = text.refine((value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !!parsed.hostname && !/\s/u.test(value);
  } catch {
    return false;
  }
}, 'Use a complete HTTPS URL');
const image = text.refine(
  (value) =>
    !value || /^https:\/\/[^\s]+$/u.test(value) || /^\/(?!\/)[^\s]*$/u.test(value),
  'Use a public image path or HTTPS URL'
);
const strings = z.array(z.string().trim().min(1)).default([]);
const id = text.refine(
  (value) => !value || /^[a-z0-9][a-z0-9-]*$/u.test(value),
  'Use a stable lowercase item ID'
);
const date = text.refine(
  (value) =>
    !value ||
    (/^\d{4}-\d{2}-\d{2}$/u.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value),
  'Use an ISO date (YYYY-MM-DD)'
);

export const conferenceContentSchema = z
  .object({
    slug: z.literal('settings'),
    event: z
      .object({
        status,
        title: text,
        theme: text,
        datesLabel: text,
        startDate: date,
        endDate: date,
      })
      .strict(),
    tickets: z.object({ status, url, label: text, description: text }).strict(),
    venue: z
      .object({
        status,
        title: text,
        address: text,
        description: text,
        directions: text,
        wifi: text,
        mapImage: image,
        mapUrl: url,
      })
      .strict(),
    catering: z.object({ status, intro: text, items: strings }).strict(),
    sprint: z
      .object({
        status,
        intro: text,
        date,
        location: text,
        registrationUrl: url,
        items: strings,
      })
      .strict(),
    qa: z
      .object({
        status,
        items: z
          .array(z.object({ id, question: text, answer: text }).strict())
          .default([]),
      })
      .strict(),
    sponsors: z
      .object({
        status,
        items: z
          .array(
            z
              .object({
                id,
                name: text,
                tier: text,
                logo: image,
                url,
                description: text,
              })
              .strict()
          )
          .default([]),
      })
      .strict(),
    sponsorship: z
      .object({
        status,
        intro: strings,
        benefits: z
          .array(z.object({ id, title: text, description: text }).strict())
          .default([]),
        plans: z
          .array(
            z
              .object({
                id,
                name: text,
                tier: text,
                fee: text,
                maxSlots: text,
                features: z
                  .array(z.object({ id, label: text, value: text }).strict())
                  .default([]),
              })
              .strict()
          )
          .default([]),
      })
      .strict(),
    patrons: z
      .object({
        status,
        items: z.array(z.object({ id, name: text }).strict()).default([]),
      })
      .strict(),
    organizations: z
      .object({
        status,
        items: z
          .array(
            z
              .object({
                id,
                name: text,
                logo: image,
                url,
                description: text,
                kind: z.enum(['organizer', 'supporter']),
              })
              .strict()
          )
          .default([]),
      })
      .strict(),
    people: z
      .object({
        status,
        items: z
          .array(z.object({ id, name: text, role: text, image, url }).strict())
          .default([]),
      })
      .strict(),
    about: z.object({ status, paragraphs: strings }).strict(),
  })
  .strict()
  .superRefine((content, context) => {
    const requireText = (value: string, field: (string | number)[]) => {
      if (!value) {
        context.addIssue({
          code: 'custom',
          path: field,
          message: 'Required to publish',
        });
      }
    };
    if (content.event.status === 'published') {
      for (const field of [
        'title',
        'theme',
        'datesLabel',
        'startDate',
        'endDate',
      ] as const) {
        requireText(content.event[field], ['event', field]);
      }
      if (content.event.startDate > content.event.endDate) {
        context.addIssue({
          code: 'custom',
          path: ['event', 'endDate'],
          message: 'End date must follow the start date',
        });
      }
    }
    if (content.tickets.status === 'published') {
      requireText(content.tickets.url, ['tickets', 'url']);
      requireText(content.tickets.label, ['tickets', 'label']);
      if (/^https:\/\/cfp\.pycon\.hk(?:\/|$)/iu.test(content.tickets.url)) {
        context.addIssue({
          code: 'custom',
          path: ['tickets', 'url'],
          message:
            'A CFP submission link cannot be used as the ticket registration URL',
        });
      }
    }
    if (content.venue.status === 'published') {
      requireText(content.venue.title, ['venue', 'title']);
      requireText(content.venue.address, ['venue', 'address']);
    }
    for (const section of ['catering', 'sprint'] as const) {
      if (content[section].status === 'published') {
        requireText(content[section].intro, [section, 'intro']);
      }
    }
    if (content.about.status === 'published' && content.about.paragraphs.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['about', 'paragraphs'],
        message: 'Add approved content before publishing',
      });
    }
    if (content.sponsorship.status === 'published') {
      if (
        content.sponsorship.intro.length === 0 ||
        content.sponsorship.plans.length === 0
      ) {
        context.addIssue({
          code: 'custom',
          path: ['sponsorship'],
          message:
            'Add an approved introduction and sponsorship plans before publishing',
        });
      }
      content.sponsorship.plans.forEach((plan, index) => {
        for (const field of ['id', 'name', 'tier', 'fee', 'maxSlots'] as const) {
          requireText(plan[field], ['sponsorship', 'plans', index, field]);
        }
        plan.features.forEach((feature, featureIndex) => {
          for (const field of ['id', 'label', 'value'] as const)
            requireText(feature[field], [
              'sponsorship',
              'plans',
              index,
              'features',
              featureIndex,
              field,
            ]);
        });
      });
      content.sponsorship.benefits.forEach((benefit, index) => {
        for (const field of ['id', 'title', 'description'] as const)
          requireText(benefit[field], ['sponsorship', 'benefits', index, field]);
      });
    }
    const itemFields = {
      qa: ['id', 'question', 'answer'],
      sponsors: ['id', 'name', 'tier', 'logo', 'url'],
      patrons: ['id', 'name'],
      organizations: ['id', 'name', 'logo', 'url', 'description'],
      people: ['id', 'name', 'role'],
    } as const;
    for (const section of Object.keys(itemFields) as (keyof typeof itemFields)[]) {
      if (content[section].status !== 'published') continue;
      if (content[section].items.length === 0) {
        context.addIssue({
          code: 'custom',
          path: [section, 'items'],
          message: 'Add approved content before publishing',
        });
      }
      content[section].items.forEach((item, index) => {
        for (const field of itemFields[section]) {
          requireText(String(Reflect.get(item, field) ?? ''), [
            section,
            'items',
            index,
            field,
          ]);
        }
      });
    }
  });

export type ConferenceContent = z.infer<typeof conferenceContentSchema>;
export type ConferenceSection = Exclude<keyof ConferenceContent, 'slug'>;

export function parseConferenceContent(
  value: unknown,
  locale: string
): ConferenceContent {
  const result = conferenceContentSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid ${locale} conference content: ${result.error.message}`);
  }
  return result.data;
}

export function validateConferenceTranslations(
  contents: Partial<Record<ConferenceLocale, ConferenceContent>>
): void {
  const sections = Object.keys(conferenceContentSchema.shape).filter(
    (section): section is ConferenceSection => section !== 'slug'
  );
  for (const section of sections) {
    const published = conferenceLocales.some(
      (locale) => contents[locale]?.[section].status === 'published'
    );
    if (!published) continue;
    const missing = conferenceLocales.filter(
      (locale) => contents[locale]?.[section].status !== 'published'
    );
    if (missing.length > 0) {
      throw new Error(
        `${section} requires published translations: ${missing.join(', ')}`
      );
    }
    const english = contents.en;
    if (!english) throw new Error('English conference content is required to publish');
    const expected = sharedSectionValues(section, english[section]);
    for (const locale of conferenceLocales.filter((locale) => locale !== 'en')) {
      const translated = contents[locale];
      if (!translated)
        throw new Error(`${locale} conference content is required to publish`);
      const actual = sharedSectionValues(section, translated[section]);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `${section} shared dates, links, images and item IDs/order must match English in ${locale}`
        );
      }
    }
  }
}

// Localized copy can differ, but published factual fields and list identities cannot.
function sharedSectionValues(
  section: ConferenceSection,
  value: ConferenceContent[ConferenceSection]
): unknown {
  const source = value as unknown as Record<string, unknown>;
  const sharedFields: Partial<Record<ConferenceSection, string[]>> = {
    event: ['startDate', 'endDate'],
    tickets: ['url'],
    venue: ['mapImage', 'mapUrl'],
    sprint: ['date', 'registrationUrl'],
  };
  function listIdentity(items: unknown, path: string): unknown {
    if (!Array.isArray(items)) return undefined;
    const ids = new Set<string>();
    return items.map((item, index) => {
      if (typeof item !== 'object' || item === null) return { index };
      const record = item as Record<string, unknown>;
      const identifier = String(record.id ?? '');
      if (!identifier || ids.has(identifier))
        throw new Error(
          `${section}.${path} requires unique stable item IDs before publishing`
        );
      ids.add(identifier);
      return Object.fromEntries([
        ...['id', 'url', 'logo', 'image', 'kind', 'tier', 'fee', 'maxSlots']
          .filter((field) => field in record)
          .map((field) => [field, record[field]]),
        ...('features' in record
          ? [
              [
                'features',
                listIdentity(record.features, `${path}.${identifier}.features`),
              ],
            ]
          : []),
      ]);
    });
  }
  return {
    ...Object.fromEntries(
      (sharedFields[section] ?? []).map((field) => [field, source[field]])
    ),
    ...Object.fromEntries(
      ['items', 'plans', 'benefits', 'intro', 'paragraphs']
        .filter((field) => Array.isArray(source[field]))
        .map((field) => [field, listIdentity(source[field], field)])
    ),
  };
}
