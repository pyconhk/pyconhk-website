import type { CfpLocale } from '@/years/2026/locales';

type BusRouteId = '793' | '795X' | '796X' | '290X';

type VisitorGuideCopy = {
  mtrTitle: string;
  busTitle: string;
  busIntro: string;
  routeLabel: string;
  journeyLabel: string;
  stopLabel: string;
  routes: Record<BusRouteId, { journey: string; stop: string }>;
  serviceNote: string;
  taxiTitle: string;
  taxi: string;
  discountTitle: string;
  discount: string;
  discountLinkLabel: string;
  diningTitle: string;
  diningLinks: { choiMing: string; metroTown: string };
};

export const busRoutes: { id: BusRouteId; operator: 'Citybus' | 'KMB'; url: string }[] =
  [
    {
      id: '793',
      operator: 'Citybus',
      url: 'https://mobile.citybus.com.hk/nwp3/?f=1&ds=793&dsmode=1&l=1',
    },
    {
      id: '795X',
      operator: 'Citybus',
      url: 'https://mobile.citybus.com.hk/nwp3/?f=1&ds=795X&dsmode=1&l=1',
    },
    {
      id: '796X',
      operator: 'Citybus',
      url: 'https://mobile.citybus.com.hk/nwp3/?f=1&ds=796X&dsmode=1&l=1',
    },
    {
      id: '290X',
      operator: 'KMB',
      url: 'https://search.kmb.hk/TD_SS/290X.pdf',
    },
  ];

export const fareSaverUrl =
  'https://app.kmb.hk/app1933/Menu/PHP/faresaver_TNC.php?back=true';

export const diningDestinations: { id: 'choiMing' | 'metroTown'; url: string }[] = [
  { id: 'choiMing', url: 'https://www.linkhk.com/en/shopCentre/chmxc2' },
  { id: 'metroTown', url: 'https://www.fortunemalls.com.hk/en/shopping/8' },
];

export const visitorGuide: Record<CfpLocale, VisitorGuideCopy> = {
  en: {
    mtrTitle: 'By MTR',
    busTitle: 'By bus',
    busIntro:
      'These routes stop near the campus. Check the direction before boarding and alight at the stop shown below.',
    routeLabel: 'Route',
    journeyLabel: 'Journey',
    stopLabel: 'Alight at',
    routes: {
      '793': {
        journey:
          'So Uk → Tseung Kwan O Industrial Estate, via Sham Shui Po, Mong Kok and Kowloon City',
        stop: 'Tiu Keng Leng Station',
      },
      '795X': {
        journey: 'So Uk → Oscar By The Sea, via Mei Foo, Mong Kok and Yau Ma Tei',
        stop: 'Tiu Keng Leng Station, King Ling Road (opposite the station)',
      },
      '796X': {
        journey: 'LOHAS Park → Hung Hom / To Kwa Wan (circular route)',
        stop: 'Tiu Keng Leng Station',
      },
      '290X': {
        journey: 'Tsuen Wan West Station → LOHAS Park Station',
        stop: 'Tiu Keng Leng (TK586)',
      },
    },
    serviceNote:
      'Check the operators’ latest routes and timetables before travelling. E22S runs only at weekday peak times and is not an option for the conference weekend.',
    taxiTitle: 'By taxi',
    taxi: 'Ask the driver for Hong Kong Design Institute (HKDI) / IVE (Lee Wai Lee), 3 King Ling Road, Tseung Kwan O. HKIIT is on the same campus.',
    discountTitle: 'KMB fare saver',
    discount:
      'The KMB fare saver kiosk is on the ground floor of HKDI Block C. Use the same Adult or Student Octopus to take a KMB bus, tap the kiosk, then take another eligible KMB service within the same service day (04:45 to 04:44 the next day) for a discount of up to HK$4. If you only tap the kiosk before taking a bus, the discount is up to HK$2. The operator’s terms apply.',
    discountLinkLabel: 'Read KMB’s offer and terms',
    diningTitle: 'Nearby dining',
    diningLinks: { choiMing: 'Choi Ming Shopping Centre', metroTown: 'Metro Town' },
  },
  'zh-hk': {
    mtrTitle: '搭港鐵',
    busTitle: '搭巴士',
    busIntro:
      '以下路線會經過校園附近。上車前記得睇清楚行車方向，再喺下面列出嘅車站落車。',
    routeLabel: '路線',
    journeyLabel: '行車路線',
    stopLabel: '落車站',
    routes: {
      '793': {
        journey: '蘇屋 → 將軍澳工業邨，經深水埗、旺角同九龍城',
        stop: '調景嶺站',
      },
      '795X': {
        journey: '蘇屋 → 清水灣半島，經美孚、旺角同油麻地',
        stop: '景嶺路「調景嶺站」（港鐵站對面）',
      },
      '796X': {
        journey: '康城站 → 紅磡／土瓜灣（循環線）',
        stop: '調景嶺站',
      },
      '290X': {
        journey: '荃灣西站 → 康城站',
        stop: '調景嶺（TK586）',
      },
    },
    serviceNote:
      '出發前記得睇返巴士公司最新嘅路線同時間表。E22S 只喺平日繁忙時間行走，大會嗰個週末搭唔到。',
    taxiTitle: '搭的士',
    taxi: '可以同司機講去將軍澳景嶺路 3 號「香港知專設計學院（HKDI）／IVE（李惠利）」。HKIIT 喺同一個校園。',
    discountTitle: '九巴車費優惠',
    discount:
      '九巴轉乘優惠拍卡機喺 HKDI C 座地下。用同一張成人或學生八達通，先搭九巴、再到拍卡機拍卡，然後喺同一服務日內（凌晨 4:45 至翌日凌晨 4:44）再搭合資格九巴路線，可以減最多 HK$4。如果只係先拍卡再搭巴士，就可以減最多 HK$2。詳情以九巴條款為準。',
    discountLinkLabel: '睇九巴優惠同條款',
    diningTitle: '附近有咩食',
    diningLinks: { choiMing: '彩明商場', metroTown: '都會駅（Metro Town）' },
  },
  'zh-hant': {
    mtrTitle: '港鐵',
    busTitle: '巴士',
    busIntro: '以下路線途經校園附近。上車前請確認行車方向，並於下列車站下車。',
    routeLabel: '路線',
    journeyLabel: '行車路線',
    stopLabel: '下車站',
    routes: {
      '793': {
        journey: '蘇屋 → 將軍澳工業邨，途經深水埗、旺角及九龍城',
        stop: '調景嶺站',
      },
      '795X': {
        journey: '蘇屋 → 清水灣半島，途經美孚、旺角及油麻地',
        stop: '景嶺路「調景嶺站」（港鐵站對面）',
      },
      '796X': {
        journey: '康城站 → 紅磡／土瓜灣（循環線）',
        stop: '調景嶺站',
      },
      '290X': {
        journey: '荃灣西站 → 康城站',
        stop: '調景嶺（TK586）',
      },
    },
    serviceNote:
      '出發前請查閱巴士公司的最新路線及時間表。E22S 只於平日繁忙時間行走，不適用於大會舉行的週末。',
    taxiTitle: '的士',
    taxi: '請向司機說明目的地為將軍澳景嶺路 3 號「香港知專設計學院（HKDI）／IVE（李惠利）」。HKIIT 位於同一校園。',
    discountTitle: '九巴車費優惠',
    discount:
      '九巴轉乘優惠拍卡機位於 HKDI C 座地下。使用同一張成人或學生八達通，先乘搭九巴，再於拍卡機拍卡，然後在同一服務日內（凌晨 4:45 至翌日凌晨 4:44）再次乘搭合資格九巴班次，可享最高 HK$4 車費優惠。若只先拍卡再乘車，則可享最高 HK$2 優惠。詳情以九巴條款為準。',
    discountLinkLabel: '查看九巴優惠及條款',
    diningTitle: '附近餐飲',
    diningLinks: { choiMing: '彩明商場', metroTown: '都會駅（Metro Town）' },
  },
  'zh-hans': {
    mtrTitle: '港铁',
    busTitle: '巴士',
    busIntro: '以下路线途经校园附近。上车前请确认行车方向，并在下列车站下车。',
    routeLabel: '路线',
    journeyLabel: '行车路线',
    stopLabel: '下车站',
    routes: {
      '793': {
        journey: '苏屋 → 将军澳工业邨，途经深水埗、旺角及九龙城',
        stop: '调景岭站',
      },
      '795X': {
        journey: '苏屋 → 清水湾半岛，途经美孚、旺角及油麻地',
        stop: '景岭路“调景岭站”（港铁站对面）',
      },
      '796X': {
        journey: '康城站 → 红磡／土瓜湾（循环线）',
        stop: '调景岭站',
      },
      '290X': {
        journey: '荃湾西站 → 康城站',
        stop: '调景岭（TK586）',
      },
    },
    serviceNote:
      '出发前请查看巴士公司的最新路线及时间表。E22S 仅在工作日高峰时段运营，不适用于大会举办的周末。',
    taxiTitle: '出租车',
    taxi: '请向司机说明目的地为将军澳景岭路 3 号“香港知专设计学院（HKDI）／IVE（李惠利）”。HKIIT 位于同一校园。',
    discountTitle: '九巴车费优惠',
    discount:
      '九巴换乘优惠刷卡机位于 HKDI C 座地面层。使用同一张成人或学生八达通，先乘坐九巴，再到优惠机刷卡，然后在同一服务日内（凌晨 4:45 至次日凌晨 4:44）再次乘坐符合条件的九巴班次，可享最高 HK$4 车费优惠。若仅先刷优惠机再乘车，则可享最高 HK$2 优惠。详情以九巴条款为准。',
    discountLinkLabel: '查看九巴优惠及条款',
    diningTitle: '附近餐饮',
    diningLinks: { choiMing: '彩明商场', metroTown: '都会駅（Metro Town）' },
  },
  ja: {
    mtrTitle: 'MTR でお越しの場合',
    busTitle: 'バスでお越しの場合',
    busIntro:
      '以下の路線がキャンパスの近くに停車します。乗車前に行き先を確認し、下記の停留所で降りてください。',
    routeLabel: '路線',
    journeyLabel: '運行区間',
    stopLabel: '下車する停留所',
    routes: {
      '793': {
        journey:
          'So Uk → Tseung Kwan O Industrial Estate（Sham Shui Po・Mong Kok・Kowloon City 経由）',
        stop: '調景嶺駅（Tiu Keng Leng Station）',
      },
      '795X': {
        journey: 'So Uk → Oscar By The Sea（Mei Foo・Mong Kok・Yau Ma Tei 経由）',
        stop: 'Tiu Keng Leng Station, King Ling Road（駅の向かい側）',
      },
      '796X': {
        journey: 'LOHAS Park → Hung Hom / To Kwa Wan（循環路線）',
        stop: '調景嶺駅（Tiu Keng Leng Station）',
      },
      '290X': {
        journey: 'Tsuen Wan West Station → LOHAS Park Station',
        stop: 'Tiu Keng Leng（TK586）',
      },
    },
    serviceNote:
      '出発前に、バス会社の最新の路線と時刻表をご確認ください。E22S は平日のラッシュ時のみ運行するため、カンファレンスが開催される週末は利用できません。',
    taxiTitle: 'タクシーでお越しの場合',
    taxi: '運転手に「香港知專設計學院（HKDI）／IVE（李惠利）、將軍澳景嶺路3號（3 King Ling Road, Tseung Kwan O）」とお伝えください。HKIIT は同じキャンパス内にあります。',
    discountTitle: 'KMB バスの運賃割引',
    discount:
      'HKDI C棟の地上階に KMB の割引端末があります。同じ大人用または学生用の Octopus カードで KMB バスに乗車し、端末にタッチしてから、同じサービス日（午前4:45〜翌日午前4:44）に対象の KMB バスに再度乗車すると、最大 HK$4 の割引を受けられます。端末へのタッチ後に初めて乗車する場合は、最大 HK$2 の割引です。詳しくは KMB の利用条件をご確認ください。',
    discountLinkLabel: 'KMB の割引と利用条件を見る',
    diningTitle: '周辺のお食事',
    diningLinks: {
      choiMing: '彩明商場（Choi Ming Shopping Centre）',
      metroTown: '都會駅（Metro Town）',
    },
  },
  ko: {
    mtrTitle: 'MTR 이용 안내',
    busTitle: '버스 이용 안내',
    busIntro:
      '아래 노선은 캠퍼스 근처에 정차합니다. 탑승 전에 운행 방향을 확인하고 아래에 안내된 정류장에서 내리세요.',
    routeLabel: '노선',
    journeyLabel: '운행 구간',
    stopLabel: '하차 정류장',
    routes: {
      '793': {
        journey:
          'So Uk → Tseung Kwan O Industrial Estate (Sham Shui Po, Mong Kok, Kowloon City 경유)',
        stop: '티우켕렝역 (Tiu Keng Leng Station)',
      },
      '795X': {
        journey: 'So Uk → Oscar By The Sea (Mei Foo, Mong Kok, Yau Ma Tei 경유)',
        stop: 'Tiu Keng Leng Station, King Ling Road (역 맞은편)',
      },
      '796X': {
        journey: 'LOHAS Park → Hung Hom / To Kwa Wan (순환 노선)',
        stop: '티우켕렝역 (Tiu Keng Leng Station)',
      },
      '290X': {
        journey: 'Tsuen Wan West Station → LOHAS Park Station',
        stop: 'Tiu Keng Leng (TK586)',
      },
    },
    serviceNote:
      '출발 전에 버스 회사의 최신 노선과 시간표를 확인해 주세요. E22S는 평일 출퇴근 시간대에만 운행하므로 행사가 열리는 주말에는 이용하실 수 없습니다.',
    taxiTitle: '택시 이용 안내',
    taxi: '기사님께 목적지를 Hong Kong Design Institute(HKDI) / IVE(Lee Wai Lee), 3 King Ling Road, Tseung Kwan O로 알려 주세요. HKIIT는 같은 캠퍼스 안에 있습니다.',
    discountTitle: 'KMB 버스 요금 할인',
    discount:
      'HKDI C동 지상층에 KMB 할인 단말기가 있습니다. 같은 성인용 또는 학생용 옥토퍼스 카드로 KMB 버스에 탑승한 뒤 단말기에 카드를 태그하고, 같은 서비스일(오전 4:45부터 다음 날 오전 4:44까지)에 할인 대상 KMB 버스에 다시 탑승하면 최대 HK$4를 할인받을 수 있습니다. 버스 탑승 없이 단말기에 먼저 태그한 뒤 탑승하면 할인액은 최대 HK$2입니다. 자세한 내용은 KMB 이용 조건을 확인해 주세요.',
    discountLinkLabel: 'KMB 할인 및 이용 조건 보기',
    diningTitle: '근처 식사 장소',
    diningLinks: {
      choiMing: 'Choi Ming Shopping Centre (彩明商場)',
      metroTown: 'Metro Town (都會駅)',
    },
  },
};
