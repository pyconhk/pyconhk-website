import LayoutBackgroundImg from '../../../../../public/2025/inner-pages/background.svg';

interface LayoutProps {
  children: React.ReactNode;
  defaultXPadding?: string;
  mdXPadding?: string;
  lgXPadding?: string;
}

export default function Layout({
  children,
  defaultXPadding = 'px-8',
  mdXPadding = 'px-12',
  lgXPadding = 'px-16',
}: LayoutProps) {
  return (
    <div
      className='-mt-20 text-slate-500 text-sm md:text-base w-full h-full bg-cover bg-center bg-no-repeat'
      style={{
        backgroundImage: `url(${LayoutBackgroundImg.src})`, // We can only use style for dynamic URLs
      }}
    >
      <div className='container mx-auto py-16 px-4 sm:px-6 lg:px-8'>
        <div
          className={`bg-slate-100 rounded-xl shadow-xl py-12 ${defaultXPadding} md:${mdXPadding} md:py-16 lg:${lgXPadding} lg:py-24 relative mt-20 text-base/8 md:text-lg/8 text-gray-700 opacity-90`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
