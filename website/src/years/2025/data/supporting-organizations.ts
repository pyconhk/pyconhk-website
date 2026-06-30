import {
  type LocalizedValue,
  resolveLocalizedValue,
  resolveRequiredLocalizedValue,
  type SiteLocale,
} from '@/config/site';
import type { ContentBlock } from '@/years/2025/data/content-blocks';

type LocalizedText = LocalizedValue<string>;

export type SupportingOrganization = {
  slug: string;
  nameLines: readonly string[];
  imagePath: string;
  logoAlt: string;
  url: string;
  summary: LocalizedText;
  logoClass?: string;
  details?: Partial<Record<SiteLocale, readonly ContentBlock[]>>;
};

export function getSupportingOrganizationSummary(
  organization: SupportingOrganization,
  locale: SiteLocale
): string {
  return resolveRequiredLocalizedValue(organization.summary, locale);
}

export function getSupportingOrganizationDetails(
  organization: SupportingOrganization,
  locale: SiteLocale
): readonly ContentBlock[] | undefined {
  return organization.details
    ? resolveLocalizedValue(organization.details, locale)
    : undefined;
}

export const supportingOrganizations: readonly SupportingOrganization[] = [
  {
    slug: 'agile-hong-kong',
    nameLines: ['Agile Hong Kong'],
    imagePath: '/2025/supporting-organizations/agile_hk.webp',
    logoAlt: 'Agile Hong Kong Logo',
    url: 'https://www.meetup.com/agile-hong-kong/',
    summary: {
      en: 'Hong Kong meetup community for people who want to learn, practice, and share agile ideas together.',
      'zh-hk':
        '香港的 Agile 社群聚會，讓有興趣學習、實踐及分享 agile 理念的人一起交流。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Established in 2014, Agile HK welcomes everyone to learn and share ideas about agile practices, from teamwork and coaching to metrics and delivery.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'Agile HK 成立於 2014 年，歡迎任何人一同學習及分享 Agile 實踐的想法與經驗，主題涵蓋團隊協作、coaching、metrics 及 delivery 等不同方向。',
        },
      ],
    },
  },
  {
    slug: 'aws-user-group-hong-kong',
    nameLines: ['AWS User Group Hong Kong'],
    imagePath: '/2025/supporting-organizations/aws_ug_hk.webp',
    logoAlt: 'AWS User Group Hong Kong Logo',
    url: 'https://awsug.hk/',
    summary: {
      en: 'Volunteer-led community for AWS learners and practitioners across talks, workshops, and networking sessions.',
      'zh-hk':
        '由義工推動的 AWS 社群，透過講座、工作坊及聚會連結不同程度的雲端學習者與實踐者。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Since 2015, AWS User Group Hong Kong has been a volunteer-driven community for people interested in Amazon Web Services, from beginners to experienced cloud professionals.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Build a strong AWS community in Hong Kong.',
            'Share AWS news, trends, and best practices.',
            'Support members in their cloud journey.',
            'Encourage collaboration and innovation.',
          ],
        },
        {
          type: 'paragraph',
          text: 'The group regularly hosts talks, workshops, and networking sessions for the local cloud community.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: '自 2015 年起，AWS User Group Hong Kong 一直是由義工推動的社群，歡迎所有對 Amazon Web Services 有興趣的人參與，無論是初學者還是資深雲端從業者。',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '在香港建立更強大的 AWS 社群。',
            '分享最新 AWS 新聞、趨勢及最佳實踐。',
            '支持成員在雲端旅程中持續成長。',
            '鼓勵協作與創新。',
          ],
        },
        {
          type: 'paragraph',
          text: '社群定期為本地雲端社群舉辦講座、工作坊及交流聚會。',
        },
      ],
    },
  },
  {
    slug: 'codeaholics',
    nameLines: ['Codeaholics'],
    imagePath: '/2025/supporting-organizations/codeaholics.webp',
    logoAlt: 'Codeaholics Logo',
    url: 'https://www.facebook.com/codeaholics/',
    summary: {
      en: 'Developer community focused on practical talks and workshops that connect local engineers in Hong Kong.',
      'zh-hk': '以務實技術分享和工作坊為主的開發者社群，連結香港本地工程師。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Codeaholics believes the Hong Kong developer community is skilled and diverse, but that much of that experience can stay hidden inside organizations or move overseas.',
        },
        {
          type: 'paragraph',
          text: 'The group aims to provide a forum where local developers can share those skills and inspire their peers.',
        },
        {
          type: 'paragraph',
          text: 'With a mix of local and international speakers, Codeaholics focuses on relevant talks and workshops that prove small meetups can still be deeply valuable.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'Codeaholics 相信香港開發者社群既有實力亦很多元，只是這些經驗往往被困在大型機構之中，或隨人才外流而難以被看見。',
        },
        {
          type: 'paragraph',
          text: '因此，社群希望建立一個平台，讓本地開發者可以分享自己的技術與經驗，並啟發身邊更多同行。',
        },
        {
          type: 'paragraph',
          text: '透過本地與國際講者並重的安排，Codeaholics 帶來貼地且具針對性的講座與工作坊，證明即使 meetup 規模不大，也一樣可以非常有價值。',
        },
      ],
    },
  },
  {
    slug: 'eduhk-math-it',
    nameLines: ['Department of Mathematics and', 'Information Technology, The EdUHK'],
    imagePath: '/2025/supporting-organizations/eduhk_math_it_dept.webp',
    logoAlt: 'EdUHK Math and IT Department Logo',
    url: 'https://www.eduhk.hk/mit/en/',
    summary: {
      en: 'Academic department advancing mathematics, information technology, research, and pedagogy for future educators.',
      'zh-hk': '致力推動數學、資訊科技、研究及教學發展，培育未來教育工作者的學術部門。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'The Department of Mathematics and Information Technology at EdUHK aims to nurture future educators and researchers in mathematics and information technology with both passion and talent.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Strive for excellence in education, research, and knowledge transfer.',
            'Cultivate reasoning, analysis, problem-solving, critical thinking, and computational thinking.',
            'Contribute new knowledge in mathematics, information technology, and pedagogy.',
            'Undertake outreach and community engagement that increases mathematical and technological literacy locally and internationally.',
          ],
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: '香港教育大學數學與資訊科技學系致力培育對數學及資訊科技具熱誠與才能的未來教育工作者與研究人員。',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '在教育、研究及知識轉移方面追求卓越。',
            '培養推理、分析、解難、批判思維及計算思維能力。',
            '在數學、資訊科技及其教學法領域貢獻具影響力的新知識。',
            '推動外展及社群參與，提升本地及國際的數理與科技素養。',
          ],
        },
      ],
    },
  },
  {
    slug: 'gdg-cloud-hong-kong',
    nameLines: ['Google Developer Group', 'Cloud Hong Kong'],
    imagePath: '/2025/supporting-organizations/gdg_cloud_hk.webp',
    logoAlt: 'GDG Cloud Hong Kong Logo',
    url: 'https://gdg.community.dev/gdg-cloud-hong-kong/',
    summary: {
      en: 'Community for developers exploring Google Cloud topics from machine learning to serverless and containers.',
      'zh-hk':
        '讓開發者交流 Google Cloud 主題的社群，涵蓋機器學習、serverless、容器等方向。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'GDG Cloud Hong Kong is the local Google Developer Group chapter focused on Google Cloud and its capabilities for developers and technologists.',
        },
        {
          type: 'list',
          items: [
            'Machine learning',
            'BigQuery',
            'Serverless computing',
            'App Engine',
            'Containers',
          ],
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'GDG Cloud Hong Kong 是本地的 Google Developer Group 分會，聚焦 Google Cloud 及其為開發者與技術人員帶來的各種可能性。',
        },
        {
          type: 'list',
          items: [
            '機器學習',
            'BigQuery',
            'Serverless Computing',
            'App Engine',
            'Containers',
          ],
        },
      ],
    },
  },
  {
    slug: 'gdg-hong-kong',
    nameLines: ['Google Developer Group', 'Hong Kong'],
    imagePath: '/2025/supporting-organizations/gdg_hk.webp',
    logoAlt: 'GDG Hong Kong Logo',
    url: 'https://gdg.community.dev/gdg-hong-kong/',
    summary: {
      en: 'Long-running developer community sharing Google technologies through study groups, workshops, and DevFest events.',
      'zh-hk':
        '歷史悠久的開發者社群，透過讀書會、工作坊及 DevFest 等活動分享 Google 技術。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Established in 2009, Google Developer Group Hong Kong is an active non-profit community for developers and tech enthusiasts interested in Google technologies, AI, web, and mobile development.',
        },
        {
          type: 'paragraph',
          text: 'The group regularly organizes study groups, talks, workshops, DevFest, Build with AI, and I/O Extended events for the local ecosystem.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'Google Developer Group Hong Kong 於 2009 年成立，是活躍於香港的非牟利開發者社群，為對 Google 技術、AI、Web 及流動開發有興趣的開發者與科技愛好者提供交流平台。',
        },
        {
          type: 'paragraph',
          text: '社群定期舉辦讀書會、技術講座、工作坊、DevFest、Build with AI 及 I/O Extended 等活動，持續為本地科技生態作出貢獻。',
        },
      ],
    },
  },
  {
    slug: 'hkace',
    nameLines: ['HKACE', 'The Hong Kong Association for Computer Education'],
    imagePath: '/2025/supporting-organizations/hkace.webp',
    logoAlt: 'HKACE Logo',
    url: 'https://www.hkace.org.hk/',
    summary: {
      en: 'Professional association supporting computer education, teachers, students, and technology learning in Hong Kong.',
      'zh-hk': '支援香港電腦教育、教師發展、學生培育及科技學習的專業團體。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Founded in 1981, the Hong Kong Association for Computer Education promotes computer education development in Hong Kong and supports both teachers and students through professional and school-based activities.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: '香港電腦教育學會於 1981 年成立，源於香港中學電腦科試驗計劃期間一群熱心老師的共同推動，致力促進本地電腦教育發展。',
        },
        {
          type: 'paragraph',
          text: '學會由教授、退休及現任校長和老師擔任顧問及理事，除了推動電腦科教學，也持續關注電子教學、STEM 發展，以及香港資訊科技教育政策。',
        },
        {
          type: 'paragraph',
          text: '學會獲政府與業界廣泛肯定，並於 2000 年獲稅務局批准成為認可慈善團體。',
        },
        {
          type: 'heading',
          text: '面向老師的活動',
        },
        {
          type: 'paragraph',
          text: '本會經常為校長及老師舉辦各式活動，包括 Google for Education Teachers Network、T.E.A.C.H.、教師講座、工作坊及興趣小組。',
        },
        {
          type: 'heading',
          text: '面向學生的活動',
        },
        {
          type: 'paragraph',
          text: '本會每年舉辦多項學生大型活動，包括資訊科技挑戰獎勵計劃、青年資訊科技大使獎勵計劃、香港電腦奧林匹克競賽及 Girls STEM 計劃等。',
        },
      ],
    },
  },
  {
    slug: 'internet-society-hong-kong',
    nameLines: ['Internet Society Hong Kong'],
    imagePath: '/2025/supporting-organizations/internet_society.webp',
    logoAlt: 'Internet Society Hong Kong Logo',
    url: 'https://www.isoc.hk/',
    summary: {
      en: 'Advocates for an open, neutral, reliable, and accessible internet through standards, governance, and infrastructure work.',
      'zh-hk': '透過標準、治理及基礎建設工作，推動開放、中立、可靠且可及的互聯網。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Internet Society Hong Kong promotes an open, neutral, reliable, and accessible internet by encouraging participation in the development of internet standards, protocols, governance, and infrastructure.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'Internet Society Hong Kong 透過鼓勵各界參與互聯網標準、協議、治理及基礎建設的發展，推動一個開放、中立、可靠且人人可及的互聯網。',
        },
      ],
    },
  },
  {
    slug: 'japanese-raspberry-pi-users-group',
    nameLines: ['Japanese Raspberry Pi Users Group', '(Raspberry JAM Tokyo)'],
    imagePath: '/2025/supporting-organizations/japan_rpi_ug.webp',
    logoAlt: 'Japanese Raspberry Pi Users Group Logo',
    url: 'https://www.raspi.jp/',
    summary: {
      en: 'Raspberry Pi community from Japan supporting hardware learning, making, and regional meetup collaboration.',
      'zh-hk':
        '來自日本的 Raspberry Pi 社群，推動硬件學習、創作實踐及跨地區 meetup 協作。',
    },
  },
  {
    slug: 'pyladies-hong-kong',
    nameLines: ['PyLadies Hong Kong'],
    imagePath: '/2025/supporting-organizations/pyladies_hk.svg',
    logoAlt: 'PyLadies Hong Kong Logo',
    url: 'https://linktr.ee/pyladieshk',
    summary: {
      en: 'Community that encourages women to participate, lead, and build lasting connections in Python and open source.',
      'zh-hk': '鼓勵女性參與、帶領並在 Python 與開源社群中建立長遠連結的社群。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'PyLadies Hong Kong encourages women to actively participate in and lead the Python open source community through outreach, education, events, and social gatherings.',
        },
        {
          type: 'paragraph',
          text: 'Its supportive network helps members build confidence and lasting connections while welcoming everyone interested in Python.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'PyLadies Hong Kong 鼓勵女性透過外展、教育、活動及社交聚會，更積極參與並帶領 Python 開源社群。',
        },
        {
          type: 'paragraph',
          text: '社群以支持性的網絡幫助成員建立信心與長遠連結，同時亦歡迎所有對 Python 有興趣的人加入。',
        },
      ],
    },
  },
  {
    slug: 'pyladies-tokyo',
    nameLines: ['PyLadies Tokyo'],
    imagePath: '/2025/supporting-organizations/pyladies_tokyo.webp',
    logoAlt: 'PyLadies Tokyo Logo',
    url: 'https://tokyo.pyladies.com/',
    summary: {
      en: 'Tokyo branch of PyLadies connecting Python practitioners through regular meetups and collaborative events.',
      'zh-hk': 'PyLadies 東京分會，透過定期聚會與合作活動連結不同 Python 實踐者。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'PyLadies Tokyo connects women Python practitioners through monthly meetups and also participates in broader activities such as PyCon JP and collaborations with Django Girls Tokyo.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'PyLadies Tokyo 透過每月 meetup 連結不同女性 Python 實踐者，亦會參與 PyCon JP 等更大型活動，並與 Django Girls Tokyo 等社群合作。',
        },
      ],
    },
  },
  {
    slug: 'python-asia-organization',
    nameLines: ['Python Asia Organization'],
    imagePath: '/2025/supporting-organizations/python_asia.webp',
    logoAlt: 'Python Asia Organization Logo',
    url: 'https://pythonasia.org/',
    summary: {
      en: 'Non-profit supporting regional Python conferences, leadership development, and cross-community collaboration across Asia.',
      'zh-hk': '支援亞洲區域 Python 會議、社群領袖培育及跨社群協作的非牟利組織。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Python Asia Organization is a non-profit based in Estonia that organizes the annual regional conference and supports Python events across Asia.',
        },
        {
          type: 'paragraph',
          text: 'Its mission is to promote, protect, and advance Python while helping build a sustainable and inclusive community across East and Southeast Asia.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'Python Asia Organization 是一間於愛沙尼亞註冊的非牟利組織，負責籌辦年度區域會議，並支持亞洲各地的 Python 活動。',
        },
        {
          type: 'paragraph',
          text: '其使命是推廣、保護及推進 Python，同時協助在東亞及東南亞建立一個可持續且具包容性的社群。',
        },
      ],
    },
  },
  {
    slug: 'vtc-innovation-and-technology-co-creation-centre',
    nameLines: ['VTC', 'Innovation and Technology Co-creation Centre'],
    imagePath: '/2025/supporting-organizations/vtc.webp',
    logoAlt: 'VTC Innovation and Technology Co-creation Centre Logo',
    url: 'https://vco-create.vtc.edu.hk/en/',
    summary: {
      en: 'Platform connecting students, industry, and emerging technologies to grow innovation and entrepreneurship.',
      'zh-hk': '連結學生、業界與新興科技的平台，推動創新與創業發展。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'VTC Innovation and Technology Co-creation Centre provides a platform where students can develop talent, work with cutting-edge technologies, and collaborate with industry partners to build an innovation ecosystem with social impact.',
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'VTC Innovation and Technology Co-creation Centre 為學生提供平台，讓他們培育才能、接觸前沿科技，並與業界夥伴合作，共同建立具社會影響力的創新生態。',
        },
      ],
    },
  },
  {
    slug: 'wtia',
    nameLines: ['WTIA', 'Hong Kong Wireless Technology Industry Association'],
    imagePath: '/2025/supporting-organizations/wtia.png.webp',
    logoAlt: 'WTIA Logo',
    url: 'https://hkwtia.org/',
    summary: {
      en: 'Trade association helping advance wireless, mobile, and emerging technology communities in Hong Kong.',
      'zh-hk': '推動香港無線、流動及新興科技產業與社群發展的業界組織。',
    },
    details: {
      en: [
        {
          type: 'paragraph',
          text: 'Established in 2001, WTIA is a not-for-profit trade association and community for professionals working in innovative and emerging technologies.',
        },
        {
          type: 'paragraph',
          text: 'The association acts as a platform and aggregator that advances wireless, mobile, and innovative technologies while helping shape Hong Kong into a leading smart technology hub.',
        },
        {
          type: 'list',
          items: [
            'StartUp',
            'm-Commerce and FinTech',
            'EduTech',
            'Blockchain and Metaverse',
            '5G and IoT',
            'Information Security',
          ],
        },
      ],
      'zh-hk': [
        {
          type: 'paragraph',
          text: 'WTIA 成立於 2001 年，是香港一個非牟利業界組織與社群，服務從事創新及新興科技的專業人士。',
        },
        {
          type: 'paragraph',
          text: '協會作為平台、聚合者及社群，致力推動無線、流動及創新科技發展，協助香港邁向領先的智慧科技樞紐。',
        },
        {
          type: 'list',
          items: [
            'StartUp',
            'm-Commerce 與 FinTech',
            'EduTech',
            'Blockchain 與 Metaverse',
            '5G 與 IoT',
            '資訊安全',
          ],
        },
      ],
    },
  },
];
