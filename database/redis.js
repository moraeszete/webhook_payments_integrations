const RedisOver = require('redisover')
let _redis;

async function connect () {
  const config = {
    prefix: process.env.REDIS_PREFIX
  }
  
  // Only add Redis connection options if not in local mode
  if (process.env.SERVER_MODE !== 'local') {
    config.options = {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD
    }
  }
  
  _redis = new RedisOver(config)
}

function getDb() {
  if(!_redis) throw new Error("Redis not connected. Call connect() first.");
  return _redis
}

module.exports = {
  connect, 
  getDb,
};
