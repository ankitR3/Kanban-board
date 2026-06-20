import LeftSidebar from './components/layout/LeftSidebar';
import MiddlContentbar from './components/layout/MiddleContentbar';
import RightMainContent from './components/layout/RightMainContent';

function App() {
  return (
    <div className='h-screen bg-[#0F0F0F] p-1.5'>
      <div className='flex h-full gap-2'>
        <LeftSidebar />
        <div className='w-full flex h-full'>
          <MiddlContentbar />
          <RightMainContent />
        </div>
      </div>
    </div>
  );
}

export default App;
