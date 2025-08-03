import codeaholicsLogoImg from '../../../../public/2025/supporting-organizations/codeaholics.jpg';
import gdgCloudHKLogoImg from '../../../../public/2025/supporting-organizations/gdg-cloud-hk.png';
import hkaceLogoImg from '../../../../public/2025/supporting-organizations/hkace.png';
import hkucsaLogoImg from '../../../../public/2025/supporting-organizations/hkucsa.png';
import polyuRoboticsClubLogoImg from '../../../../public/2025/supporting-organizations/polyu-robotics-club.png';
import wtmhkLogoImg from '../../../../public/2025/supporting-organizations/wtmhk.png';
import OrganizationLogo, {
  OrganizationLogoProps,
} from '../components/utils/OrganizationLogo';

const supportingOrganizations: OrganizationLogoProps[] = [
  {
    name: 'Codeaholics',
    logo: codeaholicsLogoImg,
    logoAlt: 'Codeaholics Logo',
    href: 'https://www.meetup.com/Codeaholics/',
  },
  {
    name: 'Computer Science Association, Engineering Society, HKU<br/>香港大學工程學會計算機科學學會',
    logo: hkucsaLogoImg,
    logoAlt: 'HKU Computer Science Association Logo',
    href: 'https://i.cs.hku.hk/~csa/',
  },
  {
    name: 'Google Developer Group Cloud Hong Kong',
    logo: gdgCloudHKLogoImg,
    logoAlt: 'GDG Cloud HK Logo',
    href: 'https://gdg.community.dev/gdg-cloud-hong-kong/',
  },
  {
    name: 'HKACE - The Hong Kong Association for Computer Education<br/>香港電腦教育學會',
    logo: hkaceLogoImg,
    logoAlt: 'HKACE Logo',
    href: 'https://www.hkace.org.hk/',
  },
  {
    name: 'PolyU Robotics Club',
    logo: polyuRoboticsClubLogoImg,
    logoAlt: 'PolyU Robotics Club Logo',
    href: 'https://www.instagram.com/polyurobotics',
  },
  {
    name: 'Women Techmakers Hong Kong',
    logo: wtmhkLogoImg,
    logoAlt: 'Women Techmakers Hong Kong Logo',
    href: 'https://www.facebook.com/WTMHongKong/',
  },
];

export default async function SupportingOrganizations() {
  const isTestEnv = process.env.NEXT_PUBLIC_IS_TEST_ENV == 'true';
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
      {isTestEnv &&
        supportingOrganizations.map(supportingOrganization => (
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
              logoClassName='w-40 sm:w-64 bg-white'
              href={supportingOrganization.href}
            />
          </div>
        ))}
    </>
  );
}
