import LeftSidebar from './components/layout/LeftSidebar';
import MiddlContentbar from './components/layout/MiddleContentbar';
import RightMainContent from './components/layout/RightMainContent';
import Navbar from './components/navbar/Navbar';

function App() {
  return (
    <div className='h-screen bg-[#0F0F0F] flex flex-col overflow-hidden'>
      <Navbar />
      <div className='flex flex-1 min-h-0 gap-2 p-1.5'>
        <LeftSidebar />
        <div className='flex-1 flex h-full min-w-0'>
          <MiddlContentbar />
          <RightMainContent />
        </div>
      </div>
    </div>
  );
}

export default App;
