export type HomeFact = {
  label: string;
  value: string;
};

export type HomeDate = {
  title: string;
  date: string;
};

export type HomeFaq = {
  question: string;
  answer: string;
};

export type HomeMessages = {
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
  facts: HomeFact[];
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
  newsHeading: string;
  newsIntro: string;
  speakersHeading: string;
  speakersIntro: string;
  sponsorsHeading: string;
  sponsorsIntro: string;
  actionsHeading: string;
  actionsIntro: string;
  sprintTitle: string;
  sprintBody: string;
  sprintBenefits: string[];
  sprintCta: string;
  sponsorTitle: string;
  sponsorBody: string;
  sponsorBenefits: string[];
  sponsorCta: string;
  datesHeading: string;
  datesIntro: string;
  dates: HomeDate[];
  faqHeading: string;
  faqs: HomeFaq[];
  footerSummary: string;
  quickLinksHeading: string;
  archiveHeading: string;
  archiveNote: string;
  sectionBackLabel: string;
  sectionNote: string;
  sectionStatusLabel: string;
  sectionStatusBody: string;
  relatedRoutesHeading: string;
  continueExploringHeading: string;
  newsEmptyState: string;
  viewAllNewsLabel: string;
  readArticleLabel: string;
  articleBackLabel: string;
  englishOnlyNotice: string;
  englishOnlyPageNotice: string;
  privacyPolicyLabel: string;
  menuLabel: string;
};

export type TranslationMessages = {
  home: HomeMessages;
};
