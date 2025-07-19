export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='-mt-20 text-slate-500 text-sm md:text-base'
      style={{
        backgroundImage: "url('/content-page-bg.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className='container mx-auto py-16 px-4 sm:px-6 lg:px-8 opacity-80'>
        <div className='bg-slate-100 bg-opacity-90 rounded-xl shadow-xl p-8 md:p-12 relative mt-20'>
          {children}
        </div>
      </div>
    </div>
  );
}
