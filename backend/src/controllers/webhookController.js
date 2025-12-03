const prisma = require('../config/prisma');

exports.handleOrderCreate = async (req, res, next) => {
  try {
    const orderData = req.body;
    
    // Extract shop domain from webhook headers
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain not provided' });
    }

    // Find tenant by shop URL
    const tenant = await prisma.tenant.findFirst({
      where: { 
        shopifyStoreUrl: {
          contains: shopDomain
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const customerId = orderData.customer?.id?.toString();
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID missing' });
    }

    await prisma.order.upsert({
      where: { id: orderData.id.toString() },
      update: {
        orderNumber: orderData.order_number?.toString(),
        totalPrice: parseFloat(orderData.total_price || 0),
        subtotalPrice: parseFloat(orderData.subtotal_price || 0),
        taxPrice: parseFloat(orderData.total_tax || 0),
        status: orderData.cancelled_at ? 'cancelled' : 'open',
        fulfillmentStatus: orderData.fulfillment_status || 'unfulfilled',
        financialStatus: orderData.financial_status || 'pending',
        updatedAt: new Date()
      },
      create: {
        id: orderData.id.toString(),
        tenantId: tenant.id,
        customerId,
        orderNumber: orderData.order_number?.toString(),
        totalPrice: parseFloat(orderData.total_price || 0),
        subtotalPrice: parseFloat(orderData.subtotal_price || 0),
        taxPrice: parseFloat(orderData.total_tax || 0),
        orderDate: new Date(orderData.created_at),
        status: 'open',
        fulfillmentStatus: orderData.fulfillment_status || 'unfulfilled',
        financialStatus: orderData.financial_status || 'pending',
        createdAt: new Date(orderData.created_at)
      }
    });

    res.status(200).json({ success: true, message: 'Order webhook processed' });
  } catch (error) {
    console.error('Order webhook error:', error);
    next(error);
  }
};

exports.handleCustomerCreate = async (req, res, next) => {
  try {
    const customerData = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain not provided' });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { 
        shopifyStoreUrl: {
          contains: shopDomain
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    await prisma.customer.upsert({
      where: { id: customerData.id.toString() },
      update: {
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        phone: customerData.phone,
        totalSpent: parseFloat(customerData.total_spent || 0),
        ordersCount: customerData.orders_count || 0,
        updatedAt: new Date()
      },
      create: {
        id: customerData.id.toString(),
        tenantId: tenant.id,
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        phone: customerData.phone,
        totalSpent: parseFloat(customerData.total_spent || 0),
        ordersCount: customerData.orders_count || 0,
        createdAt: new Date(customerData.created_at),
        updatedAt: new Date(customerData.updated_at)
      }
    });

    res.status(200).json({ success: true, message: 'Customer webhook processed' });
  } catch (error) {
    console.error('Customer webhook error:', error);
    next(error);
  }
};

exports.handleProductUpdate = async (req, res, next) => {
  try {
    const productData = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain not provided' });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { 
        shopifyStoreUrl: {
          contains: shopDomain
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const variant = productData.variants?.[0];
    
    await prisma.product.upsert({
      where: { id: productData.id.toString() },
      update: {
        title: productData.title,
        price: parseFloat(variant?.price || 0),
        inventory: variant?.inventory_quantity || 0,
        status: productData.status,
        vendor: productData.vendor,
        productType: productData.product_type,
        updatedAt: new Date()
      },
      create: {
        id: productData.id.toString(),
        tenantId: tenant.id,
        title: productData.title,
        price: parseFloat(variant?.price || 0),
        inventory: variant?.inventory_quantity || 0,
        status: productData.status,
        vendor: productData.vendor,
        productType: productData.product_type,
        createdAt: new Date(productData.created_at),
        updatedAt: new Date(productData.updated_at)
      }
    });

    res.status(200).json({ success: true, message: 'Product webhook processed' });
  } catch (error) {
    console.error('Product webhook error:', error);
    next(error);
  }
};
