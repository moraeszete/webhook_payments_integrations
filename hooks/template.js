
module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("queue_name_in_bd")

  const keys = {
    path: req.path,
    event: req.webhookBody.event,
    eventId: req.webhookBody.id,
    // time: req.webhookBody.dateCreated.split(' '),
  };

  try {
    // Check if the event already exists then creates if it doesn't
    const existingEvent = await global.redis.parse(keys, req.webhookBody, 86400); 
    // parse returns {created: true/false, key: string}
    
    if (existingEvent.created === false) {
      // Event already exists, return duplicate response
      return res.status(200).json({ error: false, message: "Event received!" });
    }

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
