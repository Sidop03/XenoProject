const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection failed');
        return new Error('Redis reconnection exhausted');
      }
      return retries * 500;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
};

const blacklistToken = async (token, expiresIn = 604800) => {
  try {
    await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

const isTokenBlacklisted = async (token) => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  } catch (error) {
    console.error('Error checking blacklist:', error);
    return false;
  }
};

module.exports = { 
  redisClient,
  connectRedis,
  blacklistToken,
  isTokenBlacklisted 
};
