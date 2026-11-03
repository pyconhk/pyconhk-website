import type { CfpLocale } from '@/years/2026/locales';

type LogisticsCopy = {
  materialsTitle: string;
  materialsBody: string;
  materialsComputer: string;
  materialsLink: string;
  materialsAccess: string;
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

export const lightningTalkLogistics: Record<CfpLocale, LogisticsCopy> = {
  en: {
    materialsTitle: 'Submit your talk materials',
    materialsBody:
      'Confirmed speakers must submit their materials to the designated Google Drive folder by 16:00 Hong Kong time (UTC+8) on 14 November 2026. Submit the actual file, or a document or link pointing to your presentation or demo. If you are speaking without slides, state this in your submission.',
    materialsComputer:
      'All presentations and demos must use the designated conference computer because of the limited time and recording setup. Switching to your own laptop is not available.',
    materialsLink: 'Open materials submission folder',
    materialsAccess:
      'The folder is for invited speakers only. Sign in with the Google account invited by the organizers. If you need access, reply to your confirmation email with the Google account you will use.',
    faqTitle: 'Lightning Talk FAQ',
    faqs: [
      {
        question: 'Do I have to use Google Slides?',
        answer:
          'No. You can submit the actual file, or a document or link pointing to your presentation or demo. Google Slides is not required.',
      },
      {
        question: 'Can I give a talk without slides?',
        answer:
          'Yes. State that you will not use slides in your submission to the materials folder by the same 16:00 deadline.',
      },
      {
        question: 'Can I demo WebAssembly or something on my own server?',
        answer:
          'Yes, including a WebAssembly demo in a browser or a demo at your own server URL. Include the URL and any instructions, and ensure that it works on the designated conference computer.',
      },
      {
        question: 'Can I use my own computer?',
        answer:
          'No. All presentations and demos must run on the designated conference computer because of the limited time and recording setup. There is no laptop switch.',
      },
      {
        question: 'What happens at five minutes?',
        answer: 'A gong sounds at the five-minute mark. End your talk when it sounds.',
      },
    ],
  },
  'zh-hk': {
    materialsTitle: '提交演講素材',
    materialsBody:
      '已確認嘅講者要喺 2026 年 11 月 14 日香港時間（UTC+8）16:00 前，將材料交去指定 Google Drive 資料夾。可以交實際檔案，或者一份指向簡報或示範嘅文件／連結。如果唔用投影片，都要喺提交內容寫明。',
    materialsComputer:
      '因為時間有限，同埋要配合錄影安排，所有簡報同示範都必須用大會指定電腦，唔可以中途轉用自己部手提電腦。',
    materialsLink: '開啟材料提交資料夾',
    materialsAccess:
      '文件夾只限受邀講者使用。請用籌辦團隊邀請嘅 Google 帳戶登入；如果未有權限，請回覆確認電郵，提供你會用嘅 Google 帳戶。',
    faqTitle: '閃電演講常見問題',
    faqs: [
      {
        question: '一定要用 Google Slides？',
        answer:
          '唔使。可以交實際檔案，或者一份指向簡報或示範嘅文件／連結，唔一定要用 Google Slides。',
      },
      {
        question: '可唔可以唔用投影片？',
        answer:
          '可以。喺同一個 16:00 截止時間前，去材料資料夾提交內容，寫明你唔會用投影片。',
      },
      {
        question: '可唔可以示範 WebAssembly 或者自己伺服器上嘅嘢？',
        answer:
          '可以，例如喺瀏覽器示範 WebAssembly，或者開自己伺服器嘅網址。請附上網址同所需操作指示，並確保示範可以喺大會指定電腦運行。',
      },
      {
        question: '可唔可以用自己部電腦？',
        answer:
          '唔可以。因為時間有限，同埋要配合錄影安排，所有簡報同示範都要用大會指定電腦，唔會安排轉駁自己部手提電腦。',
      },
      {
        question: '夠五分鐘會點？',
        answer: '五分鐘一到就會敲鑼。聽到鑼聲就要結束演講。',
      },
    ],
  },
  'zh-hant': {
    materialsTitle: '提交演講材料',
    materialsBody:
      '已確認的講者須於 2026 年 11 月 14 日香港時間（UTC+8）16:00 前，將材料提交至指定 Google Drive 資料夾。可提交實際檔案，或指向簡報或示範的文件／連結。如不使用投影片，亦請在提交內容中註明。',
    materialsComputer:
      '由於時間有限，並須配合錄影安排，所有簡報及示範均須使用大會指定電腦，不設切換至個人手提電腦的安排。',
    materialsLink: '開啟材料提交資料夾',
    materialsAccess:
      '資料夾僅限受邀講者使用。請以籌辦團隊邀請的 Google 帳戶登入；如需存取權限，請回覆確認電郵並提供將使用的 Google 帳戶。',
    faqTitle: '閃電演講常見問題',
    faqs: [
      {
        question: '必須使用 Google Slides 嗎？',
        answer:
          '不必。您可以提交實際檔案，或指向簡報或示範的文件／連結，並非必須使用 Google Slides。',
      },
      {
        question: '可以不使用投影片嗎？',
        answer:
          '可以。請於相同的 16:00 截止時間前，在材料資料夾提交內容，註明您不會使用投影片。',
      },
      {
        question: '可以示範 WebAssembly 或自己伺服器上的內容嗎？',
        answer:
          '可以，例如在瀏覽器示範 WebAssembly，或開啟自己伺服器上的示範網址。請附上網址及所需操作指示，並確保示範可在大會指定電腦運行。',
      },
      {
        question: '可以使用自己的電腦嗎？',
        answer:
          '不可以。由於時間有限，並須配合錄影安排，所有簡報及示範均須使用大會指定電腦，不設切換至個人手提電腦的安排。',
      },
      {
        question: '五分鐘結束時會怎樣？',
        answer: '五分鐘一到便會敲鑼。請在鑼聲響起時結束演講。',
      },
    ],
  },
  'zh-hans': {
    materialsTitle: '提交演讲材料',
    materialsBody:
      '已确认的讲者须于 2026 年 11 月 14 日香港时间（UTC+8）16:00 前，将材料提交至指定 Google Drive 文件夹。可提交实际文件，或指向演示文稿或演示内容的文档／链接。如不使用幻灯片，也请在提交内容中注明。',
    materialsComputer:
      '由于时间有限，并须配合录制安排，所有演示文稿及演示均须使用大会指定电脑，不安排切换至个人笔记本电脑。',
    materialsLink: '打开材料提交文件夹',
    materialsAccess:
      '文件夹仅限受邀讲者使用。请使用筹办团队邀请的 Google 帐户登录；如需访问权限，请回复确认邮件并提供将使用的 Google 帐户。',
    faqTitle: '闪电演讲常见问题',
    faqs: [
      {
        question: '必须使用 Google Slides 吗？',
        answer:
          '不必。您可以提交实际文件，或指向演示文稿或演示内容的文档／链接，并非必须使用 Google Slides。',
      },
      {
        question: '可以不使用幻灯片吗？',
        answer:
          '可以。请于相同的 16:00 截止时间前，在材料文件夹提交内容，注明您不会使用幻灯片。',
      },
      {
        question: '可以演示 WebAssembly 或自己服务器上的内容吗？',
        answer:
          '可以，例如在浏览器中演示 WebAssembly，或打开自己服务器上的演示网址。请附上网址及所需操作说明，并确保演示可在大会指定电脑上运行。',
      },
      {
        question: '可以使用自己的电脑吗？',
        answer:
          '不可以。由于时间有限，并须配合录制安排，所有演示文稿及演示均须使用大会指定电脑，不安排切换至个人笔记本电脑。',
      },
      {
        question: '五分钟结束时会怎样？',
        answer: '五分钟一到便会敲锣。请在锣声响起时结束演讲。',
      },
    ],
  },
  ja: {
    materialsTitle: '発表資料の提出',
    materialsBody:
      '登壇が確定した方は、2026年11月14日16:00（香港時間、UTC+8）までに、指定の Google Drive フォルダへ資料を提出してください。実際のファイル、またはプレゼンテーションやデモへのリンクを記載した文書・リンクを提出できます。スライドを使わない場合も、その旨を提出内容に明記してください。',
    materialsComputer:
      '時間と収録環境の都合により、すべての発表・デモは大会指定のパソコンを使用します。ご自身のパソコンへの接続切り替えはできません。',
    materialsLink: '資料提出フォルダを開く',
    materialsAccess:
      'フォルダは招待された登壇者のみ利用できます。運営から招待された Google アカウントでログインしてください。アクセスが必要な場合は、登壇確認メールに返信して使用する Google アカウントをお知らせください。',
    faqTitle: 'ライトニングトークのよくある質問',
    faqs: [
      {
        question: 'Google スライドを使う必要がありますか？',
        answer:
          'いいえ。実際のファイル、またはプレゼンテーションやデモを開くための文書・リンクを提出できます。Google スライドに限定されません。',
      },
      {
        question: 'スライドなしで発表できますか？',
        answer:
          'はい。同じ16:00の提出期限までに、資料フォルダへの提出内容にスライドを使わない旨を明記してください。',
      },
      {
        question: 'WebAssembly や自分のサーバーのデモはできますか？',
        answer:
          'はい。ブラウザー上の WebAssembly や、ご自身のサーバーの URL を使ったデモも可能です。URL と必要な操作手順を添え、大会指定のパソコンで動作することを確認してください。',
      },
      {
        question: '自分のパソコンを使えますか？',
        answer:
          'いいえ。時間と収録環境の都合により、すべての発表・デモは大会指定のパソコンを使用します。ご自身のパソコンへの接続切り替えはできません。',
      },
      {
        question: '5分経つとどうなりますか？',
        answer: '5分になったら銅鑼が鳴ります。音が鳴ったら発表を終了してください。',
      },
    ],
  },
  ko: {
    materialsTitle: '발표 자료 제출',
    materialsBody:
      '발표가 확정된 분은 2026년 11월 14일 16:00(홍콩 시간, UTC+8)까지 지정된 Google Drive 폴더에 자료를 제출해야 합니다. 실제 파일이나 발표 또는 데모로 연결되는 문서·링크를 제출할 수 있습니다. 슬라이드를 사용하지 않는 경우에도 제출 내용에 명시해 주세요.',
    materialsComputer:
      '제한된 시간과 녹화 환경 때문에 모든 발표와 데모는 대회 지정 컴퓨터를 사용해야 합니다. 개인 노트북으로 전환할 수 없습니다.',
    materialsLink: '자료 제출 폴더 열기',
    materialsAccess:
      '초대받은 발표자만 폴더를 사용할 수 있습니다. 운영진이 초대한 Google 계정으로 로그인해 주세요. 접근 권한이 필요하면 확정 이메일에 회신하여 사용할 Google 계정을 알려 주세요.',
    faqTitle: '라이트닝 토크 자주 묻는 질문',
    faqs: [
      {
        question: 'Google Slides만 사용해야 하나요?',
        answer:
          '아니요. 실제 파일이나 발표 또는 데모로 연결되는 문서·링크를 제출할 수 있습니다. Google Slides는 필수가 아닙니다.',
      },
      {
        question: '슬라이드 없이 발표할 수 있나요?',
        answer:
          '네. 동일한 제출 마감인 16:00까지 자료 폴더에 제출하면서 슬라이드를 사용하지 않는다고 명시해 주세요.',
      },
      {
        question: 'WebAssembly나 개인 서버의 내용을 시연할 수 있나요?',
        answer:
          '네. 브라우저에서 WebAssembly를 시연하거나 개인 서버 URL을 이용한 데모도 가능합니다. URL과 필요한 실행 방법을 포함하고, 대회 지정 컴퓨터에서 작동하는지 확인해 주세요.',
      },
      {
        question: '개인 컴퓨터를 사용할 수 있나요?',
        answer:
          '아니요. 제한된 시간과 녹화 환경 때문에 모든 발표와 데모는 대회 지정 컴퓨터를 사용해야 합니다. 개인 노트북으로 전환할 수 없습니다.',
      },
      {
        question: '5분이 되면 어떻게 되나요?',
        answer: '5분이 되면 징이 울립니다. 징 소리가 나면 발표를 마쳐 주세요.',
      },
    ],
  },
};
