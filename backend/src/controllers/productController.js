const prisma = require('../config/prisma');

exports.getProducts = async (req, res, next) => {
    console.log('getProducts');
    
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
      whereClause.title = { 
        contains: search, 
        mode: 'insensitive' 
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          price: true,
          inventory: true,
          status: true,
          vendor: true,
          productType: true,
          createdAt: true
        }
      }),
      prisma.product.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        products,
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

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { 
        id,
        tenantId: req.tenantId 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};
