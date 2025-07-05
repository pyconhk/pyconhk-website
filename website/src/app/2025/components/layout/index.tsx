export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-gradient-to-br from-yellow-300 via-sky-500 to-sky-300 -mt-20 text-slate-500 text-sm md:text-base'>
      <div className='container mx-auto py-16 px-4 sm:px-6 lg:px-8'>
        <div className='bg-white bg-opacity-90 rounded-xl shadow-xl p-8 md:p-12 relative mt-20'>
          {children}
        </div>
      </div>
    </div>
  );
}
