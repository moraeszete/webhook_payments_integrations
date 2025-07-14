const { MongoClient, ObjectId } = require("mongodb")

const mongoUri = global.configs.mongo.ip
const dbName = process.env.MONGO_DATABASE
let db

async function connect() {
  const client = new MongoClient(mongoUri)
  await client.connect()
  db = client.db(dbName)
}

connect()

module.exports = {
  config: async (obj) => {
    if (obj.db) {
      let newDb = db
      newDb.db(obj.db)
      return newDb.collection(obj.coll)
    }
    return db.collection(obj)
  },
  ObjectId (_id) {
    return new ObjectId(_id)
  }
}