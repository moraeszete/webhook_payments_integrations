const mongodb = require('../database/mongo')
const timestamps = require('../utils/timestamps')
const idempotency = require('../utils/idempotency')

// Mongo {connect(), getDb(), toObjectId()}
// Idempotency system using MongoDB TTL

module.exports = async () => {
  // MongoDB connection
  const db = await mongodb.connect()
  global.mongo = db

  // Initialize idempotency system
  await idempotency.initialize()
  global.idempotency = idempotency

  global.timestamps = timestamps

  console.log("Utilities initialized", await global.timestamps.create())
}