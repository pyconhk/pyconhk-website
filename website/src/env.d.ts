/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CALL_FOR_SPRINT_URL?: string;
  readonly PUBLIC_CALL_FOR_SPONSORSHIPS_URL?: string;
  readonly PUBLIC_CONTACT_US_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
