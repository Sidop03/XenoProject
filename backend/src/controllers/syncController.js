const prisma = require('../config/prisma');
const ShopifyService = require('../services/shopifyServices');

exports.syncAll = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId }
    });

    if (!tenant.shopifyAccessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    const shopify = new ShopifyService(
      tenant.shopifyStoreUrl, 
      tenant.shopifyAccessToken
    );

    const results = {
      customers: { success: false, count: 0 },
      products: { success: false, count: 0 },
      orders: { success: false, count: 0 }
    };

    try {
      results.customers = await shopify.syncCustomers(req.tenantId);
    } catch (error) {
      console.error('Customer sync failed:', error.message);
    }

    try {
      results.products = await shopify.syncProducts(req.tenantId);
    } catch (error) {
      console.error('Product sync failed:', error.message);
    }

    try {
      results.orders = await shopify.syncOrders(req.tenantId);
    } catch (error) {
      console.error('Order sync failed:', error.message);
    }

    res.json({
      success: true,
      message: 'Sync completed',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

exports.syncCustomers = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId }
    });

    if (!tenant.shopifyAccessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    const shopify = new ShopifyService(
      tenant.shopifyStoreUrl, 
      tenant.shopifyAccessToken
    );

    const result = await shopify.syncCustomers(req.tenantId);

    res.json({
      success: true,
      message: 'Customers synced successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.syncOrders = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId }
    });

    if (!tenant.shopifyAccessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    const shopify = new ShopifyService(
      tenant.shopifyStoreUrl, 
      tenant.shopifyAccessToken
    );

    const result = await shopify.syncOrders(req.tenantId);

    res.json({
      success: true,
      message: 'Orders synced successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.syncProducts = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId }
    });

    if (!tenant.shopifyAccessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    const shopify = new ShopifyService(
      tenant.shopifyStoreUrl, 
      tenant.shopifyAccessToken
    );

    const result = await shopify.syncProducts(req.tenantId);

    res.json({
      success: true,
      message: 'Products synced successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getSyncStatus = async (req, res, next) => {
  try {
    const logs = await prisma.syncLog.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const summary = await prisma.syncLog.groupBy({
      by: ['syncType', 'status'],
      where: { tenantId: req.tenantId },
      _count: true
    });

    res.json({
      success: true,
      data: {
        recentLogs: logs,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};
