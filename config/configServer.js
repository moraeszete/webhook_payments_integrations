const projectServerId = '67eac4b628943ca765bf6392'

const fetch = require('node-fetch')

const getServerConfigs = require('../functions/getServiceConfigs')

async function connectMongo () {
  const mongo = require('../database/mongo')
  global.mongo = mongo
}

async function connectRedis (){
  const redis = require('../database/redis.js')
  global.redis = redis
}

// async function connectSql () {
//   const sql = require('../database/executeQuery')
//   global.sql = sql
// }

async function getTimestamps () {
  const timestamps = require('../functions/createTimestamps')
  global.timestamps = timestamps
}

// function initNotifications () {
//   const init = require('../controllers/notifications/initialize.js')
//   init()
// }

// function newRequisitionLog () {
//   const newRequisitionLog = require('../functions/newRequisitionLog')
//   global.newRequisitionLog = newRequisitionLog
// }

// function sendTwilioMessage (){
//   const sendTwilioMessage = require('../functions/sendTwilioMessage.js')
//   global.sendTwilioMessage = sendTwilioMessage
// }

const process = require('node:process');


module.exports = async (opt) => {
  // process.on('uncaughtException', function (error, origin) {
  //   const body = {
  //     error: {
  //       name: error.name,
  //       message: error.message,
  //     },
  //     origin,
  //     projectServerId,
  //     env: global.configs.env
  //   }

  //   const optFetch = {
  //     method: 'POST',
  //     body: JSON.stringify(body),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     }
  //   }
  //   const url = 'https://api18.b3dev.dev:8001/public/newErrorFromServers'
  //   fetch(url, optFetch);
  //   console.log('Caught exception: ' + error);
  //   console.log(origin, 'origem')
  // });

  await getServerConfigs({ projectServerId })
  await getTimestamps()
  await connectMongo()
  await connectRedis()
  // await connectSql()
  // newRequisitionLog()
  // sendTwilioMessage()
  // initNotifications()

}