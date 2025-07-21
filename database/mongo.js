const { MongoClient, ObjectId } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DATABASE;

let _db;

async function connect() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  _db = client.db(dbName);
  return _db;
}

function getDb() {
  if (!_db) throw new Error("MongoDB not connected. Call connect() first.");
  return _db;
}

function toObjectId(id) {
  return new ObjectId(id.toString());
}

module.exports = {
  connect,
  getDb,
  toObjectId,
};
