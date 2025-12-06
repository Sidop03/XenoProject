import { LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { syncAll } from '../../services/api';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAll();
      alert('Data synced successfully!');
    } catch (error) {
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-20">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Title - Add left padding ONLY on mobile (when hamburger is present) */}
        <div className="pl-14 lg:pl-0 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 whitespace-nowrap">
            {user?.shopName || 'Xeno Project Store'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Sync Button - Always visible */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
          
          {/* User Info - Desktop only */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
              <p className="text-xs text-gray-500">{user?.shopName}</p>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Logout Button - Mobile/Tablet */}
          <button
            onClick={logout}
            className="md:hidden p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
