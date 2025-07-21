const mongodb = require('../database/mongo')
const redisdb = require('../database/redis')
const timestamps = require('../functions/createTimestamps')

// Mongo {connect(), getDb(), toObjectId()}
// Redis {connect(), getDb()}
// This implementation was made for garbage collecting purposes

module.exports = async () => {
  // MongoDB connection
  await mongodb.connect()
  global.mongo = mongodb.getDb()
  // redis connection
  await redisdb.connect()
  global.redis = redisdb.getDb()
  global.timestamps = timestamps
}