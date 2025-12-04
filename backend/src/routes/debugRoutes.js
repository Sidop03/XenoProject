const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

// Only enable in development
if (process.env.NODE_ENV === 'development') {
  // GET /api/debug/ping
  router.get('/ping', debugController.ping);

  // GET /api/debug/tenants
  router.get('/tenants', debugController.getTenants);

  // GET /api/debug/db-stats
  router.get('/db-stats', debugController.getDbStats);
} else {
  router.use('*', (req, res) => {
    res.status(403).json({ error: 'Debug routes are disabled in production' });
  });
}

module.exports = router;
