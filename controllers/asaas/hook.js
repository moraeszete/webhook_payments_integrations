
module.exports = async (ctx) => {
  const collQueue = await global.mongo.collection("asaas_queue")

  const params = {
    event: ctx.body.event,
    eventId: ctx.body.id,
    // time:ctx.body.dateCreated.split(' '),
  };

  try {
    // Check if the event already exists in Redis
    const existingEvent = await global.redis.get(ctx.path);
    
    if (existingEvent) {
      // Event already exists, return duplicate response
      ctx.status = 200;
      ctx.body = { error: false, message: "Event received!" };
      return;
    }

    // Store the event in Redis with TTL (86400 seconds = 24 hours)
    await global.redis.setJSON(ctx.path, params);
    await global.redis.expire(ctx.path, 86400);

    // Insert the event into MongoDB queue
    const insert = await collQueue.insertOne(ctx.body);
    
    if (insert.insertedId) {
      ctx.status = 200;
      ctx.body = { error: false, message: "Event created!" };
      return;
    } else {
      throw new Error("Failed to insert event into queue");
    }
    
  } catch (error) {
    console.error("Error processing webhook event:", error.message);
    
    ctx.status = 500;
    ctx.body = {
      error: true,
      message: "Error processing event",
    };
    return;
  }
};
