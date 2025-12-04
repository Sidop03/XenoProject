import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/tenant/register', data);
export const logout = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/me');

// Sync
export const syncAll = () => api.post('/sync/start');
export const syncCustomers = () => api.post('/sync/customers');
export const syncOrders = () => api.post('/sync/orders');
export const syncProducts = () => api.post('/sync/products');
export const getSyncStatus = () => api.get('/sync/status');

// Metrics
export const getOverview = () => api.get('/metrics/overview');
export const getOrdersByDate = (params) => api.get('/metrics/orders-by-date', { params });
export const getRevenueByDate = (params) => api.get('/metrics/revenue-by-date', { params });
export const getTopCustomers = (params) => api.get('/metrics/top-customers', { params });
export const getTopProducts = (params) => api.get('/metrics/top-products', { params });
export const getCustomerGrowth = (params) => api.get('/metrics/customer-growth', { params });

// Data
export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);

export default api;
