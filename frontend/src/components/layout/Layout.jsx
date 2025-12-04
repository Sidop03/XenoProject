import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="mt-16 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
