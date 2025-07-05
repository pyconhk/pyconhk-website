declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // General Configuration
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_SITE_URL: string;
      NEXT_PUBLIC_CURRENT_YEAR: string;

      // Conference Links
      NEXT_PUBLIC_CALL_FOR_PROPOSALS_URL: string;
      NEXT_PUBLIC_CALL_FOR_SPONSORSHIPS_URL: string;
      NEXT_PUBLIC_CONTACT_US_URL: string;

      // Social Media Links
      NEXT_PUBLIC_TWITTER_URL: string;
      NEXT_PUBLIC_LINKEDIN_URL: string;
      NEXT_PUBLIC_YOUTUBE_URL: string;
      NEXT_PUBLIC_GITHUB_URL: string;
      NEXT_PUBLIC_FACEBOOK_URL: string;
      NEXT_PUBLIC_INSTAGRAM_URL: string;
      NEXT_PUBLIC_THREADS_URL: string;

      // Documentation and Resources
      NEXT_PUBLIC_CODE_OF_CONDUCT_URL: string;
      NEXT_PUBLIC_PRIVACY_POLICY_URL: string;
      NEXT_PUBLIC_TERMS_URL: string;
      NEXT_PUBLIC_FAQ_URL: string;
      NEXT_PUBLIC_PREVIOUS_YEARS_URL: string;
    }
  }
}

export {};
