const cron = require('node-cron');
const prisma = require('../config/prisma');
const ShopifyService = require('./shopifyService');

const syncAllTenants = async () => {
  console.log('🔄 Starting scheduled sync for all tenants...');
  
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        shopifyAccessToken: { not: null }
      }
    });

    for (const tenant of tenants) {
      try {
        console.log(`Syncing tenant: ${tenant.shopName}`);
        
        const shopify = new ShopifyService(
          tenant.shopifyStoreUrl,
          tenant.shopifyAccessToken
        );

        await shopify.syncCustomers(tenant.id);
        await shopify.syncProducts(tenant.id);
        await shopify.syncOrders(tenant.id);

        console.log(`✅ Completed sync for: ${tenant.shopName}`);
      } catch (error) {
        console.error(`❌ Sync failed for ${tenant.shopName}:`, error.message);
      }
    }

    console.log('✅ Scheduled sync completed for all tenants');
  } catch (error) {
    console.error('❌ Scheduled sync error:', error);
  }
};

const startSyncScheduler = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    syncAllTenants();
  });

  console.log('⏰ Sync scheduler started (runs every 10 minutes)');
};

module.exports = { startSyncScheduler, syncAllTenants };
