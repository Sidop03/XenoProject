const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// GET /api/orders
router.get('/', auth, orderController.getOrders);

// GET /api/orders/:id
router.get('/:id', auth, orderController.getOrderById);

module.exports = router;
 