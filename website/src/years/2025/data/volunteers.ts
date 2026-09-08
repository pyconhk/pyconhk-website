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

// Additional credits use the display names in the post-event 2025 volunteer photo list.
export const programmeVolunteers: readonly VolunteerProfile[] = [
  {
    name: 'Anna Liu',
  },
  {
    name: 'Ian Chau',
  },
  {
    name: 'Sennett Lau',
  },
];

export const designers: readonly VolunteerProfile[] = [
  {
    name: 'Bridget Chu',
  },
  {
    name: 'Jared Yeung',
    personalWebsite: 'https://jaredyeung.com/works/logo-design-pycon-hk-2024',
  },
  {
    name: 'Kim Liu',
  },
  {
    name: 'Quincy Chan',
  },
  {
    name: 'Rainbow Cheng',
    imageSrc: '/2025/organizers-volunteers/volunteers/rainbow-cheng.webp',
  },
];

export const emcees: readonly VolunteerProfile[] = [
  {
    name: 'Amy Li',
  },
  {
    name: 'Charles Paul',
  },
  {
    name: 'Henry Wong',
    linkedin: 'https://www.linkedin.com/in/wyhwong',
  },
  {
    name: 'Judy Wong',
    imageSrc: '/2025/organizers-volunteers/volunteers/judy-wong.webp',
    linkedin: 'https://www.linkedin.com/in/wongjudy',
  },
];

export const onSiteVolunteers: readonly VolunteerProfile[] = [
  {
    name: 'Alan Chu',
    imageSrc: '/2025/organizers-volunteers/volunteers/alan-chu.webp',
  },
  {
    name: 'Allen Kong',
    imageSrc: '/2025/organizers-volunteers/volunteers/allen-kong.webp',
  },
  {
    name: 'Audrey Cheung',
  },
  {
    name: 'Carmen Ng',
    imageSrc: '/2025/organizers-volunteers/volunteers/carmen-ng.webp',
  },
  {
    name: 'Cathy Hui',
  },
  {
    name: 'Cintia Ching',
    imageSrc: '/2025/organizers-volunteers/volunteers/cintia-ching.webp',
    linkedin: 'https://www.linkedin.com/in/cintiaching',
  },
  {
    name: 'Dora Saylikoglu',
    imageSrc: '/2025/organizers-volunteers/volunteers/dora-saylikoglu.webp',
  },
  {
    name: 'Eric Chan',
    imageSrc: '/2025/organizers-volunteers/volunteers/eric-chan.webp',
    linkedin: 'https://www.linkedin.com/in/ericchanwork',
  },
  {
    name: 'Eva Chung',
  },
  {
    name: 'Harry Ho',
    imageSrc: '/2025/organizers-volunteers/volunteers/harry-ho.webp',
  },
  {
    name: 'Hillary Tam',
  },
  {
    name: 'Janny Leung',
    imageSrc: '/2025/organizers-volunteers/volunteers/janny-leung.webp',
  },
  {
    name: 'Jim Ngoo',
    imageSrc: '/2025/organizers-volunteers/volunteers/jim-ngoo.webp',
    linkedin: 'https://hk.linkedin.com/in/jim-ngoo',
  },
  {
    name: 'Joseph Siu',
    imageSrc: '/2025/organizers-volunteers/volunteers/joseph-siu.webp',
    linkedin: 'https://www.linkedin.com/in/joseph-siu-ba606a17/',
  },
  {
    name: 'Kapo Leung',
    imageSrc: '/2025/organizers-volunteers/volunteers/kapo-leung.webp',
  },
  {
    name: 'Kelly Wong',
    imageSrc: '/2025/organizers-volunteers/volunteers/kelly-wong.webp',
  },
  {
    name: 'Ken Wong',
  },
  {
    name: 'Kingman Leung',
  },
  {
    name: 'Mark Leung',
  },
  {
    name: 'Mimi Kwok',
  },
  {
    name: 'Ming Tou',
    imageSrc: '/2025/organizers-volunteers/volunteers/ming-tou.webp',
    linkedin: 'https://www.linkedin.com/in/ming-tou-97b818105/',
  },
  {
    name: 'Mr. C.S. Li, Martin',
    imageSrc: '/2025/organizers-volunteers/volunteers/martin-li.webp',
  },
  {
    name: 'Nero Chan',
  },
  {
    name: 'Nicole Yu',
  },
  {
    name: 'Oscar Ng',
    imageSrc: '/2025/organizers-volunteers/volunteers/oscar-ng.webp',
  },
  {
    name: 'Peggy Chan',
  },
  {
    name: 'Raymond Yeung',
  },
  {
    name: 'Sung Hin Ho',
  },
  {
    name: 'Tsui Hui Yin',
    imageSrc: '/2025/organizers-volunteers/volunteers/tsui-hui-yin.webp',
  },
  {
    name: 'Yuen Tin Yan',
    imageSrc: '/2025/organizers-volunteers/volunteers/yuen-tin-yan.webp',
  },
  {
    name: 'Kylie Wong',
  },
  {
    name: 'Ken Chu',
  },
  {
    name: 'Tim Ching',
  },
  {
    name: 'Clara Ng',
  },
];
