const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const auth = require('../middleware/auth');

// POST /api/tenant/register
router.post('/register', tenantController.register);  

// POST /api/tenant/credentials
router.post('/credentials', auth, tenantController.updateCredentials);

module.exports = router;
