const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST /api/webhooks/orders/create
router.post('/orders/create', webhookController.handleOrderCreate);

// POST /api/webhooks/customers/create
router.post('/customers/create', webhookController.handleCustomerCreate);

// POST /api/webhooks/products/update
router.post('/products/update', webhookController.handleProductUpdate);

module.exports = router;
