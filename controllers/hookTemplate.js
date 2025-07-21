
module.exports = async (ctx) => {
  const collQueue = await global.mongo.collection("queue_name_in_bd")

  const keys = {
    path: ctx.path,
    event: ctx.body.event,
    eventId: ctx.body.id,
    // time:ctx.body.dateCreated.split(' '),
  };

  try {
    // Check if the event already exists then creates if it doesn't
    const existingEvent = await global.redis.parse(keys, ctx.body, 86400); 
    // parse returns {created: true/false, key: string}
    
    if (existingEvent.created === false) {
      // Event already exists, return duplicate response
      ctx.status = 200;
      ctx.body = { error: false, message: "Event received!" };
      return;
    }

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
