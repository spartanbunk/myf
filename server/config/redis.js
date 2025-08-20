const redis = require('redis');

let client;

async function connectRedis() {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Too many Redis reconnection attempts');
            return new Error('Too many retries');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis client connected');
    });

    client.on('ready', () => {
      console.log('Redis client ready');
    });

    await client.connect();
    
    // Test the connection
    await client.ping();
    
    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

// Cache helper functions
async function getCached(key) {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

async function setCached(key, data, ttl = 3600) {
  try {
    await client.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

async function deleteCached(key) {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

async function clearCache(pattern = '*') {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis clear error:', error);
    return false;
  }
}

module.exports = {
  connectRedis,
  getCached,
  setCached,
  deleteCached,
  clearCache,
  getClient: () => client
};