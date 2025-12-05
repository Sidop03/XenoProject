import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import { getOrders } from '../services/api';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setOrders(response.data.data.orders);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const columns = [
    { 
      key: 'orderNumber', 
      label: 'Order #',
      render: (row) => `#${row.orderNumber || row.id.slice(0, 8)}`
    },
    { 
      key: 'customer', 
      label: 'Customer',
      render: (row) => (
        <div>
          {row.customer ? (
            <>
              <p className="font-medium">
                {row.customer.firstName} {row.customer.lastName}
              </p>
              <p className="text-xs text-gray-500">{row.customer.email}</p>
            </>
          ) : (
            <p className="text-gray-400 italic">No customer</p>
          )}
        </div>
      )
    },
    { 
      key: 'totalPrice', 
      label: 'Amount',
      render: (row) => (
        <span className="font-semibold text-primary">
          ₹{row.totalPrice.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    { 
      key: 'orderDate', 
      label: 'Date',
      render: (row) => format(new Date(row.orderDate), 'MMM dd, yyyy')
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          View and manage all orders ({pagination.total} total)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-800 bg-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 pl-10 text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none"
                style={{
                  colorScheme: 'light'
                }}
              />
              <Calendar 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={18} 
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 pl-10 text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none"
                style={{
                  colorScheme: 'light'
                }}
              />
              <Calendar 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={18} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable columns={columns} data={orders} loading={loading} />

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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
