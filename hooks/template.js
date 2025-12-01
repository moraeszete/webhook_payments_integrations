
/**
 * Generic webhook template
 * Use this as a starting point for new webhook providers
 */

module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("generic_queue"); // Change collection name as needed

  try {
    let eventData = {
      path: req.path,
      event: req.body.event || req.body.type, // Adapt to provider's event field
      eventId: req.body.id
    }
    // Check idempotency using MongoDB TTL
    const idempotencyResult = await global.idempotency.parse(
      eventData,
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
      idempotencyKey: idempotencyResult.key,
      provider: "generic" // Change this to your provider name
    });

    if (insert.insertedId) {
      return res.status(200).json({
        error: false,
        message: "Event processed successfully!",
        eventId: insert.insertedId
      });
    } else {
      throw new Error("Failed to insert event into queue");
    }

  } catch (error) {
    console.error("Error processing webhook event:", error.message);

    return res.status(500).json({
      error: true,
      message: "Error processing event",
      details: error.message
    });
  }
};
