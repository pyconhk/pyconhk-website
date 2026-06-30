import type { TranslationMessages } from './schema';

const enMessages = {
  home: {
    eyebrow: 'PyCon HK 2025',
    title: 'Sailing Together',
    tagline: 'Sailing Together',
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
    primaryCta: 'Grab Your Tickets Now!',
    secondaryCta: 'Conference Schedule',
    tertiaryCta: 'Latest News',
    newsHeading: 'Latest News & Updates',
    newsIntro:
      'Fresh announcements from the Outstatic editorial workflow, now surfaced in the Astro foundation.',
    speakersHeading: 'Featured Speakers',
    speakersIntro: 'A first look at the lineup already announced for PyCon HK 2025.',
    sponsorsHeading: 'Sponsors and Partners',
    sponsorsIntro:
      'The organizations helping PyCon HK stay welcoming, practical, and community-first.',
    actionsHeading: 'Be Part of PyCon HK 2025',
    actionsIntro:
      'Join the Python community and contribute to making PyCon HK 2025 an exceptional, fun and amazing experience for everyone.',
    sprintTitle: 'Call for Sprint',
    sprintBody:
      'Connect with the community and contribute to open source projects. PyCon HK 2025 Sprint is a great opportunity to collaborate with others, and meet like-minded.',
    sprintBenefits: [
      'Networking',
      'Interactive learning experience',
      'Develop your open-source projects',
    ],
    sprintCta: 'Submit Your Project Now',
    sponsorTitle: 'Call for Sponsorships',
    sponsorBody:
      "Support the Python community and gain visibility for your brand. PyCon offers various sponsorship tiers designed to maximize your organization's exposure.",
    sponsorBenefits: [
      'Booth space in the expo hall',
      'Logo placement on website and materials',
      'Sponsored Talks',
    ],
    sponsorCta: 'Become a Sponsor',
    datesHeading: 'Key Dates',
    datesIntro: '',
    dates: [
      {
        title: 'Conference Date',
        date: 'Oct 11, 2025',
      },
      {
        title: 'Sprint Deadline',
        date: 'Oct 11, 2025',
      },
      {
        title: 'Sprint Date',
        date: 'Oct 12, 2025',
      },
    ],
    faqHeading: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'What types of proposals are you looking for?',
        answer:
          'We welcome proposals on all Python-related topics, including but not limited to web development, data science, machine learning, DevOps, testing, education, and community initiatives.',
      },
      {
        question: 'What are the benefits of sponsoring?',
        answer:
          'Sponsors gain visibility within the Python community, opportunities to recruit talent, brand exposure, and demonstrate support for open source software.',
      },
      {
        question: 'Is financial aid available for speakers?',
        answer:
          'Yes, PyCon offers financial assistance to speakers who need support with travel and accommodation. More details are available in the proposal submission process.',
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
