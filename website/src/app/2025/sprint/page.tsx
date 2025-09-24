import Link from 'next/link';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsBullseye, BsCodeSlash } from 'react-icons/bs';
import { FaDiscord, FaGithub, FaRegClock, FaUser } from 'react-icons/fa6';
import { HiOutlineCalendar, HiOutlineCursorClick } from 'react-icons/hi';
import { LiaMapMarkedAltSolid } from 'react-icons/lia';
import { MdOutlineDescription } from 'react-icons/md';

interface SprintScheduleItem {
  startTime: string;
  endTime: string;
  item: string;
}

interface SprintProject {
  title: string;
  description: string;
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
];

const sprintProjects: SprintProject[] = [
  {
    title: 'frame-check',
    description:
      "A python checker that can check the validity of DataFrame objects through the code. It will keep track of the dataframes' schema and raise errors if the schema is not respected or if the user is trying to access a column that does not exists.",
    goals: [
      'Core parser (parsing DF creations, user-specified schema, variable assignment)',
      'Core checker (rules and validators)',
      'LSP / File watcher (if we have time)',
    ],
    githubLinkDisplay: 'github.com/lucianosrp/frame-check',
    githubLink: 'https://github.com/lucianosrp/frame-check',
    discordChannelDisplay: '2025-sprint-frame-check',
    discordChannel:
      'https://discord.com/channels/1246847132699332640/1420214135857086565',
    level: 'ALL Levels',
    sprintLead: 'Luciano Scarpulla',
  },
  {
    title: 'L.E.P.A.U.T.E. Framework',
    description:
      'L.E.P.A.U.T.E. The framework is a visual framework based on Lie group theory that accurately models geometric transformations in images and improves the performance of CNNs. Recommended Sprint: Strong market demand, with applications in robotics and healthcare.',
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
    discordChannel:
      'https://discord.com/channels/1246847132699332640/1420214691547840563',
    level: 'Intermediate',
    sprintLead: 'Carson',
  },
];

export default async function Sprint() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        Call for Sprint Projects
      </h1>

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
                <p className='text-gray-700 text-sm/relaxed md:text-base lg:text-lg'>
                  {project.description}
                </p>
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
