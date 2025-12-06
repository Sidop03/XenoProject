import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content - Responsive margin */}
      <div className="flex-1 w-full lg:ml-64">
        <Navbar />
        
        {/* Content with responsive padding and top margin for navbar */}
        <main className="mt-14 sm:mt-16 p-3 sm:p-4 lg:p-6 w-full overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
