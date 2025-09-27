import agileHKImg from '../../../../public/2025/supporting-organizations/agile_hk.webp';
import awsUGHKImg from '../../../../public/2025/supporting-organizations/aws_ug_hk.webp';
import codeaholicsImg from '../../../../public/2025/supporting-organizations/codeaholics.webp';
import eduHKMathItImg from '../../../../public/2025/supporting-organizations/eduhk_math_it_dept.webp';
import gdgCloudHKImg from '../../../../public/2025/supporting-organizations/gdg_cloud_hk.webp';
import gdgHKImg from '../../../../public/2025/supporting-organizations/gdg_hk.webp';
import hkaceImg from '../../../../public/2025/supporting-organizations/hkace.webp';
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
    logoAlt: 'Agile Hong Kong Logo',
    href: 'https://www.meetup.com/agile-hong-kong/',
  },
  {
    name: 'AWS User Group Hong Kong',
    logo: awsUGHKImg,
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
    logoAlt: 'EdUHK Math & IT Dept Logo',
    href: 'https://www.eduhk.hk/mit/en/',
  },
  {
    name: 'Google Developer Group Cloud Hong Kong',
    logo: gdgCloudHKImg,
    logoAlt: 'GDG Cloud Hong Kong Logo',
    href: 'https://gdg.community.dev/gdg-cloud-hong-kong/',
  },
  {
    name: 'Google Developer Group Hong Kong',
    logo: gdgHKImg,
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
    logoAlt: 'PyLadies Tokyo Logo',
    href: 'https://tokyo.pyladies.com/',
  },
  {
    name: 'Python Asia Organization',
    logo: pythonAsiaImg,
    logoAlt: 'Python Asia Organization Logo',
    href: 'https://pythonasia.org/',
  },
  {
    name: 'VTC<br/>Innovation and Technology Co-creation Centre',
    logo: vtcImg,
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
