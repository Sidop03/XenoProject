const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { isTokenBlacklisted } = require('../config/redis');

const auth = async (req, res, next) => {
  try {
    // ✅ Check Authorization header FIRST (for Bearer token)
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // ✅ Fallback to cookie (for local development)
    if (!token) {
      token = req.cookies.authToken;
      console.log('Using token from cookie');
    } else {
      console.log('Using token from Authorization header');
    }
    
    if (!token) {
      console.log('No token found in header or cookie');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check blacklist
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      console.log('Token is blacklisted');
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for tenantId:', decoded.tenantId);
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
      select: { id: true, email: true, shopName: true }
    });

    if (!tenant) {
      console.log('Tenant not found');
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    console.log('Request authenticated for:', tenant.email);
    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired');
      return res.status(401).json({ error: 'Token has expired' });
    }
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = auth;
