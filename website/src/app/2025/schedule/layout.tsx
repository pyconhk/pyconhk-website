import LayoutBackgroundImg from '../../../../public/2025/inner-pages/background.svg';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='-mt-20 text-slate-500 text-sm md:text-base w-full h-full bg-cover bg-center bg-no-repeat p-0'
      style={{
        backgroundImage: `url(${LayoutBackgroundImg.src})`, // We can only use style for dynamic URLs
      }}
    >
      {children}
    </div>
  );
}
