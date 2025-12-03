const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const auth = require('../middleware/auth');

// GET /api/metrics/overview
router.get('/overview', auth, metricsController.getOverview);

// GET /api/metrics/orders-by-date
router.get('/orders-by-date', auth, metricsController.getOrdersByDate);

// GET /api/metrics/revenue-by-date
router.get('/revenue-by-date', auth, metricsController.getRevenueByDate);

// GET /api/metrics/top-customers
router.get('/top-customers', auth, metricsController.getTopCustomers);

// GET /api/metrics/top-products
router.get('/top-products', auth, metricsController.getTopProducts);

// GET /api/metrics/customer-growth
router.get('/customer-growth', auth, metricsController.getCustomerGrowth);

module.exports = router;
