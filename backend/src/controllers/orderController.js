const prisma = require('../config/prisma');

exports.getOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '',
      startDate = '',
      endDate = '',
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = { tenantId: req.tenantId };

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.order.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        tenantId: req.tenantId 
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
