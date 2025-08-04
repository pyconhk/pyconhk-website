export async function WhatIsSprintChinese() {
  return (
    <section id='what-is-sprint-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        Sprint 是什麼？
      </h2>
      <p className='mt-4'>
        <strong>Sprint</strong> 全名為 <strong>Development Sprint</strong>，
        在台灣翻譯為「衝刺開發」。簡單來說，Sprint 是一個集體開發程式碼的活動，
        匯聚參與開放原始碼專案（Open Source Project）的負責人與貢獻者，
        包括新手與有經驗的專案負責人。參加者於指定時間內共同努力完成特定任務，
        無論是想學習如何參與的新手，還是尋找協作者的專案負責人，Sprint
        都是一個絕佳的機會。
      </p>
    </section>
  );
}

export async function ProceduresOfSprintChinese() {
  return (
    <section id='procedures-of-sprint-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        Sprint 當天會發生什麼？
      </h2>
      <div className='mt-4'>
        <ol className='list-decimal ml-6 space-y-2 mt-4'>
          <li className='md:pl-2'>
            <strong>專案介紹</strong>：由 Sprint Lead
            逐一介紹各自的開放原始碼專案，包括專案概況與目標。
          </li>
          <li className='md:pl-2'>
            <strong>自由組隊</strong>
            ：參加者根據興趣與能力選擇加入不同小組，並貢獻所長，例如：
            <ul className='list-disc ml-6 mt-4 space-y-2'>
              <li className='md:pl-4'>修復程式錯誤（Bugfix）</li>
              <li className='md:pl-4'>撰寫測試案例（Test Case）</li>
              <li className='md:pl-4'>開發新功能（Enhancement）</li>
              <li className='md:pl-4'>整理數據或進行文本翻譯</li>
              <li className='md:pl-4'>籌辦社群活動</li>
            </ul>
          </li>
          <li className='md:pl-2'>
            <strong>動手實作</strong>：大家一起合作完成任務，無論是開發一個
            Python Library 並上傳至 PyPI，還是幫忙修改一兩個字的小任務，
            都有其價值。
          </li>
          <li className='md:pl-2'>
            <strong>邊做邊學</strong>
            ：過程中可能會遇到困難，但現場有經驗豐富的參加者可以提供指導，學習效率遠超自行研究書籍或影片。
          </li>
        </ol>
      </div>
    </section>
  );
}

export async function SprintVSConferenceChinese() {
  return (
    <section id='sprint-vs-conference-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        Sprint 與 Conference 有什麼不同？
      </h2>
      <p className='mt-4'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr>
              <th className='border px-4 py-2'>Sprint</th>
              <th className='border px-4 py-2'>Conference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border px-4 py-2'>
                強調動手參與，共同協作完成專案
              </td>
              <td className='border px-4 py-2'>
                主要以聆聽講座為主，知識由講者傳遞
              </td>
            </tr>
            <tr>
              <td className='border px-4 py-2'>
                互動性高，技術交流頻繁，結識更多夥伴
              </td>
              <td className='border px-4 py-2'>互動較少，通常為單向學習</td>
            </tr>
            <tr>
              <td className='border px-4 py-2'>
                場地為協作環境，參加者可自由走動
              </td>
              <td className='border px-4 py-2'>通常需固定座位聆聽演講</td>
            </tr>
          </tbody>
        </table>
      </p>
    </section>
  );
}

export async function WhoShouldAttendChinese() {
  return (
    <section id='who-should-attend-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        誰適合參加？
      </h2>
      <div className='mt-4'>
        <ul className='list-disc ml-6 mt-4 space-y-2'>
          <li className='md:pl-2'>喜歡一起動手實作的人</li>
          <li className='md:pl-2'>對開放原碼專案有興趣的人</li>
          <li className='md:pl-2'>希望與其他開發者交流、學習的人</li>
        </ul>
      </div>
    </section>
  );
}

export async function BeginnersSuitableChinese() {
  return (
    <section id='beginners-suitable-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        Python 初學者適合參加嗎？
      </h2>
      <p className='mt-4'>
        非常適合！初學者可以親眼觀察開放原始碼專案的運作方式。當天有不同分工，
        會寫程式的人可以參與程式碼撰寫，
        不熟悉程式碼的人可以協助整理數據、翻譯文本等其他工作，
        總有適合你的貢獻方式！
      </p>
    </section>
  );
}

export async function PreparationsChinese() {
  return (
    <section id='preparations-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        需要準備什麼？
      </h2>
      <div className='mt-4'>
        <ul className='list-disc ml-6 mt-4 space-y-2'>
          <li className='md:pl-2'>
            <strong>設備</strong>：攜帶一台可運行 Python 的電腦。
          </li>
          <li className='md:pl-2'>
            <strong>帳號</strong>：建議事先準備好 GitHub、Bitbucket 或 Gitlab
            帳號，以便上傳程式碼或文件。
          </li>
          <li className='md:pl-2'>
            <strong>心態</strong>：帶著學習與參與的熱情，準備與大家交流！
          </li>
        </ul>
      </div>
    </section>
  );
}

export async function CanObserveChinese() {
  return (
    <section id='can-observe-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        可以只來旁觀嗎？
      </h2>
      <p className='mt-4'>
        可以！歡迎你來觀摩與交流，現場氛圍輕鬆，隨時參與討論。
      </p>
    </section>
  );
}

export async function CanJoinLeaveChinese() {
  return (
    <section id='can-join-leave-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        可以中途加入或離開活動嗎？
      </h2>
      <p className='mt-4'>可以，活動安排靈活，參加者可隨時加入或離開。</p>
    </section>
  );
}

export async function ParticipationFeeChinese() {
  return (
    <section id='participation-fee-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        參加費用多少？
      </h2>
      <p className='mt-4'>完全免費！無需任何費用，放心參加！</p>
    </section>
  );
}

export async function ProjectsValidityChinese() {
  return (
    <section id='projects-validity-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        什麼樣的專案可以參加 Sprint?
      </h2>
      <div className='mt-4'>
        <p>我們歡迎各種開放原始碼專案參與，但若報名數量過多，將優先選擇：</p>
        <ul className='list-disc ml-6 mt-4 space-y-2'>
          <li className='md:pl-2'>與 Python 或 Python 社群相關的專案</li>
          <li className='md:pl-2'>
            與香港本地文化或語言相關的專案（因為這是香港 PyCon.hk）
          </li>
        </ul>
      </div>
    </section>
  );
}

export async function SprintLeadValidityChinese() {
  return (
    <section id='sprint-lead-validity-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        誰可以擔任 Sprint Lead?
      </h2>
      <div className='mt-4'>
        <p>任何有熱情的人都可以擔任 Sprint Lead! 主要職責包括:</p>
        <ul className='list-disc ml-6 mt-4 space-y-2'>
          <li className='md:pl-2'>向參加者介紹你的專案</li>
          <li className='md:pl-2'>協助大家共同完成任務</li>
        </ul>
      </div>
    </section>
  );
}

export async function ResourcesChinese() {
  return (
    <section id='resources-chinese'>
      <div className='mt-4'>
        <p>新手可參考以下資源：</p>
        <ul className='list-disc ml-6 mt-4 space-y-2'>
          <li className='md:pl-2'>
            <a
              href='https://github.com/numfocus/getting-started-with-open-source/blob/master/how_to_organize_an_open_source_sprint.md'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              How to Organize an Open Source Sprint
            </a>
          </li>
          <li className='md:pl-2'>
            <a
              href='https://opensourceevents.github.io/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              The In-Person Event Handbook
            </a>
          </li>
          <li className='md:pl-2'>
            <a
              href='https://us.pycon.org/2024/events/dev-sprints/'
              target='_blank'
              className='text-sky-600 hover:text-sky-800'
            >
              Sprint in PyCon US 2024
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

export async function ProjectsChinese() {
  return (
    <section id='projects-chinese'>
      <h2 className='text-xl md:text-2xl font-bold text-sky-600 mb-4'>
        今年會有哪些專案？
      </h2>
      <p className='mt-4'>
        目前正公開招募 Sprint 專案與 Sprint Lead! 歡迎
        <a href='#' target='_blank' className='text-sky-600 hover:text-sky-800'>
          <span>提交你的開放原始碼專案，或報名成為 Sprint Lead</span>
        </a>
        ，分享你的想法!
      </p>
    </section>
  );
}
