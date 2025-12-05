import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import DataTable from '../components/tables/DataTable';
import { getProducts } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Product Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-gray-500">{row.vendor || 'No vendor'}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'price', 
      label: 'Price',
      render: (row) => (
        <span className="font-semibold text-primary">
          ${row.price.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'inventory', 
      label: 'Stock',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.inventory > 10 
            ? 'bg-green-100 text-green-800' 
            : row.inventory > 0 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.inventory} units
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status?.toUpperCase() || 'ACTIVE'}
        </span>
      )
    },
    { 
      key: 'productType', 
      label: 'Category',
      render: (row) => row.productType || 'Uncategorized'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">
          Manage your product catalog ({pagination.total} products)
        </p>
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
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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

      {/* Products Table */}
      <DataTable columns={columns} data={products} loading={loading} />

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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
