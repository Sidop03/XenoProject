import { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import MetricCard from '../components/cards/MetricCard';
import CustomLineChart from '../components/charts/LineChart';
import CustomBarChart from '../components/charts/BarChart';
import DataTable from '../components/tables/DataTable';
import { getOverview, getRevenueByDate, getTopCustomers } from '../services/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, revenueRes, customersRes] = await Promise.all([
        getOverview(),
        getRevenueByDate(),
        getTopCustomers({ limit: 5 })
      ]);
      
      setMetrics(metricsRes.data.data);
      setRevenueData(revenueRes.data.data);
      setTopCustomers(customersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const customerColumns = [
    { key: 'firstName', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'ordersCount', label: 'Orders' },
    { 
      key: 'totalSpent', 
      label: 'Total Spent', 
      render: (row) => `₹${row.totalSpent.toFixed(2)}` 
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Customers"
          value={metrics?.totalCustomers || 0}
          icon={Users}
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts || 0}
          icon={Package}
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${(metrics?.totalRevenue || 0).toFixed(2)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Trend</h2>
        <CustomLineChart data={revenueData} dataKey="revenue" height={350} />
      </div>

      {/* Top Customers */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Customers</h2>
        <DataTable columns={customerColumns} data={topCustomers} />
      </div>
    </div>
  );
};

export default Dashboard;
