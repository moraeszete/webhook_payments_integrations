
module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("asaas_queue")

  try {
    let eventData = {
      event: req.body.event,
      eventId: req.body.id,
      path: req.path
    };
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
      idempotencyKey: idempotencyResult.key
    });
    
    if (insert.insertedId) {
      return res.status(200).json({ 
        error: false, 
        message: "Event created successfully!",
        eventId: insert.insertedId
      });
    } else {
      throw new Error("Failed to insert event into queue");
    }
    
  } catch (error) {
    console.error("Error processing Asaas webhook:", error.message);
    
    return res.status(500).json({
      error: true,
      message: "Error processing event",
      details: error.message
    });
  }
};
