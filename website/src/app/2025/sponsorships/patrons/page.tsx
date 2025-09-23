const patrons: string[] = [
  'Mr. Martin Chan',
];

export default async function Patrons() {
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
        {patrons.map((patron, index) => (
          <li key={`patron-${index}`}>
            <span className='text-base font-semibold'>{patron}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
