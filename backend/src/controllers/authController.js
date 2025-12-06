const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { blacklistToken } = require('../config/redis');

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'; 
  
  console.log('🍪 Setting cookie with:', {
    NODE_ENV: process.env.NODE_ENV,
    isProduction,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  };
};

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

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie('authToken', token, cookieOptions);
    
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // ✅ Return token in response body
    res.json({
      success: true,
      message: 'Login successful',
      token, // ✅ ADDED
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
      await blacklistToken(token, 7 * 24 * 60 * 60);
    }

    // Clear cookie
    res.clearCookie('authToken', getCookieOptions());

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
