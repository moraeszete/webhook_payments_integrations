//@ts-check
// Token Creation Module
// 
// Auto-detects database type based on environment variables and creates authentication tokens.
// Supports MongoDB, SQL (future), and in-memory generation.
//
// Usage:
//   const createToken = require('./scripts/createToken');
//   await createToken.auto();        // Auto-detect database
//   await createToken.mongo();       // Force MongoDB
//   await createToken.sql();         // Force SQL
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

// SQL environment variables
const SQL_HOST = process.env.SQL_HOST;
const SQL_DATABASE = process.env.SQL_DATABASE;
const SQL_USER = process.env.SQL_USERNAME;
const SQL_PASSWORD = process.env.SQL_PWD;
/**
  Auto-detect database type based on environment variables
 */
function detectDatabaseType() {
  const hasMongoVars = MONGO_URI && DATABASE_NAME && COLLECTION_NAME;
  const hasSqlVars = SQL_HOST && SQL_DATABASE && SQL_USER && SQL_PASSWORD;
  
  // Prefer MongoDB if both are available
  if (hasMongoVars && hasSqlVars) {
    return 'mongo'; // Prefer MongoDB if both available
  } else if (hasMongoVars) {
    return 'mongo';
  } else if (hasSqlVars) {
    return 'sql';
  } else {
    return 'none';
  }
}

/**
  Generate random token and bcrypt hash
 */
function generateToken() {
  const secret = crypto.randomBytes(5).toString('hex').slice(0, 10);
  const hashSecret = bcrypt.hashSync(secret, 8);
  return { secret, hashSecret };
}

/**
  Create token for MongoDB
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
    if (process.argv.includes('-e')) {
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

/**
  Create token for SQL databases
 */
async function sql() {
  const { secret, hashSecret } = generateToken();

  const completeObject = {
    success: !canCreateInDB,
    token: `${secret}:PENDING_ID`,
    secret,
    hashSecret,
    tokenId: 'PENDING_ID',
    database: 'SQL',
    savedToDatabase: false,
    timestamp: new Date().toISOString()
  };

  if (!canCreateInDB) {
    console.warn('Database creation disabled.');
    if (process.argv.includes('-e')) {
      console.log(JSON.stringify(completeObject, null, 2));
    }
    return completeObject;
  }

  // Validate environment variables
  if (!SQL_HOST || !SQL_DATABASE || !SQL_USER || !SQL_PASSWORD) {
    const missingVars = [];
    if (!SQL_HOST) missingVars.push('SQL_HOST');
    if (!SQL_DATABASE) missingVars.push('SQL_DATABASE');
    if (!SQL_USER) missingVars.push('SQL_USER');
    if (!SQL_PASSWORD) missingVars.push('SQL_PASSWORD');

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
    const mysql = require('promise-mysql');
    
    // Create database connection
    const connection = await mysql.createConnection({
      host: SQL_HOST,
      database: SQL_DATABASE,
      user: SQL_USER,
      password: SQL_PASSWORD,
      timezone: 'UTC'
    });

    // Create suppliers_tokens table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS suppliers_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT TRUE,
        INDEX idx_token (token),
        INDEX idx_active (active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);

    // Insert new token record
    const insertQuery = `
      INSERT INTO suppliers_tokens (token, created_at, updated_at, active)
      VALUES (?, NOW(), NOW(), TRUE)
    `;

    const result = await connection.query(insertQuery, [hashSecret]);
    const insertedId = result.insertId.toString();

    // Update complete object with generated ID
    completeObject.success = true;
    completeObject.savedToDatabase = true;
    completeObject.tokenId = insertedId;
    completeObject.token = `${secret}:${insertedId}`;
    completeObject.sqlResult = {
      affectedRows: result.affectedRows,
      insertId: insertedId
    };

    console.warn('Token created successfully in SQL database');
    console.warn(`Authentication token: ${secret}:${insertedId}`);
    console.warn(`Generated token ID: ${insertedId}`);

    await connection.end();

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

    console.error('Error creating token in SQL database:', error.message);
    if (process.argv.includes('-e')) {
      console.log(JSON.stringify(errorResult, null, 2));
    }
    return errorResult;
  }
}

/**
  Generate token in memory only
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

/**
  Auto-detect database and create token
 */
async function auto() {
  const dbType = detectDatabaseType();

  switch (dbType) {
    case 'mongo':
      console.warn('Auto-detected: MongoDB');
      return await mongo();
    case 'sql':
      console.warn('Auto-detected: SQL');
      return await sql();
    default:
      console.warn('Auto-detected: No database (generate only)');
      return generate();
  }
}

module.exports = {
  mongo,
  sql,
  generate,
  auto,
  detectDatabaseType
};

if (require.main === module) {
  (async () => {
    console.warn('Running createToken directly...');
    console.warn('CLI Usage examples:');
    console.warn('node -e "require(\'./scripts/createToken\').auto()"');
    console.warn('node -e "require(\'./scripts/createToken\').mongo()"');
    console.warn('node -e "require(\'./scripts/createToken\').sql()"');
    console.warn('node -e "require(\'./scripts/createToken\').generate()"');
    console.warn('');

    const result = await auto();
    process.exit(result.success ? 0 : 1);
  })();
}
