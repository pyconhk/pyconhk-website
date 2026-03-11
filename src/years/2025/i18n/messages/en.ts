import type { TranslationMessages } from './schema';

const enMessages = {
  home: {
    eyebrow: 'PyCon HK 2025',
    title: 'Sailing Together',
    tagline: 'Raise the Sail, Let Python Prevail',
    intro:
      'PyCon HK 2025 returns for two days of talks, workshops, sprinting, and community gatherings at City University of Hong Kong.',
    facts: [
      {
        label: 'Dates',
        value: '11-12 October 2025',
      },
      {
        label: 'Venue',
        value: 'City University of Hong Kong',
      },
      {
        label: 'Focus',
        value: 'Talks, workshops, sprint day',
      },
    ],
    primaryCta: 'Grab your tickets now',
    secondaryCta: 'Conference schedule',
    tertiaryCta: 'Latest news',
    newsHeading: 'Latest News',
    newsIntro:
      'Fresh announcements from the Outstatic editorial workflow, now surfaced in the Astro foundation.',
    speakersHeading: 'Featured Speakers',
    speakersIntro: 'A first look at the lineup already announced for PyCon HK 2025.',
    sponsorsHeading: 'Sponsors and Partners',
    sponsorsIntro:
      'The organizations helping PyCon HK stay welcoming, practical, and community-first.',
    actionsHeading: 'Join the Conference',
    actionsIntro:
      'There are several ways to shape the event, whether you want to sprint, sponsor, or arrive fully prepared.',
    sprintTitle: 'Call for Sprint',
    sprintBody:
      'Connect with the community and contribute to open source projects. PyCon HK 2025 Sprint is a great opportunity to collaborate with others and meet like-minded builders.',
    sprintBenefits: [
      'Networking with maintainers and contributors',
      'Interactive, hands-on learning experience',
      'A chance to grow your open source project',
    ],
    sprintCta: 'Submit your project now',
    sponsorTitle: 'Call for Sponsorships',
    sponsorBody:
      'Support the Python community and gain meaningful visibility for your brand. PyCon HK offers sponsorship tiers designed to help your organization connect with attendees in practical ways.',
    sponsorBenefits: [
      'Booth space in the expo hall',
      'Logo placement across website and event materials',
      'Sponsored talk opportunities',
    ],
    sponsorCta: 'Become a sponsor',
    datesHeading: 'Key Dates',
    datesIntro:
      'A quick planning view for the most important moments around the conference weekend.',
    dates: [
      {
        title: 'Conference Day',
        date: '11 October 2025',
      },
      {
        title: 'Sprint submission deadline',
        date: '11 October 2025',
      },
      {
        title: 'Sprint Day',
        date: '12 October 2025',
      },
    ],
    faqHeading: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'What kinds of sprint projects are a good fit?',
        answer:
          'We welcome open source projects of all sizes, especially ones connected to Python, the Python community, or Hong Kong local culture and language.',
      },
      {
        question: 'What are the benefits of sponsoring PyCon HK?',
        answer:
          'Sponsors gain community visibility, opportunities to meet developers and hiring candidates, and a clear way to support open source and Python in Hong Kong.',
      },
      {
        question: 'Do I need to prepare anything before joining Sprint Day?',
        answer:
          'Yes. Please bring a laptop, join the project Discord channels in advance, and complete any installation test or setup guide shared by the sprint lead.',
      },
    ],
    footerSummary:
      'A community-built Python conference for Hong Kong and everyone who wants to build, teach, and share with it.',
    quickLinksHeading: 'Quick Links',
    archiveHeading: 'Archive Years',
    archiveNote:
      'Historical year archives remain outside the first Astro migration phase and will return after the current-year public site is stable.',
    sectionBackLabel: 'Back to homepage',
    sectionNote:
      'This route is already on the active Astro foundation. Shared layout, locale routing, and page shell are in place while detailed content is ported from the archived site.',
    sectionStatusLabel: 'Migration in progress',
    sectionStatusBody:
      'The route is live now so navigation, locale switching, and year structure stay coherent while the detailed page content is migrated.',
    relatedRoutesHeading: 'Related routes',
    continueExploringHeading: 'Continue exploring',
    newsEmptyState: 'No published updates are available yet.',
    viewAllNewsLabel: 'View all news',
    readArticleLabel: 'Read article',
    articleBackLabel: 'Back to news',
    englishOnlyNotice:
      'This article is currently available in English only while bilingual content migration is still underway.',
    englishOnlyPageNotice:
      'This page is currently available in English only while bilingual content migration is still underway.',
    privacyPolicyLabel: 'Privacy Policy',
    menuLabel: 'Menu',
  },
} satisfies TranslationMessages;

export default enMessages;
