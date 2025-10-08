import CallForActions from './components/pages/CallForActions';
import FeaturedSpeakers from './components/pages/Speakers';
import Home from './components/pages/Home';
import LatestNews from './components/pages/LatestNews';
import SponsorCarousel from './components/pages/SponsorCarousel';

const sections = [
  {
    id: 'latest-news',
    Component: LatestNews,
  },
  {
    id: 'sponsorships',
    Component: SponsorCarousel,
  },
  {
    id: 'featured-speakers',
    Component: FeaturedSpeakers,
  },
  {
    id: 'call-for-actions',
    Component: CallForActions,
  },
];
const sectionNodes: React.ReactNode[] = sections.map(
  ({ id, Component }, index) => (
    <section
      key={id}
      id={id}
      className={`py-12 md:py-24 ${index == 0 && 'pt-24 md:pt-36'} bg-gradient-to-b ${index % 2 == 0 ? 'from-white to-blue-50' : 'from-blue-50 to-white'}`}
    >
      <Component />
    </section>
  )
);

export default function Page() {
  return (
    <div className='w-full min-h-screen -mt-20'>
      <Home />
      {sectionNodes.map(node => node)}
    </div>
  );
}
