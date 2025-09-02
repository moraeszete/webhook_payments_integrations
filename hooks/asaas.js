
module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("asaas_queue")

  const params = {
    event: req.webhookBody.event,
    eventId: req.webhookBody.id,
    // time: req.webhookBody.dateCreated.split(' '),
  };

  try {
    // Check if the event already exists in Redis
    const existingEvent = await global.redis.get(req.path);
    
    if (existingEvent) {
      // Event already exists, return duplicate response
      return res.status(200).json({ error: false, message: "Event received!" });
    }

    // Store the event in Redis with TTL (86400 seconds = 24 hours)
    await global.redis.setJSON(req.path, params);
    await global.redis.expire(req.path, 86400);

    // Insert the event into MongoDB queue
    const insert = await collQueue.insertOne(req.webhookBody);
    
    if (insert.insertedId) {
      return res.status(200).json({ error: false, message: "Event created!" });
    } else {
      throw new Error("Failed to insert event into queue");
    }
    
  } catch (error) {
    console.error("Error processing webhook event:", error.message);
    
    return res.status(500).json({
      error: true,
      message: "Error processing event",
    });
  }
};
