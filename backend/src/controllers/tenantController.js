const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

exports.register = async (req, res, next) => {
  try {
    const { email, password, shopName, shopifyStoreUrl, shopifyAccessToken } = req.body;

    if (!email || !password || !shopName || !shopifyStoreUrl) {
      return res.status(400).json({ 
        error: 'Email, password, shop name, and Shopify store URL are required' 
      });
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { email }
    });

    if (existingTenant) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        email,
        password: hashedPassword,
        shopName,
        shopifyStoreUrl,
        shopifyAccessToken
      },
      select: {
        id: true,
        email: true,
        shopName: true,
        shopifyStoreUrl: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { tenantId: tenant.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set token in httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCredentials = async (req, res, next) => {
  try {
    const { shopifyStoreUrl, shopifyAccessToken, shopifyApiKey } = req.body;

    if (!shopifyStoreUrl || !shopifyAccessToken) {
      return res.status(400).json({ 
        error: 'Shopify store URL and access token are required' 
      });
    }

    const tenant = await prisma.tenant.update({
      where: { id: req.tenantId },
      data: {
        shopifyStoreUrl,
        shopifyAccessToken,
        ...(shopifyApiKey && { shopifyApiKey })
      },
      select: {
        id: true,
        email: true,
        shopName: true,
        shopifyStoreUrl: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Credentials updated successfully',
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};
