function mailtoLink(subject: string): string {
  return `mailto:pycon@pycon.hk?subject=${encodeURIComponent(subject)}`;
}

export const eventbriteUrl =
  import.meta.env.PUBLIC_EVENTBRITE_URL ||
  'https://www.eventbrite.hk/e/pycon-hk-2025-sailing-together-raise-the-sail-let-python-prevail-tickets-1412325165589?utm-campaign=social&utm-content=attendeeshare&utm-medium=discovery&utm-term=listing&utm-source=cp&aff=ebdsshcopyurl';

export const callForSprintUrl =
  import.meta.env.PUBLIC_CALL_FOR_SPRINT_URL ||
  mailtoLink('PyCon HK Sprint Project Submission');

export const callForSponsorshipsUrl =
  import.meta.env.PUBLIC_CALL_FOR_SPONSORSHIPS_URL ||
  mailtoLink('PyCon HK Sponsorship Enquiry');

export const contactUsUrl =
  import.meta.env.PUBLIC_CONTACT_US_URL || mailtoLink('PyCon HK Enquiry');
