import Link from 'next/link';

export default async function Sponsors() {
  return (
    <div className='container mx-auto px-4 py-8 '>
      <h1 className='text-3xl font-bold mb-6'>Sponsorship Opportunities</h1>
      <p className='mb-4'>
        PyCon HK 2025 offers a unique opportunity for companies to showcase
        their products and services to a diverse audience of Python enthusiasts,
        developers, and tech professionals. Join us as a sponsor and gain
        visibility in the vibrant Python community.
      </p>

      <h2 className='text-2xl font-semibold mb-4'>Why Sponsor?</h2>
      <ul className='list-disc list-inside mb-6'>
        <li>Increase brand visibility among tech professionals.</li>
        <li>Network with industry leaders and potential clients.</li>
        <li>Support the growth of the Python community in Hong Kong.</li>
      </ul>
      <Link href='/sponsor' className='text-blue-500 hover:underline'>
        Learn more about sponsorship packages
      </Link>
      <div className='max-w-2xl mx-auto bg-white rounded shadow p-6 mt-8'>
        <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
        <p>
          Email:{' '}
          <a href='mailto:info@pycon.hk' className='text-blue-600 underline'>
            info@pycon.hk
          </a>
        </p>
      </div>
    </div>
  );
}
