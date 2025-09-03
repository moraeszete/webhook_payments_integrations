const mongodb = require('../database/mongo')
const timestamps = require('../utils/timestamps')
const idempotency = require('../utils/idempotency')

// Mongo {connect(), getDb(), toObjectId()}
// Idempotency system using MongoDB TTL

module.exports = async () => {
  // MongoDB connection
  await mongodb.connect()
  global.mongo = mongodb.getDb()
  console.log("✅ MongoDB connected successfully")
  
  // Initialize idempotency system
  await idempotency.initialize()
  global.idempotency = idempotency
  console.log("✅ Idempotency system initialized")

  global.timestamps = timestamps
  console.log("✅ Timestamps utility initialized", global.timestamps.create())
}