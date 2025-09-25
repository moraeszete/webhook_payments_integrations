// Token Creation Module
// Supports MongoDB.
//
// Usage:
//   const createToken = require('./scripts/createToken');
//   await createToken.create();       // MongoDB
//   const token = createToken.generate(); // Memory only
//
// CLI Usage:
//   node -e "require('./scripts/createToken').auto()"
//   node -e "require('./scripts/createToken').mongo()"
//   node -e "require('./scripts/createToken').sql()"
//   node -e "require('./scripts/createToken').generate()"
//
require('dotenv').config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const canCreateInDB = process.env.CREATE_IN_DB === 'true';

// MongoDB environment variables
const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = process.env.MONGO_DATABASE;
const COLLECTION_NAME = process.env.SUPPLIERS_TOKENS;


/*
 * Generate random token and bcrypt hash
 */
function generateToken() {
  const secret = crypto.randomBytes(5).toString('hex').slice(0, 10);
  const hashSecret = bcrypt.hashSync(secret, 8);
  return { secret, hashSecret };
}

/*
 * Create token for MongoDB
 */
async function mongo() {
  const { secret, hashSecret } = generateToken();

  const completeObject = {
    success: !canCreateInDB,
    token: `${secret}:PENDING_ID`,
    secret,
    hashSecret,
    tokenId: 'PENDING_ID',
    database: 'MongoDB',
    savedToDatabase: false,
    timestamp: new Date().toISOString()
  };

  if (!canCreateInDB) {
    console.warn('Database creation disabled.');
    if (process.argv.includes('-e')) { // -e flag to output complete JSON
      console.log(JSON.stringify(completeObject, null, 2));
    }
    return completeObject;
  }

  // Validate environment variables
  if (!MONGO_URI || !DATABASE_NAME || !COLLECTION_NAME) {
    const missingVars = [];
    if (!MONGO_URI) missingVars.push('MONGO_URI');
    if (!DATABASE_NAME) missingVars.push('MONGO_DATABASE');
    if (!COLLECTION_NAME) missingVars.push('SUPPLIERS_TOKENS');

    const errorResult = {
      ...completeObject,
      success: false,
      error: `Missing required environment variables: ${missingVars.join(', ')}`,
      missingVariables: missingVars
    };

    console.error('Missing environment variables:', missingVars.join(', '));
    if (process.argv.includes('-e')) {
      console.log(JSON.stringify(errorResult, null, 2));
    }
    return errorResult;
  }

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collTokens = db.collection(COLLECTION_NAME);

    // Insert new token document
    const tokenDoc = {
      token: hashSecret,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    const result = await collTokens.insertOne(tokenDoc);
    const insertedId = result.insertedId.toString();

    // Update complete object with generated ID
    completeObject.success = true;
    completeObject.savedToDatabase = true;
    completeObject.tokenId = insertedId;
    completeObject.token = `${secret}:${insertedId}`;
    completeObject.mongoResult = {
      acknowledged: result.acknowledged,
      insertedId: insertedId
    };

    console.warn('Token created successfully in MongoDB');
    console.warn(`Authentication token: ${secret}:${insertedId}`);
    console.warn(`Generated token ID: ${insertedId}`);

    await client.close();

    if (process.argv.includes('-e')) {
      console.log(JSON.stringify(completeObject, null, 2));
    }
    return completeObject;
  } catch (error) {
    const errorResult = {
      ...completeObject,
      success: false,
      error: error.message,
      savedToDatabase: false
    };

    console.error('Error creating token in MongoDB:', error.message);
    if (process.argv.includes('-e')) {
      console.log(JSON.stringify(errorResult, null, 2));
    }
    return errorResult;
  }
}

/*
 * Generate token in memory only
 */
function generate() {
  const { secret, hashSecret } = generateToken();
  const memoryId = `mem_${Date.now()}`;

  const completeObject = {
    success: true,
    token: `${secret}:${memoryId}`,
    secret,
    hashSecret,
    tokenId: memoryId,
    database: 'none',
    savedToDatabase: false,
    timestamp: new Date().toISOString(),
    note: 'Generated in memory only'
  };

  if (process.argv.includes('-e')) {
    console.log(JSON.stringify(completeObject, null, 2));
  }
  console.warn('Token generated in memory only');
  console.warn(JSON.stringify(completeObject, null, 2));
  return completeObject;
}

module.exports = {
  mongo,
  generate,
};

if (require.main === module) {
  (async () => {
    console.warn('Running createToken directly...');
    console.warn('CLI Usage examples:');
    console.warn('node -e "require(\'./scripts/createToken\').create()"');
    console.warn('node -e "require(\'./scripts/createToken\').generate()"');
    console.warn('');

    const result = await create();
    process.exit(result.success ? 0 : 1);
  })();
}
