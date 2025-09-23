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
