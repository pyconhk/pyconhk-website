import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getConferenceContent } from './conference-content';
import {
  conferenceLocales,
  parseConferenceContent,
  validateConferenceTranslations,
} from './conference-schema';

describe('conference editorial content', () => {
  test('retains existing editorial content as drafts in all six languages', () => {
    for (const locale of conferenceLocales) {
      const content = getConferenceContent(locale);
      assert.equal(content.event.status, 'published');
      assert.equal(content.tickets.status, 'draft');
      assert.equal(content.tickets.url, '');
      assert.equal(content.organizations.status, 'draft');
      assert.equal(content.organizations.items.length, 21);
      assert.equal(content.people.items.length, 15);
      assert.equal(content.sponsorship.plans.length, 5);
      assert.ok(content.about.paragraphs.length > 0);
    }
  });

  test('rejects publishing an incomplete venue or using CFP as ticket registration', () => {
    const content = structuredClone(getConferenceContent('en'));
    content.venue.status = 'published';
    assert.throws(() => parseConferenceContent(content, 'en'), /Required to publish/u);
    content.venue.status = 'draft';
    content.tickets = {
      status: 'published',
      url: 'https://cfp.pycon.hk/pyconhk2026/cfp',
      label: 'Register',
      description: '',
    };
    assert.throws(() => parseConferenceContent(content, 'en'), /CFP submission link/u);
    content.tickets.url = 'javascript:alert(1)';
    assert.throws(() => parseConferenceContent(content, 'en'), /HTTPS/u);
  });

  test('requires all six translations before exposing a section', () => {
    const contents = Object.fromEntries(
      conferenceLocales.map((locale) => [
        locale,
        structuredClone(getConferenceContent(locale)),
      ])
    );
    contents.en.about.status = 'published';
    assert.throws(
      () => validateConferenceTranslations(contents),
      /about requires published translations/u
    );
    for (const locale of conferenceLocales) contents[locale].about.status = 'published';
    assert.doesNotThrow(() => validateConferenceTranslations(contents));
  });

  test('requires matching published list identities, order and shared facts', () => {
    const contents = Object.fromEntries(
      conferenceLocales.map((locale) => [
        locale,
        structuredClone(getConferenceContent(locale)),
      ])
    );
    for (const section of ['organizations', 'people', 'sponsorship'] as const) {
      for (const locale of conferenceLocales)
        contents[locale][section].status = 'published';
    }
    assert.doesNotThrow(() => validateConferenceTranslations(contents));
    const original = structuredClone(contents.ko);
    contents.ko.organizations.items.pop();
    assert.throws(
      () => validateConferenceTranslations(contents),
      /organizations.*IDs\/order.*ko/u
    );
    contents.ko = structuredClone(original);
    contents.ko.people.items.reverse();
    assert.throws(
      () => validateConferenceTranslations(contents),
      /people.*IDs\/order.*ko/u
    );
    contents.ko = structuredClone(original);
    contents.ko.organizations.items[0].url = 'https://example.org';
    assert.throws(
      () => validateConferenceTranslations(contents),
      /organizations.*links.*ko/u
    );
    contents.ko = structuredClone(original);
    contents.ko.sponsorship.plans[0].features.pop();
    assert.throws(
      () => validateConferenceTranslations(contents),
      /sponsorship.*IDs\/order.*ko/u
    );
    contents.ko = structuredClone(original);
    contents.ko.event.startDate = '2026-11-13';
    assert.throws(() => validateConferenceTranslations(contents), /event.*dates.*ko/u);
    contents.ko = structuredClone(original);
    for (const locale of conferenceLocales)
      contents[locale].organizations.items[1].id =
        contents[locale].organizations.items[0].id;
    assert.throws(
      () => validateConferenceTranslations(contents),
      /unique stable item IDs/u
    );
  });
});
