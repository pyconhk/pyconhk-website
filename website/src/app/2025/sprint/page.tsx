import Link from 'next/link';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsBullseye, BsCodeSlash } from 'react-icons/bs';
import {
  FaDiscord,
  FaGithub,
  FaLaptopCode,
  FaRegClock,
  FaUser,
} from 'react-icons/fa6';
import {
  HiOutlineCalendar,
  HiOutlineCursorClick,
  HiOutlineExclamationCircle,
  HiOutlineLightBulb,
} from 'react-icons/hi';
import { LiaMapMarkedAltSolid } from 'react-icons/lia';
import { MdOutlineDescription } from 'react-icons/md';

interface SprintScheduleItem {
  startTime: string;
  endTime: string;
  item: string;
}

interface SprintProject {
  title: string;
  descriptionNode: React.ReactNode;
  goals: string[];
  githubLinkDisplay: string;
  githubLink: string;
  discordChannelDisplay: string;
  discordChannel: string;
  level: string;
  sprintLead: string;
}

const sprintSchedule: SprintScheduleItem[] = [
  { startTime: '09:00', endTime: '10:00', item: 'Registration' },
  { startTime: '10:00', endTime: '10:15', item: 'Opening + Sprint Intro' },
  { startTime: '10:15', endTime: '13:00', item: 'Sprint Session 1' },
  { startTime: '13:00', endTime: '15:00', item: 'Lunch' },
  { startTime: '15:00', endTime: '15:10', item: 'Progress Report' },
  { startTime: '15:10', endTime: '17:45', item: 'Sprint Session 2' },
  { startTime: '17:45', endTime: '18:00', item: 'Closing' },
  { startTime: '18:00', endTime: '', item: 'Dinner at Ban Heung Lau' },
];

const sprintProjects: SprintProject[] = [
  {
    title: 'frame-check',
    descriptionNode: (
      <div>
        A python checker that can check the validity of DataFrame objects
        through the code. It will keep track of the dataframes&apos; schema and
        raise errors if the schema is not respected or if the user is trying to
        access a column that does not exists.
      </div>
    ),
    goals: [
      'Core parser (parsing DF creations, user-specified schema, variable assignment)',
      'Core checker (rules and validators)',
      'LSP / File watcher (if we have time)',
    ],
    githubLinkDisplay: 'github.com/lucianosrp/frame-check',
    githubLink: 'https://github.com/lucianosrp/frame-check',
    discordChannelDisplay: '2025-sprint-frame-check',
    discordChannel: 'https://discord.gg/Ry7aQV4BdF',
    level: 'ALL Levels',
    sprintLead: 'Luciano Scarpulla',
  },
  {
    title: 'L.E.P.A.U.T.E. Framework',
    descriptionNode: (
      <div>
        L.E.P.A.U.T.E. The framework is a visual framework based on Lie group
        theory that accurately models geometric transformations in images and
        improves the performance of CNNs. Recommended Sprint: Strong market
        demand, with applications in robotics and healthcare.
      </div>
    ),
    goals: [
      'Implement the Lie group convolutional layer',
      'Train the self-supervisory model',
      'Test the 3D reconstruction tasks',
    ],
    githubLinkDisplay:
      'github.com/dev1virtuoso/Machine-Learning/Computer Vision/L.E.P.A.U.T.E.',
    githubLink:
      'https://github.com/dev1virtuoso/Machine-Learning/tree/main/Computer%20Vision/L.E.P.A.U.T.E.',
    discordChannelDisplay: '2025-sprint-lepaute',
    discordChannel: 'https://discord.gg/waKXY5GDpz',
    level: 'Intermediate',
    sprintLead: 'Carson',
  },
  {
    title: 'Contribute to Engineering Blog Article Prototypes',
    descriptionNode: (
      <div>
        <p>
          Most startups and companies publish engineering blog articles. During
          the sprint, I will add 2 - 3 projects to the repository. Each
          repository will be a prototype of the architecture described in these
          blog articles, rebuilt with a tech stack we&apos;re comfortable with,
          to understand why those companies took that approach.
        </p>
        <br />
        <p>
          Additionally, most of these blog articles mention &quot;Future
          Work.&quot; I will build the initial prototype, and participants will
          work on the future work items mentioned.
        </p>
        <br />
        <p>
          For example, Uber released their Enhanced Agentic RAG solution. In
          their future work, they highlighted pending features like OCR support,
          Multimodal RAG, and Chain-of-RAG for multi-hop reasoning. I will build
          the initial Enhanced Agentic RAG pipeline, and participants can
          implement the future work items. I will guide them with resources and
          resolve doubts. Those who contribute will receive Streamlit swags, and
          I also have 2 - 3 Google swags.
        </p>
      </div>
    ),
    goals: [
      'Understand how big tech companies build their AI systems by understanding the architecture',
      'Build projects that create impact and are used in the industry rather than copy-pasting the project',
    ],
    githubLinkDisplay: 'github.com/lucifertrj/case-study-series',
    githubLink: 'https://github.com/lucifertrj/case-study-series',
    discordChannelDisplay: '2025-sprint-blog-articles',
    discordChannel: 'https://discord.gg/A7RNeYqkHx',
    level: 'ALL Levels',
    sprintLead: 'Tarun Jain',
  },
];

export default async function Sprint() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        Sprint Day
      </h1>

      <div className='bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg mb-12'>
        <h2 className='text-xl font-bold text-amber-800 mb-4 flex items-center'>
          <HiOutlineLightBulb className='h-6 w-6 mr-3' />
          Get Prepared for a Productive Sprint!
        </h2>
        <p className='text-amber-900/90 text-sm/relaxed md:text-base/relaxed mb-6'>
          To ensure everyone has a smooth and productive experience, please read
          the following preparation steps carefully. A little setup beforehand
          makes a huge difference!
        </p>

        <div className='space-y-6'>
          <div>
            <h3 className='font-bold text-gray-800 flex items-center mb-2'>
              <FaLaptopCode className='mr-2' />
              Laptop & System Requirements
            </h3>
            <p className='text-gray-700 text-sm md:text-base'>
              Please bring a laptop with a minimum of{' '}
              <strong>2 CPU cores & 8 GB RAM</strong>. Don&apos;t forget your
              charger!
            </p>
          </div>
          <div>
            <h3 className='font-bold text-gray-800 flex items-center mb-2'>
              <FaDiscord className='mr-2 text-indigo-600' />
              Join the Discord Channels
            </h3>
            <p className='text-gray-700 text-sm md:text-base mb-2'>
              Our dedicated Discord channels are your primary resource for
              pre-event communication. By joining, you can get a head start,
              interact with sprint leaders, and meet fellow participants.
            </p>
            <div className='mb-4'>
              <h4 className='font-semibold text-gray-700 text-sm mb-2'>
                Sprint Project Channels:
              </h4>
              <ul className='space-y-1.5 pl-2'>
                {sprintProjects.map(project => (
                  <li
                    key={project.title}
                    className='flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm mb-4 sm:mb-2'
                  >
                    <span className='text-gray-800'>{project.title}</span>
                    <a
                      href={project.discordChannel}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-medium text-blue-600 hover:underline'
                    >
                      #{project.discordChannelDisplay}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className='font-bold text-gray-800 flex items-center mb-2'>
              <HiOutlineExclamationCircle className='mr-2 text-red-600' />
              Mandatory: The Installation Test
            </h3>
            <p className='text-gray-700 text-sm md:text-base'>
              Our sprint leaders have prepared an installation test or setup
              guide for their projects. Completing this before you arrive is
              crucial to verify your environment has all necessary dependencies.
            </p>
            <p className='text-gray-700 text-sm md:text-base mt-2'>
              <strong>Please be aware:</strong> To ensure the productivity of
              the group, sprint leaders may not be able to accommodate
              participants whose systems do not pass the installation test. A
              successful setup guarantees you can participate fully.
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-4 md:p-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mt-4 border-gray-700'>
          <div className='flex items-center mt-6 md:mb-0'>
            <div className='bg-purple-100 p-2 rounded-full mr-4'>
              <HiOutlineCalendar className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <h3 className='text-sm text-gray-500 uppercase'>Date</h3>
              <p className='font-semibold text-gray-700'>
                12th October (Sun), 2025
              </p>
            </div>
          </div>

          <div className='flex items-center mt-6'>
            <div className='bg-blue-100 p-2 rounded-full mr-4'>
              <LiaMapMarkedAltSolid className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <h3 className='text-sm text-gray-500 uppercase'>Venue</h3>
              <p className='font-semibold text-gray-700'>
                4/F Yeung Kin Man Academic Building, CityU
              </p>
            </div>
          </div>
        </div>

        <div className='mt-4 md:mt-6'>
          <h2 className='text-xl font-bold text-gray-700 mb-4 flex items-center'>
            <FaRegClock className='h-5 w-5 mr-2 text-yellow-500' />
            Schedule
          </h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='py-2 px-4 border-b text-left'>Time</th>
                  <th className='py-2 px-4 border-b text-left'>Item</th>
                </tr>
              </thead>
              <tbody>
                {sprintSchedule.map((schedule, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className='py-2 px-4 border-b'>
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className='py-2 px-4 border-b'>{schedule.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-700 mb-4 flex items-center'>
            <BsCodeSlash className='h-5 w-5 mr-2 text-blue-500' />
            Sprint Projects
          </h2>

          {sprintProjects.map((project, index) => (
            <div
              key={`sprint-${index}`}
              className='bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <h3 className='text-lg font-bold text-purple-600'>
                {project.title}
              </h3>

              <div className='flex items-start mt-4'>
                <MdOutlineDescription className='h-5 w-5 mr-4 text-gray-500 mt-1 flex-shrink-0' />
                <div className='text-gray-700 text-sm/relaxed md:text-base lg:text-lg'>
                  {project.descriptionNode}
                </div>
              </div>

              <div className='flex items-start mt-4'>
                <FaGithub className='h-5 w-5 mr-4 text-gray-600 flex-shrink-0 mt-2' />
                <a
                  href={project.githubLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline break-words overflow-hidden'
                >
                  <span className='text-sm md:text-base'>
                    {project.githubLinkDisplay}
                  </span>
                </a>
              </div>

              <div className='flex items-start mt-4'>
                <FaDiscord className='h-5 w-5 mr-4 flex-shrink-0 mt-1' />
                <div className='text-gray-700 text-sm md:text-base'>
                  <span className='font-medium'>Discord channel: </span>
                  <a
                    href={project.discordChannel}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline break-words'
                  >
                    <span className='font-medium'>
                      #{project.discordChannelDisplay}
                    </span>
                  </a>
                </div>
              </div>

              <div className='flex items-start mt-4'>
                <BsBullseye className='h-5 w-5 mr-4 text-gray-500 mt-1 flex-shrink-0' />
                <div className='text-sm/relaxed md:text-base lg:text-lg'>
                  <p className='font-medium text-gray-700'>Goals:</p>
                  <ul className='list-disc pl-5 text-gray-600 mt-1'>
                    {project.goals.map((goal, idx) => (
                      <li key={idx}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='flex flex-col-reverse md:flex-row md:justify-between mt-6 gap-2 md:gap-0'>
                <div
                  className={`py-1 px-3 rounded-full text-sm font-medium w-fit ${project.level === 'ALL Levels' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {project.level}
                </div>
                <div className='flex items-center'>
                  <FaUser className='h-4 w-4 mr-4 text-gray-500' />
                  <span className='text-gray-600 text-sm'>
                    Sprint lead: {project.sprintLead}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex flex-col md:flex-row gap-4 justify-center mt-4 md:mt-8'>
          <a
            href={process.env.NEXT_PUBLIC_CALL_FOR_SPRINT_URL}
            className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-md text-center transition-colors duration-300 flex items-center justify-center'
            target='_blank'
          >
            <HiOutlineCursorClick className='h-5 w-5 mr-2' />
            Submit your Sprint Projects
          </a>

          <Link
            href='/sprint/qna/en'
            className='bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-md text-center transition-colors duration-300 flex items-center justify-center'
          >
            <AiOutlineQuestionCircle className='h-5 w-5 mr-2 text-blue-500' />
            Sprint Q&A
          </Link>
        </div>
      </div>
    </div>
  );
}
