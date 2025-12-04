const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const auth = require('../middleware/auth');

// POST /api/sync/start
router.post('/start', auth, syncController.syncAll);

// POST /api/sync/customers
router.post('/customers', auth, syncController.syncCustomers);

// POST /api/sync/orders
router.post('/orders', auth, syncController.syncOrders);

// POST /api/sync/products
router.post('/products', auth, syncController.syncProducts);

// GET /api/sync/status
router.get('/status', auth, syncController.getSyncStatus);

module.exports = router;
