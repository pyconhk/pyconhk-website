import CallForActions from './components/pages/CallForActions';
import Home from './components/pages/Home';

export default function Page() {
  return (
    <div className='w-full min-h-screen -mt-20'>
      <Home />
      <CallForActions />
    </div>
  );
}
