import CallForActions from './components/pages/CallForActions';
import Home from './components/pages/Home';
import FeaturedSpeakers from './components/pages/Speakers';
import NewHome from './components/pages/NewHome';

export default function Page() {
  return (
    <div className='w-full min-h-screen -mt-20'>
      <NewHome />
      {/* <Home /> */}
      <FeaturedSpeakers />
      <CallForActions />
    </div>
  );
}
