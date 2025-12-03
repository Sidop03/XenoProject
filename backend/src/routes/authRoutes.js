const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', auth, authController.logout);

// GET /api/auth/me
router.get('/me', auth, authController.getProfile);

module.exports = router;
