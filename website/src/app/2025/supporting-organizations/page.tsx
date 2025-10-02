import agileHKImg from '../../../../public/2025/supporting-organizations/agile_hk.webp';
import awsUGHKImg from '../../../../public/2025/supporting-organizations/aws_ug_hk.webp';
import codeaholicsImg from '../../../../public/2025/supporting-organizations/codeaholics.webp';
import eduHKMathItImg from '../../../../public/2025/supporting-organizations/eduhk_math_it_dept.webp';
import gdgCloudHKImg from '../../../../public/2025/supporting-organizations/gdg_cloud_hk.webp';
import gdgHKImg from '../../../../public/2025/supporting-organizations/gdg_hk.webp';
import hkaceImg from '../../../../public/2025/supporting-organizations/hkace.webp';
import internetSocietyImg from '../../../../public/2025/supporting-organizations/internet_society.webp';
import japanRPIImg from '../../../../public/2025/supporting-organizations/japan_rpi_ug.webp';
import pyladiesHKImg from '../../../../public/2025/supporting-organizations/pyladies_hk.webp';
import pyladiesTokyoImg from '../../../../public/2025/supporting-organizations/pyladies_tokyo.webp';
import pythonAsiaImg from '../../../../public/2025/supporting-organizations/python_asia.webp';
import vtcImg from '../../../../public/2025/supporting-organizations/vtc.webp';
import OrganizationLogo, {
  OrganizationLogoProps,
} from '../components/utils/OrganizationLogo';

const supportingOrganizations: OrganizationLogoProps[] = [
  {
    name: 'Agile Hong Kong',
    logo: agileHKImg,
    modalNode: (
      <div>
        <p>
          Established in 2014, Agile HK is a group which welcomes everyone to
          learn and share knowledge and experience about anything Agile, discuss
          the latest development in Agile-related topics, from teamwork, metrics
          and coaching. Learn more about previous events at their website!
        </p>
      </div>
    ),
    logoAlt: 'Agile Hong Kong Logo',
    href: 'https://www.meetup.com/agile-hong-kong/',
  },
  {
    name: 'AWS User Group Hong Kong',
    logo: awsUGHKImg,
    modalNode: (
      <div>
        <p>
          Since 2015, AWS User Group Hong Kong has been a volunteer-driven
          community for anyone interested in Amazon Web Services. The group
          welcomes cloud beginners, seasoned professionals, and everyone in
          between, and is dedicated to:
        </p>
        <ol className='list-decimal mt-4 ml-6 space-y-2'>
          <li className='md:pl-2'>
            building a strong AWS community in Hong Kong;
          </li>
          <li className='md:pl-2'>
            sharing the latest AWS news, trends, and best practices;
          </li>
          <li className='md:pl-2'>
            supporting members in their cloud journey; and
          </li>
          <li className='md:pl-2'>encouraging collaboration and innovation.</li>
        </ol>
        <p className='mt-4'>
          The group regularly hosts talks, workshops, and networking sessions.
          Visit their Meetup page for the latest{' '}
          <span className='text-blue-500 hover:underline'>
            <a
              href='https://www.meetup.com/hong-kong-amazon-aws-user-group/'
              target='_blank'
              rel='noopener noreferrer'
            >
              schedule
            </a>
          </span>
          .
        </p>
      </div>
    ),
    logoAlt: 'AWS User Group Hong Kong Logo',
    href: 'https://awsug.hk/',
  },
  {
    name: 'Codeaholics',
    modalNode: (
      <div>
        <p>
          We believe Hong Kong developers community is skilled and diverse but
          often these skills end up hidden away in big organisations or going
          abroad.
        </p>
        <br />
        <p>
          We aim to provide a forum for local developers to share these skills
          and inspire their local peers.
        </p>
        <br />
        <p>
          With a mix of local and international speakers, we offer talks and
          workshops which are targeted and relevant. We believe that meetups
          don&apos;t need to be big and expensive to be valuable.
        </p>
      </div>
    ),
    logo: codeaholicsImg,
    logoAlt: 'Codeaholics Logo',
    href: 'https://www.facebook.com/codeaholics/',
  },
  {
    name: 'Department of Mathematics and<br/>Information Techonology, The EdUHK',
    logo: eduHKMathItImg,
    modalNode: (
      <div>
        <p>
          With the vision to nurture future generations to become quality
          educators and researchers in mathematics and information technology
          with passion and talent, the Department of Mathematics and Information
          Technology, EdUHK seeks to:
        </p>
        <ol className='list-decimal mt-4 ml-6 space-y-2'>
          <li className='md:pl-2'>
            Strive for excellence in education, research, and knowledge
            transfer;
          </li>
          <li className='md:pl-2'>
            Cultivate students&apos; mastery of reasoning and analytic
            processes, problem-solving, critical thinking, and computational
            thinking, and ultimately enable them to become life-long learners;
          </li>
          <li className='md:pl-2'>
            Contribute new knowledge of high impact and recognition in the areas
            of mathematics, information technology, and their pedagogy; and
          </li>
          <li className='md:pl-2'>
            Undertake outreach and community engagement that increases
            mathematical and information technology literacy locally,
            regionally, and internationally.
          </li>
        </ol>
      </div>
    ),
    logoAlt: 'EdUHK Math & IT Dept Logo',
    href: 'https://www.eduhk.hk/mit/en/',
  },
  {
    name: 'Google Developer Group Cloud Hong Kong',
    logo: gdgCloudHKImg,
    modalNode: (
      <div>
        <p>
          GDG Cloud Hong Kong is the Hong Kong chapter of the global Google
          Developer Groups focusing on the awesome capability of Google Cloud.
          This group is a community group for all technologists with an interest
          in Google Cloud Platform (GCP) and its awesome capabilities. We'll be
          exploring areas including (but not limited to)
        </p>
        <ul className='list-disc mt-4 ml-6 space-y-2'>
          <li className='md:pl-2'>Machine Learning</li>
          <li className='md:pl-2'>BiqQuery</li>
          <li className='md:pl-2'>Serverless Computing</li>
          <li className='md:pl-2'>App Engine, and</li>
          <li className='md:pl-2'>Containers</li>
        </ul>
      </div>
    ),
    logoAlt: 'GDG Cloud Hong Kong Logo',
    href: 'https://gdg.community.dev/gdg-cloud-hong-kong/',
  },
  {
    name: 'Google Developer Group Hong Kong',
    logo: gdgHKImg,
    modalNode: (
      <div>
        <p>
          Established in December 2009, Google Developer Group Hong Kong (GDG
          HK) is an active, Hong Kong-based non-profit community within the
          global Google Developer Groups network. Dedicated to fostering a
          community of 2,000+ developers and tech enthusiasts, GDG HK provides
          an open platform for learning and sharing knowledge about Google
          technologies, including AI, web, and mobile development.
        </p>
        <p>
          We organize periodic off-line events, from study groups and tech talks
          to the annual DevFest, and have successfully hosted over 40 events,
          workshops, and meetups—such as DevFest, Build with AI, and I/O
          Extended—contributing significantly to the local tech ecosystem.
        </p>
      </div>
    ),
    logoAlt: 'GDG Hong Kong Logo',
    href: 'https://gdg.community.dev/gdg-hong-kong/',
  },
  {
    name: 'HKACE<br/>The Hong Kong Association for Computer Education',
    modalNode: (
      <div>
        <p>
          香港電腦教育學會始創於1981年底，當時香港教育署正計劃在中學進行電腦科試驗計劃，一群熱心的老師因而組織起來，並創立香港電腦教育學會，讓學界同工能互相支持及共同推動香港的電腦教育發展。
        </p>
        <br />
        <p>
          本會顧問及理事由一群教授，退休及現任校長及老師擔任。本會除了積極推動電腦科的教學外，亦經常關注電子教學在各學科上的應用以及STEM教學的發展。本會理事亦一直熱心參與不少香港電腦科及資訊科技教育政策的制訂及推動的工作。目前本會的數百位個人會員中，除了電腦科老師外，也有中小學各學科的校長、老師、資訊科技統籌員、教育局有關組別的人員等；同時，本會亦設有學校會員制度，現已有數百所中小學成為本會的學校會員。
        </p>
        <br />
        <p>
          本會在資訊科技界的專業地位於1997年得到政府及業界的肯定：立法會功能組別選舉中，本會是選舉法認可的科技創新界專業團體之一。除此以外，本會於2000年獲稅務局批准，成為認可慈善團體。
        </p>
        <br />
        <h2 className='font-bold'>面向老師的活動</h2>
        <p className='mt-1'>
          本會經常為校長及老師舉辦各式各樣的活動，較大型者如「Google for
          Education Teachers Network(GETN)」、「Technology Expert: Apple
          Communication Hubs
          (T.E.A.C.H.)」、組織香港中小學老師團出席「全球華人計算機教育應用大會」（GCCCE）。本會亦定期與不同公司及團體舉辦教師講座、工作坊及興趣小組。
        </p>
        <br />
        <h2 className='font-bold'>面向學生的活動</h2>
        <p className='mt-1'>
          本會每年均定期舉辦多項面向學生的大型活動，包括小學生「資訊科技挑戰獎勵計劃」、中學生「青年資訊科技大使獎勵計劃」、「學習如此多紛」專題創作比賽、香港電腦奧林匹克競賽、高中「資訊及通訊科技科」模擬試、中學「Girls
          STEM計劃」、中學生資訊科技體驗團等等。
        </p>
      </div>
    ),
    logo: hkaceImg,
    logoAlt: 'HKACE Logo',
    href: 'https://www.hkace.org.hk/',
  },
  {
    name: 'Internet Society Hong Kong',
    logo: internetSocietyImg,
    modalNode: (
      <div>
        <p>
          We aim for an open, neutral, reliable and accessible Internet, through
          foster participation and contribution on open development of
          standards, protocols, governance, infrastructure of the Internet.
        </p>
      </div>
    ),
    logoAlt: 'Internet Society Hong Kong Logo',
    href: 'https://www.isoc.hk/',
  },
  {
    name: 'Japanese Raspberry Pi Users Group<br/>(Raspberry JAM Tokyo)',
    logo: japanRPIImg,
    logoAlt: 'Japanese Raspberry Pi Users Group Logo',
    href: 'https://www.raspi.jp/',
  },
  {
    name: 'PyLadies Hong Kong',
    logo: pyladiesHKImg,
    logoAlt: 'PyLadies Hong Kong Logo',
    href: 'https://linktr.ee/pyladieshk',
  },
  {
    name: 'PyLadies Tokyo',
    logo: pyladiesTokyoImg,
    modalNode: (
      <div>
        <p>
          PyLadies Tokyo is the Tokyo branch of PyLadies, working to connect
          female Pythonists. While their main activity is monthly meetups, they
          also participate in various other activities, such as participating in
          the PyCon JP conference and hosting workshops in collaboration with
          Django Girls Tokyo.
        </p>
      </div>
    ),
    logoAlt: 'PyLadies Tokyo Logo',
    href: 'https://tokyo.pyladies.com/',
  },
  {
    name: 'Python Asia Organization',
    logo: pythonAsiaImg,
    modalNode: (
      <div>
        <p>
          PAO is a non-profit based in Estonia that organizes the annual
          regional conference and supports Python events across Asia. It also
          fosters community and leadership development while holding the rights
          to the annual regional conference series and related trademarks. Their
          mission is to promote, protect, and advance the Python programming
          language while fostering the growth of a diverse and thriving
          community of Python programmers in East and Southeast Asia region.
        </p>
        <br />
        <p>
          By organizing events, supporting community initiatives, and
          collaborating globally, we aim to create a sustainable and inclusive
          ecosystem for Python enthusiasts and professionals alike.
        </p>
      </div>
    ),
    logoAlt: 'Python Asia Organization Logo',
    href: 'https://pythonasia.org/',
  },
  {
    name: 'VTC<br/>Innovation and Technology Co-creation Centre',
    logo: vtcImg,
    modalNode: (
      <div>
        <p>
          VTC Innovation and Technology Co-creation Centre provides a platform
          for students to nurture young talents and foster an innovation and
          entrepreneurial culture, by bringing in cutting-edge technologies and
          establishing strong partnerships and collaborations with industries,
          to build a successful innovation ecosystem and create social impacts..
        </p>
      </div>
    ),
    logoAlt: 'VTC Logo',
    href: 'https://vco-create.vtc.edu.hk/en/',
  },
];

export default async function SupportingOrganizations() {
  return (
    <>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-center'>
        Supporting Organizations
      </h1>
      <p className='mt-8'>
        Heartfelt thanks to the exceptional organization backing PyCon HK 2025.
        Your steadfast dedication and contributions propel our mission forward,
        inspiring the Python community and empowering us to achieve new
        milestones together.
      </p>
      {supportingOrganizations.map(supportingOrganization => (
        <div
          key={supportingOrganization.name}
          className='flex flex-col items-center mt-16'
        >
          <OrganizationLogo
            key={supportingOrganization.name}
            name={supportingOrganization.name}
            nameClassName='text-base sm:text-xl font-semibold mt-4'
            description={supportingOrganization.description}
            descriptionClassName='text-sm sm:text-base text-gray-600 mt-2'
            modalNode={supportingOrganization.modalNode}
            logo={supportingOrganization.logo}
            logoAlt={supportingOrganization.logoAlt}
            logoClassName='w-56 sm:w-80'
            href={supportingOrganization.href}
          />
        </div>
      ))}
    </>
  );
}
