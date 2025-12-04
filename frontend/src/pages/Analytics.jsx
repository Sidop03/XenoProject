import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';
import CustomLineChart from '../components/charts/LineChart';
import CustomBarChart from '../components/charts/BarChart';
import MetricCard from '../components/cards/MetricCard';
import { 
  getOverview, 
  getRevenueByDate, 
  getOrdersByDate, 
  getCustomerGrowth,
  getTopProducts 
} from '../services/api';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [metricsRes, revenueRes, ordersRes, growthRes, productsRes] = await Promise.all([
        getOverview(),
        getRevenueByDate(),
        getOrdersByDate(),
        getCustomerGrowth(),
        getTopProducts({ limit: 10 })
      ]);

      setMetrics(metricsRes.data.data);
      setRevenueData(revenueRes.data.data);
      setOrdersData(ordersRes.data.data);
      setCustomerGrowth(growthRes.data.data);
      setTopProducts(productsRes.data.data.map(p => ({
        name: p.title.substring(0, 20) + '...',
        value: p.price
      })));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Deep dive into your store performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average Order Value"
          value={`₹${(metrics?.averageOrderValue || 0).toFixed(2)}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${(metrics?.totalRevenue || 0).toFixed(2)}`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Customers"
          value={metrics?.totalCustomers || 0}
          icon={Users}
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          icon={ShoppingBag}
        />
      </div>

      {/* Revenue & Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <CustomLineChart data={revenueData} dataKey="revenue" height={300} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders Over Time</h2>
          <CustomLineChart data={ordersData} dataKey="count" height={300} />
        </div>
      </div>

      {/* Customer Growth */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Growth</h2>
        <CustomLineChart data={customerGrowth} dataKey="count" height={300} />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Products by Price</h2>
        <CustomBarChart data={topProducts} dataKey="value" xKey="name" height={300} />
      </div>
    </div>
  );
};

export default Analytics;




