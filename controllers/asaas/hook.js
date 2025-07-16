
module.exports = async (ctx) => {
  console.time("Start");
  const collQueue = await global.mongo.collection("asaas_queue")

  const params = {
    event: ctx.body.event,
    eventId: ctx.body.id,
    // time:ctx.body.dateCreated.split(' '),
  };
  const parseKey = await global.redis.parseKey(
    ctx.path,
    params,
    86400,
    ctx.body
  );

  if (parseKey.error) {
    console.timeEnd("Start");

    ctx.status = 400;
    ctx.body = {
      error: true,
      message: "Error on receiving event", 
    };
  } else if(!parseKey.error){
    if (parseKey.keyValue) {
      console.timeEnd("Start");
      ctx.status = 200;
      ctx.body = { error: false, message: "Event received!" };

      return;
    } else if (parseKey.created) {
      try {
        const insert = await collQueue.insertOne(ctx.body)
        if(insert.insertedId){
          console.timeEnd("Start");

          ctx.status = 200;
          ctx.body = { error: false, message: "Event created!" };
          return
        }
      } catch (error) {
        console.error("Error inserting event in queue:", error.message);
        console.timeEnd("Start");

        ctx.status = 500;
        ctx.body = {
          error: true,
          message: "Error inserting event in queue",
        };   
        return   
      }
    }
  }

};
