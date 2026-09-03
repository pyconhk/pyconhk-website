import type { CfpLocale } from '@/years/2026/locales';

export type SocialLink = {
  label: string;
  href: string;
  display: string;
  iconName?: string;
};

export type AboutPageCopy = {
  title: string;
  subtitle: string;
  imageAlt: string;
  paragraphs: readonly string[];
  socialHeading: string;
};

export const pageCopyByLocale: Record<CfpLocale, AboutPageCopy> = {
  en: {
    title: 'About PyCon Hong Kong',
    subtitle: 'Connecting Pythonistas, Empowering Innovation',
    imageAlt: 'PyCon Hong Kong Community & Organizers',
    paragraphs: [
      'PyCon Hong Kong (PyCon HK) is the leading Python conference in Hong Kong, bringing together Python enthusiasts to share their insights and foster collaboration. Among the 50+ PyCons hosted annually in various cities and countries worldwide, PyCon HK is proud to be one of them.',
      'The founding of PyCon HK traces back to Sammy Fung, who drew inspiration from the PyCon APAC 2013 event in Tokyo. Sammy recognized that Hong Kong was missing out on this vital Python conference, despite PyCon being hosted in various Asian cities. Determined to fill this gap, Sammy collaborated with Open Source Hong Kong to organize the inaugural PyCon HK in 2015. Since then, PyCon HK has played a pivotal role in nurturing Python development and adoption within the city.',
      'In 2026, PyCon Hong Kong continues its vibrant journey, celebrating the passion and creativity of the local and international Python community. Driven by dedicated volunteers, seasoned engineers, educators, and tech innovators, PyCon HK 2026 delivers an inspiring, high-impact event that connects Pythonistas, fosters open source collaboration, and empowers innovation worldwide.',
    ],
    socialHeading: 'Follow us on:',
  },
  'zh-hk': {
    title: '關於 PyCon Hong Kong',
    subtitle: '凝聚 Python 愛好者，賦能創新',
    imageAlt: 'PyCon Hong Kong 大會活動合照',
    paragraphs: [
      'PyCon Hong Kong（PyCon HK）是香港具代表性的 Python 年度會議，匯聚來自不同背景的 Python 愛好者，分享經驗、交流想法，並促進合作。全球每年有超過五十個城市及地區舉辦 PyCon，而 PyCon HK 很榮幸成為其中一員。',
      'PyCon HK 的起點可追溯至 Sammy Fung 參與 2013 年東京 PyCon APAC 之後。當時他意識到，亞洲多個城市都有自己的 PyCon，但香港仍然缺少一個屬於本地 Python 社群的重要年度聚會。於是，Sammy 與開源香港合作，在 2015 年舉辦了首屆 PyCon HK。自此，PyCon HK 一直在香港推動 Python 技術交流與社群發展。',
      '2026 年，PyCon Hong Kong 延續歷年熱情，連結本地與國際的 Python 開發者與開源社群。在熱心義工、資深工程師、教育工作者與科技創新者的共同努力下，PyCon HK 2026 帶來兼具深度與前瞻性的技術交流平台。',
    ],
    socialHeading: '關注我們',
  },
  'zh-hant': {
    title: '關於 PyCon Hong Kong',
    subtitle: '凝聚 Python 愛好者，賦能創新',
    imageAlt: 'PyCon Hong Kong 大會活動合照',
    paragraphs: [
      'PyCon Hong Kong（PyCon HK）是香港具代表性的 Python 年度會議，匯聚來自不同背景的 Python 愛好者，分享經驗、交流想法，並促進合作。全球每年有超過五十個城市及地區舉辦 PyCon，而 PyCon HK 很榮幸成為其中一員。',
      'PyCon HK 的起點可追溯至 Sammy Fung 參與 2013 年東京 PyCon APAC 之後。當時他意識到，亞洲多個城市都有自己的 PyCon，但香港仍然缺少一個屬於本地 Python 社群的重要年度聚會。於是，Sammy 與開源香港合作，在 2015 年舉辦了首屆 PyCon HK。自此，PyCon HK 一直在香港推動 Python 技術交流與社群發展。',
      '2026 年，PyCon Hong Kong 延續歷年熱情，連結本地與國際的 Python 開發者與開源社群。在熱心志工、資深工程師、教育工作者與科技創新者的共同努力下，PyCon HK 2026 帶來兼具深度與前瞻性的技術交流平台。',
    ],
    socialHeading: '關注我們',
  },
  'zh-hans': {
    title: '关于 PyCon Hong Kong',
    subtitle: '凝聚 Python 爱好者，赋能创新',
    imageAlt: 'PyCon Hong Kong 大会活动合照',
    paragraphs: [
      'PyCon Hong Kong（PyCon HK）是香港具代表性的 Python 年度会议，汇聚来自不同背景的 Python 爱好者，分享经验、交流想法，并促进合作。全球每年有超过五十个城市及地区举办 PyCon，而 PyCon HK 很荣幸成为其中一员。',
      'PyCon HK 的起点可追溯至 Sammy Fung 参与 2013 年东京 PyCon APAC 之后。当时他意识到，亚洲多个城市都有自己的 PyCon，但香港仍然缺少一个属于本地 Python 社群的重要年度聚会。于是，Sammy 与开源香港合作，在 2015 年举办了首届 PyCon HK。自此，PyCon HK 一直在香港推动 Python 技术交流与社群发展。',
      '2026 年，PyCon Hong Kong 延续历年热情，连接本地与国际的 Python 开发者与开源社区。在热心志愿者、资深工程师、教育工作者与科技创新者的共同努力下，PyCon HK 2026 带来兼具深度与前瞻性的技术交流平台。',
    ],
    socialHeading: '关注我们',
  },
  ja: {
    title: 'PyCon Hong Kong について',
    subtitle: 'Pythonistas をつなぎ、革新を推進する',
    imageAlt: 'PyCon Hong Kong コミュニティ記念写真',
    paragraphs: [
      'PyCon Hong Kong（PyCon HK）は、香港を代表する Python カンファレンスです。さまざまな背景を持つ Python 愛好家が集まり、知見を共有し、交流し、協力関係を育む場となっています。世界では毎年 50 を超える都市や地域で PyCon が開催されており、PyCon HK もその一つであることを誇りに思っています。',
      'PyCon HK の始まりは、Sammy Fung が 2013 年に東京で開催された PyCon APAC に参加したことにさかのぼります。アジア各地に PyCon がある一方で、香港にはまだ年次の Python カンファレンスがないことに気づいた Sammy は、その空白を埋めるべく Open Source Hong Kong と協力し、2015 年に初めての PyCon HK を開催しました。それ以来、PyCon HK は香港における Python 技術交流とコミュニティの発展を支える存在となっています。',
      '2026 年、PyCon Hong Kong は新たな一歩を踏み出し、世界中の Python 開発者、エンジニア、教育者をつなぎます。情熱的なボランティアとコミュニティの力により、インスピレーションと活力にあふれるカンファレンスをお届けします。',
    ],
    socialHeading: '公式リンク・SNS',
  },
  ko: {
    title: 'PyCon Hong Kong 소개',
    subtitle: '파이썬 개발자를 잇고, 혁신을 만들어갑니다',
    imageAlt: 'PyCon Hong Kong 단체 기념사진',
    paragraphs: [
      'PyCon Hong Kong (PyCon HK)은 홍콩을 대표하는 연례 파이썬 컨퍼런스로, 다양한 배경의 파이썬 개발자들이 모여 지식을 나누고 협업하는 장입니다. 전 세계 50여 개 도시에서 열리는 PyCon 네트워크의 자랑스러운 일원입니다.',
      'PyCon HK는 2013년 도쿄 PyCon APAC에서 영감을 받은 Sammy Fung이 Open Source Hong Kong과 협력하여 2015년 첫 대회를 개최하면서 시작되었습니다. 이후 홍콩의 파이썬 기술 생태계 성장에 핵심적인 역할을 해왔습니다.',
      '2026년 PyCon Hong Kong은 열정적인 자원봉사자, 엔지니어, 교육자들과 함께 혁신적이고 깊이 있는 컨퍼런스를 개최하여 전 세계 파이썬 커뮤니티를 연결합니다.',
    ],
    socialHeading: '공식 채널 안내',
  },
};

export const socialLinks: readonly SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/pyconhk/',
    display: 'linkedin.com/company/pyconhk',
  },
  {
    label: 'Substack',
    href: 'https://pyconhk.substack.com/',
    display: 'pyconhk.substack.com',
  },
  {
    label: 'Discord',
    href: 'https://bit.ly/pyconhk',
    display: 'bit.ly/pyconhk',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pyconhk',
    display: 'instagram.com/pyconhk',
  },
  {
    label: 'Threads',
    href: 'https://www.threads.net/@pyconhk',
    display: 'threads.net/@pyconhk',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/pyconhk/',
    display: 'facebook.com/pyconhk',
  },
  {
    label: 'X',
    href: 'https://x.com/pyconhk/',
    display: 'x.com/pyconhk',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/c/pyconhk',
    display: 'youtube.com/c/pyconhk',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/pyconhk/',
    display: 'github.com/pyconhk',
  },
] as const;
