const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { blacklistToken } = require('../config/redis');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' }); 
    }

    const tenant = await prisma.tenant.findUnique({
      where: { email }
    });

    if (!tenant) {  
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, tenant.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { tenantId: tenant.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set token in httpOnly cookie
    // Set cookie with cross-domain settings
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true, // ✅ MUST be true for production (HTTPS)
      sameSite: 'none', // ✅ CRITICAL: allows cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/' // ✅ Ensure cookie is available for all paths
    });


    res.json({
      success: true,
      message: 'Login successful',
      data: {
        tenant: {
          id: tenant.id,
          email: tenant.email,
          shopName: tenant.shopName
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.token;

    if (token) {
      // Blacklist the token in Redis (expires in 7 days)
      await blacklistToken(token, 7 * 24 * 60 * 60);
    }

    // Clear the cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId },
      select: {
        id: true,
        email: true,
        shopName: true,
        shopifyStoreUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};
