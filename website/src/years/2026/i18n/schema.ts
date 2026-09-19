export type HomeHighlight = {
  icon: 'mic' | 'calendar' | 'pin';
  title: string;
  description: string;
};

export type ProgrammeTrack = {
  number: string;
  icon: 'code' | 'ai' | 'community';
  title: string;
  description: string;
};

export type SponsorTier = {
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'community';
  description?: string;
};

export type HomeMessages = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brand: string;
    about: string;
    programme: string;
    venue: string;
    sponsors: string;
    register: string;
    cfp: string;
    menuLabel: string;
    closeMenu: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    subheadline: string;
    registerCta: string;
    calendarCta: string;
    whenLabel: string;
    whenValue: string;
    whereLabel: string;
    whereValue: string;
    forLabel: string;
    forValue: string;
  };
  highlights: HomeHighlight[];
  programme: {
    eyebrow: string;
    title: string;
    description: string;
    tracks: ProgrammeTrack[];
  };
  hongKongThread: {
    eyebrow: string;
    title: string;
    description: string;
    location: string;
  };
  joinUs: {
    sprintDescription: string;
    sponsorDescription: string;
    eyebrow: string;
    title: string;
    description: string;
    ctaAria: string;
    atAGlanceTitle: string;
    datesLabel: string;
    datesValue: string;
    locationLabel: string;
    locationValue: string;
    stayTunedLabel: string;
    stayTunedValue: string;
  };
  sponsors: {
    eyebrow: string;
    title: string;
    description: string;
    tiers: SponsorTier[];
    prospectusCta: string;
  };
  footer: {
    brand: string;
    summary: string;
    conferenceGuideTitle: string;
    aboutLink: string;
    sponsorLink: string;
    registrationLink: string;
    codeOfConductLink: string;
    privacyPolicyLink: string;
    copyright: string;
    tagline: string;
    termsAndSupport: string;
    privacyPolicy: string;
  };
  schedule: {
    pageTitle: string;
    pageDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    day1: string;
    day2: string;
    allTracks: string;
    searchPlaceholder: string;
    mySchedule: string;
    myScheduleEmpty: string;
    noResults: string;
    details: string;
    addToCalendar: string;
    speaker: string;
    speakers: string;
    room: string;
    time: string;
    duration: string;
    language: string;
    abstract: string;
    close: string;
  };
};

export type TranslationMessages = {
  home: HomeMessages;
};
