const redis = require('redis');

const redisClient = redis.createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: 'redis-10473.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 10473,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection failed');
        return new Error('Redis reconnection exhausted');
      }
      return retries * 500; // retry delay
    }
  }
});

// Event listeners
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

// Connect function
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
};

// Token blacklist functions
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
