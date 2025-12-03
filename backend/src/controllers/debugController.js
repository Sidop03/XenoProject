const prisma = require('../config/prisma');

exports.ping = async (req, res) => {
  res.json({
    success: true,
    message: 'Pong!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
};

exports.getTenants = async (req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        email: true,
        shopName: true,
        shopifyStoreUrl: true,
        createdAt: true,
        _count: {
          select: {
            customers: true,
            orders: true,
            products: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { tenants }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDbStats = async (req, res, next) => {
  try {
    const [
      tenantsCount,
      customersCount,
      ordersCount,
      productsCount,
      syncLogsCount
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.syncLog.count()
    ]);

    res.json({
      success: true,
      data: {
        database: {
          tenants: tenantsCount,
          customers: customersCount,
          orders: ordersCount,
          products: productsCount,
          syncLogs: syncLogsCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
