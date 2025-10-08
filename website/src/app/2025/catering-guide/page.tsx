import Link from 'next/link';
import {
  FaUtensils,
  FaGlassCheers,
  FaStore,
  FaCreditCard,
  FaMapMarkedAlt,
  FaDollarSign,
} from 'react-icons/fa';
import { SiAlipay, SiWechat } from 'react-icons/si';
import { FaApple } from 'react-icons/fa6';
import { HiOutlineInformationCircle } from 'react-icons/hi';

interface PaymentMethodProps {
  icon?: React.ReactNode;
  name: string;
}

function PaymentMethod({ icon, name }: PaymentMethodProps) {
  return (
    <div className='flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-700'>
      {icon}
      <span>{name}</span>
    </div>
  );
}

export default async function CateringGuidePage() {
  return (
    <div className='max-w-4xl mx-auto md:px-4 py-8'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl text-gray-700 text-center mb-12'>
        Catering Guide
      </h1>

      <div className='space-y-12'>
        {/* --- Lunch Section --- */}
        <section className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6 md:p-8'>
            <h2 className='text-xl md:text-2xl font-bold text-blue-700 flex items-center mb-4'>
              <FaUtensils className='mr-4' />
              Lunch (Day 1 & Day 2)
            </h2>
            <p className='text-gray-600 text-sm md:text-base lg:text-lg mb-6'>
              Fuel up for a day of learning and networking! The closest canteen
              is just one floor above our venue.
            </p>

            <div className='bg-gray-50 rounded-lg p-4 space-y-2 text-sm md:text-base'>
              <p>
                <strong>Location:</strong> City Express at Yeung Kin Man
                Academic Building, 5/F
              </p>
              <p>
                <strong>Opening Hours:</strong> 07:00 - 21:00
              </p>
            </div>

            <div className='mt-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg text-sm md:text-base'>
              <h3 className='font-bold flex items-center mb-2'>
                <HiOutlineInformationCircle className='mr-2 h-5 w-5' />
                Important Payment Note
              </h3>
              <p>
                The vending machines are for students only. Please use the{' '}
                <strong>right-hand-side counter</strong> for over-the-counter
                payments.
              </p>
            </div>

            <div className='mt-6'>
              <h3 className='font-semibold text-gray-700 mb-3 text-sm md:text-base'>
                Accepted Payment Methods:
              </h3>
              <div className='flex flex-wrap gap-2'>
                <PaymentMethod icon={<FaCreditCard />} name='Credit Card' />
                <PaymentMethod name='Octopus' />
                <PaymentMethod icon={<SiAlipay />} name='AlipayHK' />
                <PaymentMethod icon={<FaApple />} name='Apple Pay' />
                <PaymentMethod icon={<SiWechat />} name='WeChat Pay HK' />
                <PaymentMethod icon={<FaDollarSign />} name='Cash' />
              </div>
            </div>

            <div className='mt-6 text-center'>
              <Link
                href='https://www.cityu.edu.hk/en/directories/catering'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-blue-600 hover:underline'
              >
                View all catering outlets at CityU →
              </Link>
            </div>
          </div>
        </section>

        {/* --- PyNight Section --- */}
        <section className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6 md:p-8'>
            <h2 className='text-xl md:text-2xl font-bold text-purple-700 flex items-center mb-4'>
              <FaGlassCheers className='mr-4' />
              PyNight (Day 1 Evening)
            </h2>
            <p className='text-gray-600 text-sm md:text-base lg:text-lg mb-6'>
              Let the conversations flow! Join our evening networking party on
              Conference Day (11th Oct) from <strong>6:30 pm</strong> onwards.
              Mingle with the community over light snacks and drinks.
            </p>

            <div className='mt-6 border-l-4 border-purple-500 pl-4'>
              <h3 className='font-bold text-gray-800 text-base md:text-lg mb-2'>
                How to Join the Party
              </h3>
              <p className='text-sm md:text-base mb-4'>
                Entry is free but limited to the first 100 people. A wristband
                is required for entry.
              </p>
              <div className='text-sm space-y-2'>
                <p>
                  <strong>Speakers & Paid Ticket Holders:</strong> Grab your
                  wristband at reception from{' '}
                  <span className='font-semibold'>2:00 pm - 3:30 pm</span>.
                </p>
                <p>
                  <strong>All Attendees:</strong> Remaining wristbands are
                  available from{' '}
                  <span className='font-semibold'>3:30 pm - 6:00 pm</span>, or
                  until they&apos;re all gone!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Day 2 Dinner Section --- */}
        <section className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6 md:p-8'>
            <h2 className='text-xl md:text-2xl font-bold text-amber-700 flex items-center mb-4'>
              <FaStore className='mr-4' />
              Informal Dinner (Day 2 Evening)
            </h2>
            <p className='text-gray-600 text-sm md:text-base lg:text-lg mb-6'>
              After a productive Sprint Day (12th Oct), keep the conversation
              going at a voluntary social dinner. This is a fantastic chance to
              relax with fellow developers over authentic local cuisine.
            </p>

            <div className='bg-gray-50 rounded-lg p-4 text-sm md:text-base text-center'>
              <p className='font-semibold text-gray-800'>
                We will be heading to:
              </p>
              <p className='text-lg font-bold text-amber-800 my-1'>
                Ban Heung Lau (品香樓)
              </p>
              <p className='text-gray-600'>
                A popular local Cantonese restaurant near CityU.
              </p>
            </div>

            <div className='flex justify-center mt-6 text-sm md:text-base'>
              <Link
                href='https://maps.app.goo.gl/5Q4BdKbFn7GgaAY49'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md shadow-md transition-colors duration-300'
              >
                <FaMapMarkedAlt className='h-5 w-5' />
                View on Google Maps
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
