const prisma = require('../config/prisma');

exports.getOrders = async (req, res) => {
    try {
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;
      const tenantId = req.tenantId;  // ✅ Changed from req.user.id to req.tenantId
      
      console.log('📦 Fetching orders for tenant:', tenantId);
      console.log('Filters:', { status, startDate, endDate });
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // Build where clause
      const where = { tenantId };
      
      if (status && status !== '') {
        where.status = status;
      }
      
      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate && startDate !== '') {
          where.orderDate.gte = new Date(startDate);
        }
        if (endDate && endDate !== '') {
          where.orderDate.lte = new Date(endDate);
        }
      }
  
      console.log('Where clause:', JSON.stringify(where, null, 2));
  
      // Fetch orders with customer relationship
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { orderDate: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.order.count({ where })
      ]);
  
      console.log(`✅ Found ${orders.length} orders (${total} total)`);
  
      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('❌ Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
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
