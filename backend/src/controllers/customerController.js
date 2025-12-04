const prisma = require('../config/prisma');

exports.getCustomers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = { tenantId: req.tenantId };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          totalSpent: true,
          ordersCount: true,
          createdAt: true
        }
      }),
      prisma.customer.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        customers,
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

exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        tenantId: req.tenantId 
      },
      include: {
        orders: {
          take: 10,
          orderBy: { orderDate: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            totalPrice: true,
            orderDate: true,
            status: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    next(error);
  }
};
 