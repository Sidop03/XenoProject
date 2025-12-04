const axios = require('axios');
const prisma = require('../config/prisma');

class ShopifyService {
  constructor(storeUrl, accessToken) {
    this.storeUrl = storeUrl.replace('.myshopify.com', '');
    this.accessToken = accessToken;
    this.baseUrl = `https://${this.storeUrl}.myshopify.com/admin/api/2024-01`;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // Retry logic for rate limiting
  async makeRequest(url, retries = 3, delay = 1000) {
    try {
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429 && retries > 0) {
        console.log(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, retries - 1, delay * 2); // Exponential backoff
      }
      throw error;
    }
  }

  async fetchCustomers(limit = 250) {
    try {
      const data = await this.makeRequest(`/customers.json?limit=${limit}`);
      return data.customers || [];
    } catch (error) {
      console.error('Error fetching customers:', error.message);
      throw error;
    }
  }

  async fetchOrders(limit = 250) {
    try {
      const data = await this.makeRequest(`/orders.json?limit=${limit}&status=any`);
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      throw error;
    }
  }

  async fetchProducts(limit = 250) {
    try {
      const data = await this.makeRequest(`/products.json?limit=${limit}`);
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  }

  async syncCustomers(tenantId) {
    try {
      const customers = await this.fetchCustomers();
      let syncedCount = 0;

      for (const customer of customers) {
        await prisma.customer.upsert({
          where: { id: customer.id.toString() },
          update: {
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: customer.phone,
            totalSpent: parseFloat(customer.total_spent || 0),
            ordersCount: customer.orders_count || 0,
            updatedAt: new Date(customer.updated_at)
          },
          create: {
            id: customer.id.toString(),
            tenantId,
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: customer.phone,
            totalSpent: parseFloat(customer.total_spent || 0),
            ordersCount: customer.orders_count || 0,
            createdAt: new Date(customer.created_at),
            updatedAt: new Date(customer.updated_at)
          }
        });
        syncedCount++;
      }

      await this.logSync(tenantId, 'customers', 'success', syncedCount);
      return { success: true, count: syncedCount };
    } catch (error) {
      await this.logSync(tenantId, 'customers', 'failed', 0, error.message);
      throw error;
    }
  }

  async syncProducts(tenantId) {
    try {
      const products = await this.fetchProducts();
      let syncedCount = 0;

      for (const product of products) {
        const variant = product.variants?.[0];
        await prisma.product.upsert({
          where: { id: product.id.toString() },
          update: {
            title: product.title,
            price: parseFloat(variant?.price || 0),
            inventory: variant?.inventory_quantity || 0,
            status: product.status,
            vendor: product.vendor,
            productType: product.product_type,
            updatedAt: new Date(product.updated_at)
          },
          create: {
            id: product.id.toString(),
            tenantId,
            title: product.title,
            price: parseFloat(variant?.price || 0),
            inventory: variant?.inventory_quantity || 0,
            status: product.status,
            vendor: product.vendor,
            productType: product.product_type,
            createdAt: new Date(product.created_at),
            updatedAt: new Date(product.updated_at)
          }
        });
        syncedCount++;
      }

      await this.logSync(tenantId, 'products', 'success', syncedCount);
      return { success: true, count: syncedCount };
    } catch (error) {
      await this.logSync(tenantId, 'products', 'failed', 0, error.message);
      throw error;
    }
  }

  async syncOrders(tenantId) {
    try {
      const orders = await this.fetchOrders();
      console.log(`\n📦 Fetched ${orders.length} orders from Shopify`);
      
      let syncedCount = 0;
  
      for (const order of orders) {
        // More robust customer ID extraction
        const customerId = order.customer?.id ? String(order.customer.id) : null;
        
        console.log(`Processing Order #${order.order_number} - Customer ID: ${customerId || 'NONE'}`);
        
        // Don't skip orders without customers - set customerId to null
        // This allows you to track orders even if customer data is missing
        
        try {
          await prisma.order.upsert({
            where: { id: order.id.toString() },
            update: {
              orderNumber: parseInt(order.order_number),
              totalPrice: parseFloat(order.total_price || 0),
              subtotalPrice: parseFloat(order.subtotal_price || 0),
              taxPrice: parseFloat(order.total_tax || 0),
              orderDate: new Date(order.created_at),
              status: order.cancelled_at ? 'cancelled' : order.closed_at ? 'closed' : 'open',
              fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
              financialStatus: order.financial_status || 'pending',
              updatedAt: new Date(order.updated_at)
            },
            create: {
              id: order.id.toString(),
              tenantId,
              customerId,  // Can be null if customer not found
              orderNumber: parseInt(order.order_number),
              totalPrice: parseFloat(order.total_price || 0),
              subtotalPrice: parseFloat(order.subtotal_price || 0),
              taxPrice: parseFloat(order.total_tax || 0),
              orderDate: new Date(order.created_at),
              status: order.cancelled_at ? 'cancelled' : order.closed_at ? 'closed' : 'open',
              fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
              financialStatus: order.financial_status || 'pending',
              createdAt: new Date(order.created_at),
              updatedAt: new Date(order.updated_at)
            }
          });
          console.log(`✅ Synced order #${order.order_number}`);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Failed order #${order.order_number}:`, error.message);
        }
      }
  
      console.log(`\n✅ Total synced: ${syncedCount} orders`);
      
      await this.logSync(tenantId, 'orders', 'success', syncedCount);
      return { success: true, count: syncedCount };
    } catch (error) {
      console.error('❌ Order sync failed:', error.message);
      await this.logSync(tenantId, 'orders', 'failed', 0, error.message);
      throw error;
    }
  }
  

  async logSync(tenantId, syncType, status, recordsCount, errorMessage = null) {
    await prisma.syncLog.create({
      data: {
        tenantId,
        syncType,
        status,
        recordsCount,
        errorMessage
      }
    });
  }
}

module.exports = ShopifyService;
