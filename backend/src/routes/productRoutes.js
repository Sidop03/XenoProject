const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// GET /api/products
router.get('/', auth, productController.getProducts);

// GET /api/products/:id
router.get('/:id', auth, productController.getProductById);

module.exports = router;
