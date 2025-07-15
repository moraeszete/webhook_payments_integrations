const mongo = require('../database/mongo')
const redis = require('../database/redis')
const timestamps = require('../functions/createTimestamps')

module.exports = async () => {
  global.mongo = mongo
  global.redis = redis
  global.timestamps = timestamps
}