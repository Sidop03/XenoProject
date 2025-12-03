const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { isTokenBlacklisted } = require('../config/redis');

const auth = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
      select: { id: true, email: true, shopName: true }
    });

    if (!tenant) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = auth;
