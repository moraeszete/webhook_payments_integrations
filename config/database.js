const mongodb = require('../database/mongo')
const timestamps = require('../utils/timestamps')

module.exports = async () => {
  // MongoDB connection
  const db = await mongodb.connect()
  global.mongo = db

  // Initialize idempotency system
  global.timestamps = timestamps

  console.log("TimeStamps:", 
    (await global.timestamps.create()).createdAtInFullLong
  )
}