import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkedAlt, FaSubway, FaTaxi } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import {
  HiOutlineCalendar,
  HiOutlineInformationCircle,
  HiOutlineLocationMarker,
  HiOutlineWifi,
} from 'react-icons/hi';
import accessGuideMtrImg from '../../../../public/2025/access-guides/access-guide-mtr.jpg';
import cityUWifiImg from '../../../../public/2025/access-guides/cityu-wifi.jpg';
import map1Img from '../../../../public/2025/access-guides/map-1.jpg';
import map2Img from '../../../../public/2025/access-guides/map-2.jpg';
import map3Img from '../../../../public/2025/access-guides/map-3.png';
import map4Img from '../../../../public/2025/access-guides/map-4.jpg';

export default async function AccessGuideConferenceSprintDay() {
  return (
    <div className='max-w-4xl mx-auto md:px-4'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl text-gray-700 text-center'>
        Access Guide - Conference & Sprint Day
      </h1>

      {/* Event Information */}
      <div className='flex flex-col sm:flex-row items-center justify-center mt-8 gap-3 flex-wrap text-center'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full shadow-sm'>
          <div className='bg-purple-100 p-1.5 rounded-full'>
            <HiOutlineCalendar className='h-4 w-4 text-purple-600' />
          </div>
          <span className='font-medium text-gray-700 text-sm md:text-base lg:text-lg'>
            11th - 12th October (Sat), 2025
          </span>
        </div>

        <div className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full shadow-sm text-center'>
          <div className='bg-blue-100 p-1.5 rounded-full'>
            <HiOutlineLocationMarker className='h-4 w-4 text-blue-600' />
          </div>
          <span className='font-medium text-gray-700 text-sm md:text-base lg:text-lg'>
            Yeung Kin Man Academic Building, CityU
          </span>
        </div>
      </div>

      {/* Map Link */}
      <div className='flex justify-center mt-8 text-sm md:text-base lg:text-lg'>
        <Link
          href='https://maps.app.goo.gl/Gb42LuDSMv4YcZXd6'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors duration-300'
        >
          <FaMapMarkedAlt className='h-5 w-5' />
          Open in Google Maps
        </Link>
      </div>

      {/* Introduction */}
      <div className='bg-white rounded-lg shadow-md px-6 pt-8 pb-2 sm:px-10 sm:pt-10 sm:pb-4 lg:px-12 lg:pt-16 lg:pb-8 mt-8'>
        <p className='text-gray-700 text-sm md:text-base lg:text-lg'>
          This document will guide you to the various key locations of the
          conference.
        </p>

        <div className='flex justify-center mt-6 py-2 md:px-6 md:py-6 lg:px-24'>
          <div className='w-full overflow-hidden rounded-lg shadow-md'>
            <Image
              src={map1Img}
              alt='Conference & Sprint Day Building Map'
              className='w-full h-auto'
            />
          </div>
        </div>
      </div>

      {/* Useful Information Section */}
      <h2 className='text-xl md:text-2xl font-bold text-gray-700 mt-12 flex items-center'>
        <HiOutlineInformationCircle className='inline-block mr-4 text-blue-600' />
        Useful Information
      </h2>

      {/* Getting to CityU */}
      <div className='bg-white rounded-lg shadow-md px-6 py-12 md:px-10 lg:px-12 lg:py-16 mt-6'>
        <h3 className='text-xl font-semibold text-blue-700 mb-4 grid grid-cols-5 gap-4 md:flex items-center'>
          <FaMapMarkedAlt className='w-full col-span-1 md:w-6 lg:w-8 md:mr-2 lg:mr-4' />
          <span className='text-base sm:text-lg lg:text-xl col-span-4'>
            1. Getting to City University of Hong Kong (CityU)
          </span>
        </h3>

        <p className='text-gray-700 mt-4 text-sm md:text-base lg:text-lg'>
          The best way to go to Yeung Kin Man Academic Building, City University
          of Hong Kong (CityU) is to take the Tat Chee Avenue entrance.
        </p>

        {/* By MTR */}
        <div className='mt-6'>
          <h4 className='text-base md:text-lg font-semibold text-gray-800 mb-2 flex items-center'>
            <FaSubway className='mr-4 text-purple-600' /> By MTR
          </h4>

          <div className='bg-gray-50 rounded-md p-6 text-sm/6 md:text-base/7 xl:text-lg/8'>
            <p className='text-gray-700 mb-4'>
              CityU is located adjacent to MTR Kowloon Tong Station and Festival
              Walk Shopping Centre. It is just a 5-minute walk from MTR station
              via Festival Walk to the Campus. When you arrive at MTR Kowloon
              Tong Station, please follow the instructions below to reach CityU:
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
              <div>
                <Image
                  src={map2Img}
                  alt='MTR Exit Guide'
                  className='rounded-md shadow-sm w-full h-auto'
                />
              </div>
              <div>
                <Image
                  src={accessGuideMtrImg}
                  alt='MTR Access Guide'
                  className='rounded-md shadow-sm w-full h-auto'
                />
              </div>
            </div>
          </div>
        </div>

        {/* By Taxi */}
        <div className='mt-6'>
          <h4 className='text-base md:text-lg font-semibold text-gray-800 flex items-center'>
            <FaTaxi className='mr-4 text-amber-500' /> By Taxi
          </h4>

          <div className='bg-gray-50 rounded-md p-6 text-sm/6 md:text-base/7 xl:text-lg/8'>
            <p className='text-gray-700 mb-4'>
              Please ask the taxi driver to drop you off at Tat Chee Avenue
              entrance next to a pair of Kirin statues or show the following
              CityU taxi card to taxi driver. Walk down the steps on the left
              side of Kirin statues and you will reach the CityU campus guard
              house.
            </p>

            <div className='flex justify-center'>
              <Image
                src={map4Img}
                alt='Taxi Card'
                className='rounded-md shadow-sm max-w-sm w-full h-auto'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Locations */}
      <div className='bg-white rounded-lg shadow-md px-8 py-12 md:px-10 lg:px-12 lg:py-16 mt-12'>
        <h3 className='text-xl font-semibold text-blue-700 mb-4 grid grid-cols-5 gap-4 md:flex items-center'>
          <FaLocationDot className='w-full col-span-1 md:w-6 lg:w-8 md:mr-2 lg:mr-4' />
          <span className='text-base sm:text-lg lg:text-xl col-span-4'>
            2. Getting to Key Locations in Yeung Kin Man Academic Building
          </span>
        </h3>

        <div className='flex justify-center'>
          <Image
            src={map3Img}
            alt='Building Map'
            className='rounded-md shadow-sm w-full h-auto max-w-2xl'
          />
        </div>
      </div>

      {/* WiFi */}
      <div className='bg-white rounded-lg shadow-md px-8 py-12 md:px-10 lg:px-12 lg:py-16 mt-12'>
        <h3 className='text-xl font-semibold text-blue-700 mb-4 grid grid-cols-5 gap-4 md:flex items-center'>
          <HiOutlineWifi className='w-full col-span-1 md:w-6 lg:w-8 md:mr-2 lg:mr-4' />
          <span className='text-base sm:text-lg lg:text-xl col-span-4'>
            3. Wi-Fi Access
          </span>
        </h3>

        <div className='md:flex text-sm/6 md:text-base/7 xl:text-lg/8'>
          <div className='md:w-2/3 mb-4 md:mb-0 md:pr-6'>
            <p className='text-gray-700 mb-4'>
              CityU has joined the initiative of the Government of Hong Kong
              Special Administration Region to provide free Wi-Fi service to
              visitors on campus since 2014. No prior registration is required,
              however, the &quot;Acceptable Use Policy&quot; must be observed
              and accepted before a connection can be established.
            </p>

            <ol className='list-decimal list-inside space-y-4 text-gray-700'>
              <li>
                Connect the Wi-Fi network with SSID &quot;Wi-Fi.HK via
                CityU&quot;.
              </li>
              <li>
                Open your web browser, and you will be directed to the Wi-Fi.HK
                via CityU page.
              </li>
              <li>
                Please read the &quot;Acceptable Use Policy&quot; carefully
                before using Wi-Fi.HK via CityU service.
              </li>
              <li>
                If you agree to all the Conditions, click the &quot;ACCEPT &
                CONNECT&quot; button to start using the WiFi Service.
              </li>
            </ol>
          </div>

          <div className='md:w-1/3 flex justify-center'>
            <Image
              src={cityUWifiImg}
              alt='WiFi Instructions'
              className='rounded-md shadow-sm max-w-xs w-full h-auto'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
