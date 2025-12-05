const redis = require('redis');

let redisClient = null;
let publisher = null;
let subscriber = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('⚠️  Redis URL not provided - running without Redis');
    return;
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 30000, // 30 seconds (increased from default 5s)
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('❌ Redis max retries reached');
            return new Error('Redis connection failed');
          }
          console.log(`🔄 Redis reconnecting... attempt ${retries}`);
          return retries * 1000; // Exponential backoff
        }
      }
    });

    publisher = redisClient.duplicate();
    subscriber = redisClient.duplicate();

    await Promise.all([
      redisClient.connect(),
      publisher.connect(),
      subscriber.connect()
    ]);

    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('⚠️  Redis connection failed:', error.message);
    redisClient = null;
    publisher = null;
    subscriber = null;
  }
};

// ✅ ADD THESE FUNCTIONS:

/**
 * Blacklist a token (for logout)
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresIn - Expiration time in seconds
 */
const blacklistToken = async (token, expiresIn) => {
  if (!redisClient) {
    console.log('⚠️  Redis not available, cannot blacklist token');
    return;
  }

  try {
    await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
    console.log('✅ Token blacklisted');
  } catch (error) {
    console.error('❌ Error blacklisting token:', error);
  }
};

/**
 * Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} - True if blacklisted, false otherwise
 */
const isTokenBlacklisted = async (token) => {
  if (!redisClient) {
    console.log('⚠️  Redis not available, skipping blacklist check');
    return false; // If Redis is down, allow the request
  }

  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === 'true';
  } catch (error) {
    console.error('❌ Error checking token blacklist:', error);
    return false; // If check fails, allow the request
  }
};

module.exports = {
  redisClient,
  publisher,
  subscriber,
  connectRedis,
  blacklistToken,     // ✅ Export this
  isTokenBlacklisted  // ✅ Export this
};
