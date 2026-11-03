import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  parseSprintContent,
  type SprintContent,
  type SprintLocale,
  sprintLocales,
  validateSprintTranslations,
} from './sprint-content.ts';

function seed(locale: SprintLocale = 'en'): SprintContent {
  return parseSprintContent(
    JSON.parse(
      readFileSync(
        new URL(
          `../../outstatic/content/2026-sprint/settings.${locale}.json`,
          import.meta.url
        ),
        'utf8'
      )
    ),
    locale
  );
}
function translations(): Record<SprintLocale, SprintContent> {
  return Object.fromEntries(
    sprintLocales.map((locale) => [locale, seed(locale)])
  ) as Record<SprintLocale, SprintContent>;
}
const project = () => ({
  id: 'python-tools',
  status: 'published' as const,
  title: 'Python tools',
  description: 'Work on useful tools together.',
  lead: 'Project lead',
  repositoryUrl: 'https://github.com/example/tools',
  setupUrl: 'https://example.com/setup',
  skills: ['Python'],
  contributions: ['Documentation'],
});

test('the six seeded Sprint translations retain published information and question identity', () => {
  const contents = translations();
  validateSprintTranslations(contents);
  for (const content of Object.values(contents)) {
    assert.equal(content.date, '2026-11-15');
    assert.equal(content.qa.length, 12);
    assert.equal(content.qa[0].id, 'what-is-sprint');
    assert.equal(content.projects.length, 0);
  }
});

test('incomplete Sprint and project drafts can be saved, while publication requires approved content', () => {
  const draft = {
    slug: 'settings',
    status: 'draft',
    projects: [{ status: 'draft', title: 'Work in progress' }],
  };
  assert.equal(parseSprintContent(draft, 'en').projects[0].status, 'draft');
  assert.throws(
    () => parseSprintContent({ ...draft, status: 'published' }, 'en'),
    /required before publishing/
  );
  assert.throws(
    () => parseSprintContent({ ...seed(), qa: [] }, 'en'),
    /approved question/
  );
  assert.throws(
    () => parseSprintContent({ ...seed(), projects: [{ status: 'published' }] }, 'en'),
    /projects\.0\.id/
  );
});

test('preview accepts an unfinished published edit without weakening publication validation', () => {
  const input = { ...seed(), projects: [{ ...project(), title: '' }] };
  assert.throws(() => parseSprintContent(input, 'en'), /title/);
  assert.equal(
    parseSprintContent(input, 'en', { preview: true }).projects[0].title,
    ''
  );
});

test('Sprint facts accept only real dates, unambiguous times and safe HTTPS links', () => {
  for (const patch of [
    { date: '2026-02-30' },
    { startTime: '25:00' },
    { startTime: '14:00', endTime: '10:00' },
    { registrationUrl: 'javascript:alert(1)' },
    { proposalUrl: 'https://user:secret@example.com' },
    { proposalDeadline: '2026-11-14T23:59' },
    { proposalDeadline: '2026-02-30T23:59:00+08:00' },
  ])
    assert.throws(() => parseSprintContent({ ...seed(), ...patch }, 'en'));
  assert.equal(
    parseSprintContent(
      { ...seed(), proposalDeadline: '2026-11-14T23:59:00.000+08:00' },
      'en'
    ).proposalDeadline,
    '2026-11-14T23:59:00.000+08:00'
  );
});

test('unknown fields and duplicate project/question IDs are rejected', () => {
  assert.throws(
    () => parseSprintContent({ ...seed(), arbitrary: 'unexpected' }, 'en'),
    /unknown field/
  );
  assert.throws(
    () => parseSprintContent({ ...seed(), projects: [project(), project()] }, 'en'),
    /duplicate ID/
  );
  assert.throws(
    () => parseSprintContent({ ...seed(), qa: [seed().qa[0], seed().qa[0]] }, 'en'),
    /duplicate ID/
  );
});

test('published Sprint translations agree on facts and published project identity', () => {
  const contents = translations();
  for (const content of Object.values(contents)) content.projects = [project()];
  validateSprintTranslations(contents);
  contents.ko.projects[0].setupUrl = 'https://example.com/different';
  assert.throws(() => validateSprintTranslations(contents), /match English in ko/);
  contents.ko.projects[0] = project();
  contents.ja.date = '2026-11-16';
  assert.throws(() => validateSprintTranslations(contents), /match English in ja/);
});

test('unpublished projects do not prevent saving a draft alongside complete translations', () => {
  const contents = translations();
  contents.en.projects = [{ ...project(), status: 'draft', title: '' }];
  validateSprintTranslations(contents);
  contents.ko.status = 'draft';
  assert.throws(
    () => validateSprintTranslations(contents),
    /requires published translations: ko/
  );
});
