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
const { connect } = require('../database/mongo');

const canCreateInDB = process.env.CREATE_IN_DB === 'true';

// MongoDB environment variables
const MONGO_URI = process.env.MONGO_URI;
const MONG_DATABASE = process.env.MONGO_DATABASE;
const SUPPLIERS_TOKENS = process.env.SUPPLIERS_TOKENS;


/*
 * Generate random token and bcrypt hash
 */
function generateToken() {
  const secret = crypto.randomBytes(5).toString('hex').slice(0, 10);
  const hashSecret = bcrypt.hashSync(secret, 8);
  return { secret, hashSecret };
}

/**
 * Create token and save to mongo, logging results and saving log
 * @returns { object } returns object inserted onde log collection and the token;
 */
async function mongo() {

  const { secret, hashSecret } = generateToken();

  let completeObject = {
    success: !canCreateInDB,
    tokenId: 'PENDING_ID',
    savedToDatabase: false,
    timestamp: new Date().toISOString()
  };

  if (!canCreateInDB) {
    console.warn(`Database creation disabled.`);
    return completeObject;
  }

  // Validate environment variables
  if (!MONGO_URI || !MONG_DATABASE || !SUPPLIERS_TOKENS) {
    const missingVars = [];

    if (!MONGO_URI) missingVars.push('MONGO_URI');
    if (!MONG_DATABASE) missingVars.push('MONGO_DATABASE');
    if (!SUPPLIERS_TOKENS) missingVars.push('SUPPLIERS_TOKENS');

    const errorResult = {
      ...completeObject,
      error: true,
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      missingVariables: missingVars
    };

    console.error('Missing environment variables:', missingVars.join(', '));

    return errorResult;
  }

  try {
    const mongoConnection = await connect(); // use mongo internal utils
    const collTokens = mongoConnection.collection(SUPPLIERS_TOKENS);
    const collLog = mongoConnection.collection(`token_creation_log`);

    // Insert new token document
    const tokenObj = {
      token: hashSecret,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    const result = await collTokens.insertOne(tokenObj);
    let insertedId = result.insertedId.toString();

    // Update complete object with generated ID
    completeObject.success = true;
    completeObject.savedToDatabase = true;
    completeObject.tokenId = insertedId;

    console.warn('Token created successfully in MongoDB');
    console.warn(`Authentication token: ${secret}:${insertedId}`);
    console.warn(`Generated token ID: ${insertedId}`);

    // Insert log for created tokens 
    insertedId = (await collLog.insertOne(completeObject)).insertedId.toString();

    return {
      ...completeObject,
      token: `${secret}:${insertedId}`,
    };
  } catch (error) {
    const errorResult = {
      ...completeObject,
      success: false,
      error: error.message,
      savedToDatabase: false
    };

    console.error('Error creating token in MongoDB:', error.message);

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
    console.warn('node -e "require(\'./scripts/createToken\').mongo()"');
    console.warn('node -e "require(\'./scripts/createToken\').generate()"');
    console.warn('');

    const result = await mongo();
    process.exit(result.success ? 0 : 1);
  })();
}
