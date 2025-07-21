const RedisOver = require('redisover')
let redis;

async function connect () {
  const config = {
    prefix: process.MONGO_DATABASE,
    // options: {
    //   this null options in redisover are accepted
    //   use if you will be in local or development
    //   host: process.env.REDIS_HOST,
    //   port: Number(process.env.REDIS_PORT),
    //   username: global.redisConfig?.username || '',
    //   password: global.redisConfig?.password || ''
    // }
  }
  if (process.env.MODE_ENV === 'prod') {
    config.options.host = process.env.REDIS_HOST;
    config.options.port = Number(process.env.REDIS_PORT);
    config.options.username = process.env.REDIS_USERNAME || '';
    config.options.password = process.env.REDIS_PASSWORD || '';
  }
  redis = new RedisOver(config)

  try {
    const ping = await redis._ping();
    console.log('Redis connected:', ping);
  } catch (error) {
    return console.log('Redis:', error)    
  }
}
connect()

module.exports = redis;
