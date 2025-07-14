const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config({ path: path.join(__dirname, '.env')})

const myFetch = require('./functions/myFetch')

let server

const serverType = 'http'

async function readVariablesFromJson () {
  let rawdata = fs.readFileSync(path.join(__dirname, '../node_variables.json'))
  let configs = JSON.parse(rawdata)
  global.configs = configs
  //console.log(global.configs)
  return
}

async function connectMongo () {
  const mongo = require('./database/mongo')
  global.mongo = mongo
}

async function connectSql () {
  const sql = require('./database/executeQuery')
  global.sql = sql
}

async function getTimestamps () {
  const timestamps = require('./functions/createTimestamps')
  global.timestamps = timestamps
}

// async function runScript () {
//   let qry = `
//     SELECT 
//       _id user_id
//       , uc.company_id companyId
//     FROM users u
//     JOIN users_companies uc ON u.id = uc.user_id
//   `
//   const usersSql = await global.sql.query(qry)
  
//   //console.log(usersSql, 'asijod')
  
//   for (let i = 0; i < usersSql.length; i++) {
//     let user = usersSql[i]
//     let qry = {
//       userId: user.user_id,
//       companyId: user.companyId,
//       isActive: 1,
//       createdAt: await global.timestamps.create()
//     }
//     const collUsersCompanies = await global.mongo.config(process.env.USERS_COMPANIES)
//     await collUsersCompanies.insertOne(qry)
//   }
// }

async function execute() {
  await readVariablesFromJson()
  await getTimestamps()
  await connectMongo()
  await connectSql()
  //console.log('aaa')

  // setTimeout(runScript, 5000)
}
execute()

module.exports = server;