export type VolunteerProfile = {
  name: string;
  imageSrc?: string;
  linkedin?: string;
  personalWebsite?: string;
};

export const conferenceChair: VolunteerProfile = {
  name: 'Mr. Henry Law',
  imageSrc: '/2025/organizers-volunteers/volunteers/henry-law-compressed.webp',
};

export const conferenceCoChairs: readonly VolunteerProfile[] = [
  {
    name: 'Mr. Scotty Kwok',
    imageSrc: '/2025/organizers-volunteers/volunteers/scotty-kwok.jpg',
    linkedin: 'https://www.linkedin.com/in/scottykwok/',
  },
  {
    name: 'Mr. Tommy Han',
    imageSrc: '/2025/organizers-volunteers/volunteers/tommy-han-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/tommy-han-236a85144/',
  },
  {
    name: 'Mr. Ka Ki Ting',
    imageSrc: '/2025/organizers-volunteers/volunteers/ka-ki-ting-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/tinglogy/',
  },
  {
    name: 'Mr. Calvin Tsang',
    imageSrc: '/2025/organizers-volunteers/volunteers/calvin-tsang-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/calvin-tyl/',
  },
  {
    name: 'Mr. Alex Au',
    imageSrc: '/2025/organizers-volunteers/volunteers/alex-au-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/alex-au-606901206/',
  },
] as const;

export const organizingCommitteeMembers: readonly VolunteerProfile[] = [
  {
    name: 'Mr. Adrian Tam',
    imageSrc: '/2025/organizers-volunteers/volunteers/adrian-tam-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/adrian-tam-0666b08/',
  },
  {
    name: 'Mr. Calvin Chong',
    imageSrc: '/2025/organizers-volunteers/volunteers/calvin-chong-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/yeow-kuan-chong-338b3863/',
  },
  {
    name: 'Ms. Peggy Wong',
  },
  {
    name: 'Ms. Daisy Maris Fung',
    imageSrc: '/2025/organizers-volunteers/volunteers/daisy-maris-fung-compressed.webp',
    personalWebsite: 'https://www.daisymarisfung.com/',
  },
  {
    name: 'Mr. Ethan Lee',
    imageSrc: '/2025/organizers-volunteers/volunteers/ethan-lee-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/ethan-lee-4335251b1/',
  },
  {
    name: 'Ms. Maya Yan',
    imageSrc: '/2025/organizers-volunteers/volunteers/maya-yan-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/yantungmaya/',
  },
  {
    name: 'Mr. Ronald Yick',
    imageSrc: '/2025/organizers-volunteers/volunteers/ronald-yick-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/ronald-yick/',
  },
  {
    name: 'Mr. Sky Ng',
    imageSrc: '/2025/organizers-volunteers/volunteers/sky-ng-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/sky-ng-ab307b252/',
  },
  {
    name: 'Mr. Ted Yuen',
    imageSrc: '/2025/organizers-volunteers/volunteers/ted-yuen-compressed.webp',
    linkedin: 'https://www.linkedin.com/in/ted-yuen/',
  },
] as const;
