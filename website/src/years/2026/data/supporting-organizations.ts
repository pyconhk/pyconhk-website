import type { CfpLocale } from '@/years/2026/locales';

export type SupportingOrganization = {
  slug: string;
  name: Record<CfpLocale, string>;
  nameLines: readonly string[];
  imagePath: string;
  logoAlt: string;
  url: string;
  summary: Record<CfpLocale, string>;
};

export type SupportingOrganizationsCopy = {
  title: string;
  subtitle: string;
  intro: string;
  visitWebsite: string;
};

export const pageCopyByLocale: Record<CfpLocale, SupportingOrganizationsCopy> = {
  en: {
    title: 'Supporting Organizations',
    subtitle: 'Community Partners',
    intro:
      'Heartfelt thanks to the exceptional organizations backing PyCon HK 2026. Your steadfast dedication and contributions propel our mission forward, inspiring the Python community and empowering us to achieve new milestones together.',
    visitWebsite: 'Visit Website',
  },
  'zh-hk': {
    title: '支持組織',
    subtitle: '社群夥伴',
    intro:
      '衷心感謝所有支持 PyCon HK 2026 的組織。你們的參與讓大會能夠與香港及亞洲地區更廣泛的 Python、教育與科技社群保持緊密連結。',
    visitWebsite: '造訪網站',
  },
  'zh-hant': {
    title: '支持組織',
    subtitle: '社群夥伴',
    intro:
      '衷心感謝所有支持 PyCon HK 2026 的組織。你們的參與讓大會能夠與香港及亞洲地區更廣泛的 Python、教育與科技社群保持緊密連結。',
    visitWebsite: '造訪網站',
  },
  'zh-hans': {
    title: '支持组织',
    subtitle: '社区伙伴',
    intro:
      '衷心感谢所有支持 PyCon HK 2026 的组织。你们的参与让大会能够与香港及亚洲地区更广泛的 Python、教育与科技社群保持紧密联系。',
    visitWebsite: '访问网站',
  },
  ja: {
    title: 'コミュニティパートナー',
    subtitle: '協賛組織',
    intro:
      'PyCon HK 2026 を支えてくださるすべての団体に、心より感謝します。皆さまの参加と協力により、香港そしてアジアの Python、教育、テクノロジーの各コミュニティと、より強くつながることができています。',
    visitWebsite: 'ウェブサイトを見る',
  },
  ko: {
    title: '후원 및 협력 커뮤니티',
    subtitle: '파트너 단체',
    intro:
      'PyCon HK 2026을 후원하고 함께하는 커뮤니티 단체에 깊은 감사를 전합니다. 여러분의 참여와 기여는 아시아 파이썬 생태계를 더욱 풍요롭게 만듭니다.',
    visitWebsite: '웹사이트 방문',
  },
};

export const supportingOrganizations: readonly SupportingOrganization[] = [
  {
    slug: 'agile-hong-kong',
    name: {
      en: 'Agile HK',
      'zh-hk': 'Agile HK',
      'zh-hant': 'Agile HK',
      'zh-hans': 'Agile HK',
      ja: 'Agile HK',
      ko: 'Agile HK',
    },
    nameLines: ['Agile HK'],
    imagePath: '/2026/supporting-organizations/agile_hk.webp',
    logoAlt: 'Agile HK Logo',
    url: 'https://www.meetup.com/agile-hong-kong/',
    summary: {
      en: 'Hong Kong meetup community for people who want to learn, practice, and share agile ideas together.',
      'zh-hk':
        '香港的 Agile 社群聚會，讓有興趣學習、實踐及分享 agile 理念的人一起交流。',
      'zh-hant':
        '香港的 Agile 社群聚會，讓有興趣學習、實踐及分享 agile 理念的人一起交流。',
      'zh-hans':
        '香港的 Agile 社区聚会，让有兴趣学习、实践及分享 agile 理念的人一起交流。',
      ja: 'アジャイルの実践と共有を目的とした香港のミートアップコミュニティ。',
      ko: '애자일 실천과 아이디어 공유를 위한 홍콩 밋업 커뮤니티.',
    },
  },
  {
    slug: 'aws-user-group-hong-kong',
    name: {
      en: 'AWS User Group Hong Kong',
      'zh-hk': 'AWS User Group Hong Kong',
      'zh-hant': 'AWS User Group Hong Kong',
      'zh-hans': 'AWS User Group Hong Kong',
      ja: 'AWS User Group Hong Kong',
      ko: 'AWS User Group Hong Kong',
    },
    nameLines: ['AWS User Group Hong Kong'],
    imagePath: '/2026/supporting-organizations/aws_ug_hk.webp',
    logoAlt: 'AWS User Group Hong Kong Logo',
    url: 'https://awsug.hk/',
    summary: {
      en: 'Volunteer-led community for AWS learners and practitioners across talks, workshops, and networking sessions.',
      'zh-hk':
        '由義工推動的 AWS 社群，透過講座、工作坊及聚會連結不同程度的雲端學習者與實踐者。',
      'zh-hant':
        '由義工推動的 AWS 社群，透過講座、工作坊及聚會連結不同程度的雲端學習者與實踐者。',
      'zh-hans':
        '由志愿者推动的 AWS 社区，通过讲座、工作坊及聚会连接不同程度的云端学习者与实践者。',
      ja: 'AWS の学習者とエンジニアをつなぐボランティア主導のコミュニティ。',
      ko: '클라우드 엔지니어와 학습자를 위한 자발적 AWS 사용자 모임.',
    },
  },
  {
    slug: 'dim-sum-labs',
    name: {
      en: 'Dim Sum Labs',
      'zh-hk': '點心實驗室 (Dim Sum Labs)',
      'zh-hant': '點心實驗室 (Dim Sum Labs)',
      'zh-hans': '点心实验室 (Dim Sum Labs)',
      ja: 'Dim Sum Labs',
      ko: 'Dim Sum Labs',
    },
    nameLines: ['Dim Sum Labs'],
    imagePath: '/2026/supporting-organizations/DimSumLab.webp',
    logoAlt: 'Dim Sum Labs Logo',
    url: 'https://www.dimsumlabs.com/',
    summary: {
      en: "Hong Kong's first Hackerspace, providing open creative spaces and resources for makers, coders, and artists.",
      'zh-hk':
        '香港首個 Hackerspace，為創客、程式設計師與藝術家提供開放的創作空間與社群資源。',
      'zh-hant':
        '香港首個 Hackerspace，為創客、程式設計師與藝術家提供開放的創作空間與社群資源。',
      'zh-hans':
        '香港首个 Hackerspace，为创客、程序员与艺术家提供开放的创作空间与社区资源。',
      ja: 'メイカーやプログラマーのための香港初のハッカースペース。',
      ko: '메이커와 개발자를 위한 홍콩 최초의 해커스페이스.',
    },
  },
  {
    slug: 'hkace',
    name: {
      en: 'HKACE - The Hong Kong Association for Computer Education',
      'zh-hk': 'HKACE 香港電腦教育學會',
      'zh-hant': 'HKACE 香港電腦教育學會',
      'zh-hans': 'HKACE 香港电脑教育学会',
      ja: 'HKACE - 香港コンピュータ教育協会',
      ko: 'HKACE - 홍콩 컴퓨터 교육 협회',
    },
    nameLines: ['HKACE', 'The Hong Kong Association for Computer Education'],
    imagePath: '/2026/supporting-organizations/hkace.webp',
    logoAlt: 'HKACE Logo',
    url: 'https://www.hkace.org.hk/',
    summary: {
      en: 'Professional association supporting computer education, teachers, students, and technology learning in Hong Kong.',
      'zh-hk': '支援香港電腦教育、教師發展、學生培育及科技學習的專業團體。',
      'zh-hant': '支援香港電腦教育、教師發展、學生培育及科技學習的專業團體。',
      'zh-hans': '支援香港电脑教育、教师发展、学生培育及科技学习的专业团体。',
      ja: 'コンピュータ教育と指導者育成を支援する香港の専門教育団体。',
      ko: '홍콩의 컴퓨터 교육 및 교사/학생 성장을 지원하는 전문 교육 협회.',
    },
  },
  {
    slug: 'cityu-cssc',
    name: {
      en: 'City University of Hong Kong Computer Science Student Chapter',
      'zh-hk': '香港城市大學計算機科學系學生會',
      'zh-hant': '香港城市大學計算機科學系學生會',
      'zh-hans': '香港城市大学计算机科学系学生会',
      ja: 'City University of Hong Kong Computer Science Student Chapter',
      ko: '홍콩시립대학교 컴퓨터과학과 학생 챕터',
    },
    nameLines: ['City University of Hong Kong', 'Computer Science Student Chapter'],
    imagePath: '/2026/supporting-organizations/cityu_cssc.webp',
    logoAlt: 'City University of Hong Kong CS Student Chapter Logo',
    url: 'https://www.cs.cityu.edu.hk/',
    summary: {
      en: 'Student chapter fostering technical skills, hackathons, and industry exposure for aspiring computer scientists at CityU.',
      'zh-hk': '致力培育城大計算機科學系學生的技術能力、黑客松競賽經驗與業界交流機會。',
      'zh-hant':
        '致力培育城大計算機科學系學生的技術能力、黑客松競賽經驗與業界交流機會。',
      'zh-hans':
        '致力培育城大计算机科学系学生的技术能力、黑客松竞赛经验与业界交流机会。',
      ja: '学生エンジニアのスキルアップと業界交流を促す CityU の学生チャプター。',
      ko: '홍콩시립대 컴퓨터과학과 학생들의 기술 학습 및 교류를 위한 학생 챕터.',
    },
  },
  {
    slug: 'codeaholics',
    name: {
      en: 'Codeaholics',
      'zh-hk': 'Codeaholics',
      'zh-hant': 'Codeaholics',
      'zh-hans': 'Codeaholics',
      ja: 'Codeaholics',
      ko: 'Codeaholics',
    },
    nameLines: ['Codeaholics'],
    imagePath: '/2026/supporting-organizations/codeaholics.webp',
    logoAlt: 'Codeaholics Logo',
    url: 'https://www.facebook.com/codeaholics/',
    summary: {
      en: 'Developer community focused on practical talks and workshops that connect local engineers in Hong Kong.',
      'zh-hk': '以務實技術分享和工作坊為主的開發者社群，連結香港本地工程師。',
      'zh-hant': '以務實技術分享和工作坊為主的開發者社群，連結香港本地工程師。',
      'zh-hans': '以务实技术分享和工作坊为主的开发者社区，连接香港本地工程师。',
      ja: '実践的な技術トークやワークショップを開催する開発者コミュニティ。',
      ko: '실용적인 기술 세션과 워크숍을 진행하는 개발자 모임.',
    },
  },
  {
    slug: 'eduhk-math-it',
    name: {
      en: 'Department of Mathematics and Information Techonology, The EdUHK',
      'zh-hk': '香港教育大學數學與資訊科技學系',
      'zh-hant': '香港教育大學數學與資訊科技學系',
      'zh-hans': '香港教育大学数学与资讯科技学系',
      ja: '香港教育大学 数学・情報技術学部',
      ko: '홍콩교육대학교 수학 및 정보기술학과',
    },
    nameLines: ['Department of Mathematics and', 'Information Techonology, The EdUHK'],
    imagePath: '/2026/supporting-organizations/eduhk_math_it_dept.svg',
    logoAlt: 'EdUHK Math and IT Department Logo',
    url: 'https://www.eduhk.hk/mit/en/',
    summary: {
      en: 'Academic department advancing mathematics, information technology, research, and pedagogy for future educators.',
      'zh-hk': '致力推動數學、資訊科技、研究及教學發展，培育未來教育工作者的學術部門。',
      'zh-hant':
        '致力推動數學、資訊科技、研究及教學發展，培育未來教育工作者的學術部門。',
      'zh-hans':
        '致力推动数学、信息技术、研究及教学发展，培育未来教育工作者的学术部门。',
      ja: '数学・IT・教育研究の発展を担う香港教育大学の学部。',
      ko: '수학, 정보기술 및 교육학 발전을 선도하는 홍콩교육대학교 학과.',
    },
  },
  {
    slug: 'gdg-cloud-hong-kong',
    name: {
      en: 'Google Developer Group Cloud Hong Kong',
      'zh-hk': 'Google Developer Group Cloud Hong Kong',
      'zh-hant': 'Google Developer Group Cloud Hong Kong',
      'zh-hans': 'Google Developer Group Cloud Hong Kong',
      ja: 'Google Developer Group Cloud Hong Kong',
      ko: 'Google Developer Group Cloud Hong Kong',
    },
    nameLines: ['Google Developer Group', 'Cloud Hong Kong'],
    imagePath: '/2026/supporting-organizations/gdg_cloud_hk.webp',
    logoAlt: 'GDG Cloud Hong Kong Logo',
    url: 'https://gdg.community.dev/gdg-cloud-hong-kong/',
    summary: {
      en: 'Community for developers exploring Google Cloud topics from machine learning to serverless and containers.',
      'zh-hk':
        '讓開發者交流 Google Cloud 主題的社群，涵蓋機器學習、serverless、容器等方向。',
      'zh-hant':
        '讓開發者交流 Google Cloud 主題的社群，涵蓋機器學習、serverless、容器等方向。',
      'zh-hans':
        '让开发者交流 Google Cloud 主题的社区，涵盖机器学习、serverless、容器等方向。',
      ja: 'Google Cloud、機械学習、コンテナ技術を学ぶ開発者コミュニティ。',
      ko: '구글 클라우드 및 머신러닝 기술을 탐구하는 개발자 커뮤니티.',
    },
  },
  {
    slug: 'gdg-hong-kong',
    name: {
      en: 'Google Developer Group Hong Kong',
      'zh-hk': 'Google Developer Group Hong Kong',
      'zh-hant': 'Google Developer Group Hong Kong',
      'zh-hans': 'Google Developer Group Hong Kong',
      ja: 'Google Developer Group Hong Kong',
      ko: 'Google Developer Group Hong Kong',
    },
    nameLines: ['Google Developer Group', 'Hong Kong'],
    imagePath: '/2026/supporting-organizations/gdg_hk.webp',
    logoAlt: 'GDG Hong Kong Logo',
    url: 'https://gdg.community.dev/gdg-hong-kong/',
    summary: {
      en: 'Long-running developer community sharing Google technologies through study groups, workshops, and DevFest events.',
      'zh-hk':
        '歷史悠久的開發者社群，透過讀書會、工作坊及 DevFest 等活動分享 Google 技術。',
      'zh-hant':
        '歷史悠久的開發者社群，透過讀書會、工作坊及 DevFest 等活動分享 Google 技術。',
      'zh-hans':
        '历史悠久的开发者社区，通过读书会、工作坊及 DevFest 等活动分享 Google 技术。',
      ja: '勉強会や DevFest などのイベントを通じて技術共有を行うコミュニティ。',
      ko: '스터디 및 DevFest 등 다양한 개발 행사를 주최하는 GDG 홍콩 챕터.',
    },
  },
  {
    slug: 'wtia',
    name: {
      en: 'Hong Kong Wireless Technology Industry Association',
      'zh-hk': '香港無線科技商會 (WTIA)',
      'zh-hant': '香港無線科技商會 (WTIA)',
      'zh-hans': '香港无线科技商会 (WTIA)',
      ja: '香港無線技術産業協会 (WTIA)',
      ko: '홍콩 무선 기술 산업 협회 (WTIA)',
    },
    nameLines: ['Hong Kong Wireless Technology', 'Industry Association (WTIA)'],
    imagePath: '/2026/supporting-organizations/wtia.webp',
    logoAlt: 'WTIA Logo',
    url: 'https://hkwtia.org/',
    summary: {
      en: 'Trade association helping advance wireless, mobile, and emerging technology communities in Hong Kong.',
      'zh-hk': '推動香港無線、流動及新興科技產業與社群發展的業界組織。',
      'zh-hant': '推動香港無線、流動及新興科技產業與社群發展的業界組織。',
      'zh-hans': '推动香港无线、流动及新兴科技产业与社区发展的业界组织。',
      ja: '無線・モバイル・スマート技術産業の発展を後押しする業界団体。',
      ko: '무선 및 모바일 신기술 생태계 발전을 이끄는 산업 협회.',
    },
  },
  {
    slug: 'internet-society-hong-kong',
    name: {
      en: 'Internet Society Hong Kong',
      'zh-hk': '香港互聯網協會 (ISOC HK)',
      'zh-hant': '香港互聯網協會 (ISOC HK)',
      'zh-hans': '香港互联网协会 (ISOC HK)',
      ja: 'Internet Society Hong Kong',
      ko: '인터넷 소사이어티 홍콩 챕터',
    },
    nameLines: ['Internet Society Hong Kong'],
    imagePath: '/2026/supporting-organizations/internet_society.webp',
    logoAlt: 'Internet Society Hong Kong Logo',
    url: 'https://www.isoc.hk/',
    summary: {
      en: 'Advocates for an open, neutral, reliable, and accessible internet through standards, governance, and infrastructure work.',
      'zh-hk': '透過標準、治理及基礎建設工作，推動開放、中立、可靠且可及的互聯網。',
      'zh-hant': '透過標準、治理及基礎建設工作，推動開放、中立、可靠且可及的互聯網。',
      'zh-hans': '通过标准、治理及基础建设工作，推动开放、中立、可靠且可及的互联网。',
      ja: 'オープンで中立なインターネットの普及とガバナンスを推進する団体。',
      ko: '개방적이고 안전한 인터넷 생태계 조성을 위한 글로벌 비영리 협회.',
    },
  },
  {
    slug: 'japanese-raspberry-pi-users-group',
    name: {
      en: 'Japanese Raspberry Pi Users Group (Raspberry JAM Tokyo)',
      'zh-hk': '日本樹莓派用戶組 (Raspberry JAM Tokyo)',
      'zh-hant': '日本樹莓派用戶組 (Raspberry JAM Tokyo)',
      'zh-hans': '日本树莓派用户组 (Raspberry JAM Tokyo)',
      ja: '日本 Raspberry Pi ユーザグループ (Raspberry JAM Tokyo)',
      ko: '일본 라즈베리 파이 사용자 모임 (Raspberry JAM Tokyo)',
    },
    nameLines: ['Japanese Raspberry Pi Users Group', '(Raspberry JAM Tokyo)'],
    imagePath: '/2026/supporting-organizations/japan_rpi_ug.webp',
    logoAlt: 'Japanese Raspberry Pi Users Group Logo',
    url: 'https://www.raspi.jp/',
    summary: {
      en: 'Raspberry Pi community from Japan supporting hardware learning, making, and regional meetup collaboration.',
      'zh-hk':
        '來自日本的 Raspberry Pi 社群，推動硬件學習、創作實踐及跨地區 meetup 協作。',
      'zh-hant':
        '來自日本的 Raspberry Pi 社群，推動硬件學習、創作實踐及跨地區 meetup 協作。',
      'zh-hans':
        '来自日本的 Raspberry Pi 社区，推动硬件学习、创作实践及跨地区 meetup 协作。',
      ja: 'ハードウェア創作と地域間交流を促進する日本の Raspberry Pi コミュニティ。',
      ko: '라즈베리 파이 하드웨어 메이킹 및 아시아 협력을 지원하는 일본 사용자 모임.',
    },
  },
  {
    slug: 'product-tank-hong-kong',
    name: {
      en: 'Product Tank Hong Kong',
      'zh-hk': 'ProductTank Hong Kong',
      'zh-hant': 'ProductTank Hong Kong',
      'zh-hans': 'ProductTank Hong Kong',
      ja: 'ProductTank Hong Kong',
      ko: 'ProductTank Hong Kong',
    },
    nameLines: ['Product Tank Hong Kong'],
    imagePath: '/2026/supporting-organizations/ProductTank.webp',
    logoAlt: 'ProductTank Hong Kong Logo',
    url: 'https://www.mindtheproduct.com/producttank/hong-kong/',
    summary: {
      en: 'Informal community meetups for product managers, UX designers, and tech leaders to share insights and build connections.',
      'zh-hk': '為產品經理、UX 設計師與技術團隊提供交流與分享實戰經驗的社群。',
      'zh-hant': '為產品經理、UX 設計師與技術團隊提供交流與分享實戰經驗的社群。',
      'zh-hans': '为产品经理、UX 设计师与技术团队提供交流与分享实战经验的社区。',
      ja: 'プロダクトマネージャーやデザイナーがつながる香港のミートアップ。',
      ko: '프로덕트 매니저, 디자이너, 기술 리더를 위한 실무 인사이트 교류 모임.',
    },
  },
  {
    slug: 'pyladies-hong-kong',
    name: {
      en: 'PyLadies Hong Kong',
      'zh-hk': 'PyLadies Hong Kong',
      'zh-hant': 'PyLadies Hong Kong',
      'zh-hans': 'PyLadies Hong Kong',
      ja: 'PyLadies Hong Kong',
      ko: 'PyLadies Hong Kong',
    },
    nameLines: ['PyLadies Hong Kong'],
    imagePath: '/2026/supporting-organizations/pyladies_hk.svg',
    logoAlt: 'PyLadies Hong Kong Logo',
    url: 'https://linktr.ee/pyladieshk',
    summary: {
      en: 'Community that encourages women to participate, lead, and build lasting connections in Python and open source.',
      'zh-hk': '鼓勵女性參與、帶領並在 Python 與開源社群中建立長遠連結的社群。',
      'zh-hant': '鼓勵女性參與、帶領並在 Python 與開源社群中建立長遠連結的社群。',
      'zh-hans': '鼓励女性参与、带领并在 Python 与开源社区中建立长远连接的社区。',
      ja: '女性エンジニアの Python コミュニティ参加とリーダーシップを支援する団体。',
      ko: '여성 개발자의 파이썬 오픈소스 참여와 리더십을 격려하는 커뮤니티.',
    },
  },
  {
    slug: 'pyladies-seoul',
    name: {
      en: 'PyLadies Seoul / Korea',
      'zh-hk': 'PyLadies Seoul / Korea',
      'zh-hant': 'PyLadies Seoul / Korea',
      'zh-hans': 'PyLadies Seoul / Korea',
      ja: 'PyLadies Seoul / Korea',
      ko: '파이레이디스 서울 / 한국 (PyLadies Seoul)',
    },
    nameLines: ['PyLadies Seoul / Korea'],
    imagePath: '/2026/supporting-organizations/pyladies_seoul.webp',
    logoAlt: 'PyLadies Seoul Logo',
    url: 'https://pyladies-seoul.github.io/',
    summary: {
      en: 'Korean chapter of PyLadies connecting female Python developers through study jams, workshops, and friendly meetups.',
      'zh-hk':
        'PyLadies 韓國分會，透過讀書會、工作坊及技術聚會連結女性 Python 開發者。',
      'zh-hant':
        'PyLadies 韓國分會，透過讀書會、工作坊及技術聚會連結女性 Python 開發者。',
      'zh-hans':
        'PyLadies 韩国分会，通过读书会、工作坊及技术聚会连接女性 Python 开发者。',
      ja: '韓国の女性 Python 開発者をサポートする PyLadies ソウル支部。',
      ko: '한국의 여성 파이썬 개발자들이 함께 성장하고 소통하는 파이레이디스 서울 모임.',
    },
  },
  {
    slug: 'pyladies-tokyo',
    name: {
      en: 'PyLadies Tokyo',
      'zh-hk': 'PyLadies Tokyo',
      'zh-hant': 'PyLadies Tokyo',
      'zh-hans': 'PyLadies Tokyo',
      ja: 'PyLadies Tokyo',
      ko: 'PyLadies Tokyo',
    },
    nameLines: ['PyLadies Tokyo'],
    imagePath: '/2026/supporting-organizations/pyladies_tokyo.webp',
    logoAlt: 'PyLadies Tokyo Logo',
    url: 'https://tokyo.pyladies.com/',
    summary: {
      en: 'Tokyo branch of PyLadies connecting Python practitioners through regular meetups and collaborative events.',
      'zh-hk': 'PyLadies 東京分會，透過定期聚會與合作活動連結不同 Python 實踐者。',
      'zh-hant': 'PyLadies 東京分會，透過定期聚會與合作活動連結不同 Python 實踐者。',
      'zh-hans': 'PyLadies 东京分会，通过定期聚会与合作活动连接不同 Python 实践者。',
      ja: '月例ミートアップや協同イベントを通じて活動する PyLadies 東京支部。',
      ko: '정기 밋업과 협력 활동을 통해 소통하는 파이레이디스 도쿄 지부.',
    },
  },
  {
    slug: 'python-asia-organization',
    name: {
      en: 'Python Asia Organization',
      'zh-hk': 'Python Asia Organization',
      'zh-hant': 'Python Asia Organization',
      'zh-hans': 'Python Asia Organization',
      ja: 'Python Asia Organization',
      ko: 'Python Asia Organization',
    },
    nameLines: ['Python Asia Organization'],
    imagePath: '/2026/supporting-organizations/python_asia.webp',
    logoAlt: 'Python Asia Organization Logo',
    url: 'https://pythonasia.org/',
    summary: {
      en: 'Non-profit supporting regional Python conferences, leadership development, and cross-community collaboration across Asia.',
      'zh-hk': '支援亞洲區域 Python 會議、社群領袖培育及跨社群協作的非牟利組織。',
      'zh-hant': '支援亞洲區域 Python 會議、社群領袖培育及跨社群協作的非牟利組織。',
      'zh-hans': '支援亚洲区域 Python 会议、社区领袖培育及跨社区协作的非牟利组织。',
      ja: 'アジア各地の Python カンファレンス開催とリーダー育成を推進する非営利組織。',
      ko: '아시아 전역의 파이썬 컨퍼런스와 커뮤니티 리더십을 지원하는 비영리 단체.',
    },
  },
  {
    slug: 'women-techmakers-hong-kong',
    name: {
      en: 'Women Techmakers Hong Kong',
      'zh-hk': 'Women Techmakers Hong Kong',
      'zh-hant': 'Women Techmakers Hong Kong',
      'zh-hans': 'Women Techmakers Hong Kong',
      ja: 'Women Techmakers Hong Kong',
      ko: 'Women Techmakers Hong Kong',
    },
    nameLines: ['Women Techmakers Hong Kong'],
    imagePath: '/2026/supporting-organizations/WTMHK.webp',
    logoAlt: 'Women Techmakers Hong Kong Logo',
    url: 'https://www.womentechmakers.com/',
    summary: {
      en: 'Google program providing visibility, community, and resources for women in technology to thrive and lead in Hong Kong.',
      'zh-hk': '為女性科技從業者提供社群支持、技術培訓與發揮潛能平台的計劃。',
      'zh-hant': '為女性科技從業者提供社群支持、技術培訓與發揮潛能平台的計劃。',
      'zh-hans': '为女性科技从业者提供社区支持、技术培训与发挥潜能平台的计划。',
      ja: 'テクノロジー分野で活躍する女性を支援する Google 主導のプログラム。',
      ko: '여성 기술인들의 성장과 리더십을 지원하는 구글의 글로벌 이니셔티브 홍콩 챕터.',
    },
  },
];
