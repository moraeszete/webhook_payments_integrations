/**
 * Idempotency utility using MongoDB TTL (Time To Live)
 * Replaces Redis functionality for webhook deduplication
 */

/**
 * Check if an event already exists (idempotency check) and create if not
 * @param {Object} keys - Object with path, event, eventId
 * @param {Object} payload - The webhook payload
 * @param {number} ttl - Time to live in seconds (default: 86400 = 24 hours)
 * @returns {Object} { created: boolean, key: string, value?: any }
 */
async function parseEvent(keys, payload, ttl = 86400) {
  try {
    const idempotencyCollection = await global.mongo.collection("idempotency_keys");
    
    // Create unique key from the provided keys
    const keyParts = [];
    if (keys.path) keyParts.push(`path_${keys.path.replace('/', '')}`);
    if (keys.event) keyParts.push(`event_${keys.event}`);
    if (keys.eventId) keyParts.push(`eventId_${keys.eventId}`);
    
    const uniqueKey = keyParts.join(':');
    
    // Try to insert the document with unique key
    const document = {
      key: uniqueKey,
      payload: payload,
      createdAt: new Date(), // TTL index will use this field
      expiresAt: new Date(Date.now() + ttl * 1000)
    };
    
    try {
      await idempotencyCollection.insertOne(document);
      
      // Successfully inserted - event is new
      return {
        created: true,
        key: uniqueKey,
        value: payload
      };
      
    } catch (error) {
      // Check if it's a duplicate key error (event already exists)
      if (error.code === 11000) {
        // Event already exists - return existing data
        const existingDoc = await idempotencyCollection.findOne({ key: uniqueKey });
        
        return {
          created: false,
          key: uniqueKey,
          value: existingDoc ? existingDoc.payload : null
        };
      }
      
      // Other error - rethrow
      throw error;
    }
    
  } catch (error) {
    console.error("Error in parseEvent:", error);
    throw new Error(`Idempotency check failed: ${error.message}`);
  }
}

/**
 * Initialize TTL indexes for idempotency collection
 * Should be called once when the application starts
 */
async function initializeIdempotencyIndexes() {
  try {
    const idempotencyCollection = await global.mongo.collection("idempotency_keys");
    
    // Create TTL index on createdAt field (expires documents after TTL)
    await idempotencyCollection.createIndex(
      { "createdAt": 1 }, 
      { expireAfterSeconds: 86400 } // 24 hours default
    );
    
    // Create unique index on key field to prevent duplicates
    await idempotencyCollection.createIndex(
      { "key": 1 }, 
      { unique: true }
    );
    
    console.log("✅ Idempotency indexes initialized successfully");
    
  } catch (error) {
    // Index might already exist, which is fine
    if (error.code !== 85) { // Index already exists error code
      console.error("Error initializing idempotency indexes:", error);
    }
  }
}

module.exports = {
  parse: parseEvent,
  initialize: initializeIdempotencyIndexes
};
