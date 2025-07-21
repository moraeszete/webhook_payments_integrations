const { MongoClient, ObjectId } = require("mongodb")

const mongoUri = process.env.MONGO_URI 
const dbName = process.env.MONGO_DATABASE
let db

async function connect() {
  const client = new MongoClient(mongoUri)
  await client.connect()
  db = client.db(dbName)
}

connect()

module.exports = {
  toObjectId(_id) {
    return new ObjectId(_id)
  },
}
