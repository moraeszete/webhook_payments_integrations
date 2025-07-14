
module.exports = async (ctx) => {
  const collRequisitionsLogs = await global.mongo.config(process.env.REQUISITIONS_LOGS);

  collRequisitionsLogs.insertOne({
    createdAt: await global.timestamps.create(),
    body: ctx.body,
    headers: ctx.headers,
    path: ctx.path,
    port: global.serverPort
  })
  return
}
