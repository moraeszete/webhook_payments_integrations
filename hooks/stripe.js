/**
 * Stripe webhook processor
 * This file is part of the Webhook Template project.
 */

module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("stripe_queue");

  try {
    // Check idempotency using MongoDB TTL
    const idempotencyResult = await global.idempotency.parse(
      {
        path: req.path,
        event: req.body.type,
        eventId: req.body.id
      },
      req.body,
      86400 // TTL: 24 hours
    );
    
    if (!idempotencyResult.created) {
      // Event already processed - return success response
      return res.status(200).json({ 
        error: false, 
        message: "Event already processed (idempotent)" 
      });
    }

    // Insert the event into MongoDB queue
    const insert = await collQueue.insertOne({
      ...req.body,
      processedAt: new Date(),
      idempotencyKey: idempotencyResult.key
    });
    
    if (insert.insertedId) {
      return res.status(200).json({ 
        error: false, 
        message: "Stripe event processed successfully!",
        eventId: insert.insertedId
      });
    } else {
      throw new Error("Failed to insert Stripe event into queue");
    }
    
  } catch (error) {
    console.error("Error processing Stripe webhook:", error.message);
    
    return res.status(500).json({
      error: true,
      message: "Error processing Stripe event",
      details: error.message
    });
  }
};