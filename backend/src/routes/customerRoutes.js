const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

// GET /api/customers
router.get('/', auth, customerController.getCustomers);

// GET /api/customers/:id
router.get('/:id', auth, customerController.getCustomerById);

module.exports = router;
