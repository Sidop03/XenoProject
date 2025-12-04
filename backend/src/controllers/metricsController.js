const prisma = require('../config/prisma');

exports.getOverview = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalOrders,
      totalProducts,
      revenueData
    ] = await Promise.all([
      prisma.customer.count({ where: { tenantId: req.tenantId } }),
      prisma.order.count({ where: { tenantId: req.tenantId } }),
      prisma.product.count({ where: { tenantId: req.tenantId } }),
      prisma.order.aggregate({
        where: { tenantId: req.tenantId },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalOrders,
        totalProducts,
        totalRevenue: revenueData._sum.totalPrice || 0,
        averageOrderValue: revenueData._avg.totalPrice || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrdersByDate = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = { tenantId: req.tenantId };
    
    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }

    const orders = await prisma.order.groupBy({
      by: ['orderDate'],
      where: whereClause,
      _count: true,
      orderBy: { orderDate: 'asc' }
    });

    const formattedData = orders.map(item => ({
      date: item.orderDate.toISOString().split('T')[0],
      count: item._count
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

exports.getRevenueByDate = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = { tenantId: req.tenantId };
    
    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }

    const revenue = await prisma.order.groupBy({
      by: ['orderDate'],
      where: whereClause,
      _sum: { totalPrice: true },
      orderBy: { orderDate: 'asc' }
    });

    const formattedData = revenue.map(item => ({
      date: item.orderDate.toISOString().split('T')[0],
      revenue: item._sum.totalPrice || 0
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopCustomers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const customers = await prisma.customer.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { totalSpent: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        ordersCount: true
      }
    });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await prisma.product.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { price: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        inventory: true,
        vendor: true
      }
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerGrowth = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = { tenantId: req.tenantId };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const growth = await prisma.customer.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: true,
      orderBy: { createdAt: 'asc' }
    });

    const formattedData = growth.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};
