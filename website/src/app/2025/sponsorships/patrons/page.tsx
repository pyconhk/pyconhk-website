const patrons: string[] = [
  'Mr. Joe Chan',
  'Mr. Anthony Lai',
  'Mr. Calvin Tsang',
  'PyCon香港補完計画',
  'In memory of Madam. Yu Shui Chun',
];

export default async function Patrons() {
  const isTestEnv = process.env.NEXT_PUBLIC_IS_TEST_ENV == 'true';
  return (
    <>
      <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold text-center'>
        Patrons
      </h1>
      <p className='mt-8'>
        A sincere thank you to our generous patrons of PyCon HK 2025! Your
        invaluable support ignites our passion for Python and drives the growth
        of our vibrant community. We&apos;re deeply grateful for your
        commitment!
      </p>
      <ul className='mt-8 space-y-2'>
        {isTestEnv &&
          patrons.map(patron => (
            <li key={patron}>
              <span className='text-base font-semibold'>
                {patron}
              </span>
            </li>
          ))}
      </ul>
    </>
  );
}
