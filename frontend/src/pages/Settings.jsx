import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, RefreshCw } from 'lucide-react';
import { syncAll } from '../services/api';

const Settings = () => {
  const { user } = useAuth();
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and store settings</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              type="text"
              value={user?.shopName || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shopify Store URL
            </label>
            <input
              type="text"
              value={user?.shopifyStoreUrl || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Data Sync */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Synchronization</h2>
        <p className="text-gray-600 mb-4">
          Sync your Shopify data manually. Automatic sync runs every 10 minutes.
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing Data...' : 'Sync Now'}
        </button>
      </div>

      {/* About
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Created by:</strong> Xeno FDE Internship Assignment</p>
          <p><strong>Tech Stack:</strong> React, Node.js, PostgreSQL, Redis</p>
        </div>
      </div> */}
    </div>
  );
};

export default Settings;
