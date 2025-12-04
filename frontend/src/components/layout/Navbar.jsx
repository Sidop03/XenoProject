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
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {user?.shopName || 'Dashboard'}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
              <p className="text-xs text-gray-500">{user?.shopName}</p>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-white hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
