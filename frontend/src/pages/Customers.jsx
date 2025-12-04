import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import { getCustomers } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      setCustomers(response.data.data.customers);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchCustomers();
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Customer Name',
      render: (row) => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      )
    },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || 'N/A' },
    { key: 'ordersCount', label: 'Orders' },
    { 
      key: 'totalSpent', 
      label: 'Total Spent',
      render: (row) => (
        <span className="font-semibold text-primary">
          ₹{row.totalSpent.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Joined',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your customers ({pagination.total} total)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <DataTable columns={columns} data={customers} loading={loading} />

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
