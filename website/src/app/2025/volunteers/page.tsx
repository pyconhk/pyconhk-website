import Image, { type StaticImageData } from 'next/image';
import { FaLinkedin } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import adrianTamImg from '../../../../public/2025/organizers-volunteers/volunteers/adrian-tam-compressed.webp';
import alexAuImg from '../../../../public/2025/organizers-volunteers/volunteers/alex-au-compressed.webp';
import calvinChongImg from '../../../../public/2025/organizers-volunteers/volunteers/calvin-chong-compressed.webp';
import calvinTsangImg from '../../../../public/2025/organizers-volunteers/volunteers/calvin-tsang-compressed.webp';
import daisyMarisFungImg from '../../../../public/2025/organizers-volunteers/volunteers/daisy-maris-fung-compressed.webp';
import ethanLeeImg from '../../../../public/2025/organizers-volunteers/volunteers/ethan-lee-compressed.webp';
import henryLawImg from '../../../../public/2025/organizers-volunteers/volunteers/henry-law-compressed.webp';
import kaKiTingImg from '../../../../public/2025/organizers-volunteers/volunteers/ka-ki-ting-compressed.webp';
import mayaYanImg from '../../../../public/2025/organizers-volunteers/volunteers/maya-yan-compressed.webp';
import ronaldYickImg from '../../../../public/2025/organizers-volunteers/volunteers/ronald-yick-compressed.webp';
import scottyKwokImg from '../../../../public/2025/organizers-volunteers/volunteers/scotty-kwok.jpg';
import skyNgImg from '../../../../public/2025/organizers-volunteers/volunteers/sky-ng-compressed.webp';
import tedYuenImg from '../../../../public/2025/organizers-volunteers/volunteers/ted-yuen-compressed.webp';
import tommyHanImg from '../../../../public/2025/organizers-volunteers/volunteers/tommy-han-compressed.webp';

interface Role {
  name: string;
  image?: StaticImageData;
  linkedin?: string;
  personalWebsite?: string;
}

const conferenceChair: Role = {
  name: 'Mr. Henry Law',
  image: henryLawImg,
};

const conferenceCoChairs: Role[] = [
  {
    name: 'Mr. Scotty Kwok',
    image: scottyKwokImg,
    linkedin: 'https://www.linkedin.com/in/scottykwok/',
  },
  {
    name: 'Mr. Tommy Han',
    image: tommyHanImg,
    linkedin: 'https://www.linkedin.com/in/tommy-han-236a85144/',
  },
  {
    name: 'Mr. Ka Ki Ting',
    image: kaKiTingImg,
    linkedin: 'https://www.linkedin.com/in/tinglogy/',
  },
  {
    name: 'Mr. Calvin Tsang',
    image: calvinTsangImg,
    linkedin: 'https://www.linkedin.com/in/calvin-tyl/',
  },
  {
    name: 'Mr. Alex Au',
    image: alexAuImg,
    linkedin: 'https://www.linkedin.com/in/alex-au-606901206/',
  },
];

const organizingCommitteeMembers: Role[] = [
  {
    name: 'Mr. Adrian Tam',
    image: adrianTamImg,
    linkedin: 'https://www.linkedin.com/in/adrian-tam-0666b08/',
  },
  {
    name: 'Mr. Calvin Chong',
    image: calvinChongImg,
    linkedin: 'https://www.linkedin.com/in/yeow-kuan-chong-338b3863/',
  },
  {
    name: 'Ms. Peggy Wong',
  },
  {
    name: 'Ms. Daisy Maris Fung',
    image: daisyMarisFungImg,
    personalWebsite: 'https://www.daisymarisfung.com/',
  },
  {
    name: 'Mr. Ethan Lee',
    image: ethanLeeImg,
    linkedin: 'https://www.linkedin.com/in/ethan-lee-4335251b1/',
  },
  {
    name: 'Miss Maya Yan',
    image: mayaYanImg,
    linkedin: 'https://www.linkedin.com/in/yantungmaya/',
  },
  {
    name: 'Miss Maya Yan',
    image: mayaYanImg,
    linkedin: 'https://www.linkedin.com/in/yantungmaya/',
  },
  {
    name: 'Mr. Ronald Yick',
    image: ronaldYickImg,
    linkedin: 'https://www.linkedin.com/in/ronald-yick/',
  },
  {
    name: 'Mr. Sky Ng',
    image: skyNgImg,
    linkedin: 'https://www.linkedin.com/in/sky-ng-ab307b252/',
  },
  {
    name: 'Mr. Ted Yuen',
    image: tedYuenImg,
    linkedin: 'https://www.linkedin.com/in/ted-yuen/',
  },
];

export default function VolunteersPage() {
  return (
    <>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl font-bold text-center text-gray-900'>
          Our Team
        </h1>
        <p className='text-center text-gray-600 max-w-3xl mx-auto mt-8'>
          Meet the dedicated volunteers who make PyCon HK 2025 possible. Our
          team works tirelessly to create an amazing conference experience for
          the Python community.
        </p>

        {/* Conference Chair */}
        <section className='mt-20'>
          <h2 className='text-3xl font-bold text-center text-gray-800'>
            Conference Chair
          </h2>
          <div className='flex justify-center mt-16'>
            <PersonCard role={conferenceChair} />
          </div>
        </section>

        {/* Conference Co-Chairs */}
        <section className='mt-20'>
          <h2 className='text-3xl font-bold text-center text-gray-800'>
            Conference Co-Chairs
          </h2>
          <div className='flex flex-wrap justify-center gap-8 gap-y-16 mx-auto mt-16'>
            {conferenceCoChairs.map((chair, index) => (
              <div
                key={`cochair-${index}`}
                className='sm:w-1/2 md:w-1/3 lg:w-1/4 flex justify-center'
              >
                <PersonCard key={`cochair-${index}`} role={chair} />
              </div>
            ))}
          </div>
        </section>

        {/* Organizing Committee */}
        <section className='mt-20'>
          <h2 className='text-3xl font-bold text-center text-gray-800'>
            Organizing Committee Members
          </h2>
          <div className='flex flex-wrap justify-center gap-8 gap-y-16 mx-auto mt-16'>
            {/* Remove duplicates before mapping */}
            {organizingCommitteeMembers
              .filter(
                (member, index, self) =>
                  index === self.findIndex(m => m.name === member.name)
              )
              .map((member, index) => (
                <div
                  key={`member-${index}`}
                  className='sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex justify-center'
                >
                  <PersonCard key={`member-${index}`} role={member} />
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}

function PersonCard({ role }: { role: Role }) {
  return (
    <div className='flex flex-col items-center w-[200px] min-h-[200px] relative'>
      <div className='w-full overflow-hidden'>
        {role.image ? (
          <Image
            src={role.image}
            alt={role.name}
            width={200}
            height={200}
            className='object-cover object-center'
          />
        ) : (
          <>
            <div className='absolute aspect-square inset-0 z-0 bg-gradient-to-br from-blue-200 to-purple-200'></div>
            <div className='relative z-10 grid aspect-square h-full place-items-center'>
              <div className='text-center text-white'>
                <p className='text-4xl text-gray-500'>
                  {role.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className='w-full py-2 text-center flex items-center gap-2 justify-center'>
        <h3 className='text-xl font-semibold text-gray-900'>{role.name}</h3>
        {(role.linkedin || role.personalWebsite) && (
          <div className='flex justify-center'>
            {role.linkedin && (
              <a
                href={role.linkedin}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800 transition-colors'
                aria-label={`LinkedIn profile of ${role.name}`}
              >
                <FaLinkedin size={24} />
              </a>
            )}

            {role.personalWebsite && (
              <a
                href={role.personalWebsite}
                target='_blank'
                rel='noopener noreferrer'
                className='text-purple-600 hover:text-purple-800 transition-colors'
                aria-label={`Personal website of ${role.name}`}
              >
                <HiGlobeAlt size={24} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
