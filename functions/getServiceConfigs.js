const fetch = require('node-fetch')
// const CryptoJS = require("crypto-js");

module.exports = async (serverConfig) => {

  const body = {
    serverConfig,
    env: process.env
  }
  
  const optFetch = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    }
  }
  const url = 'https://api18.b3dev.dev:8001/public/getServerConfigs'
  // const url = 'http://localhost:8001/public/getServerConfigs'
  const responseFetch = await fetch(url, optFetch);
  const resJson = await responseFetch.json()
  // resJson.data.mySql.password = CryptoJS.AES.decrypt(resJson.data.mySql.password, resJson.data.c.substring(0, 6)).toString(CryptoJS.enc.Utf8)
  global.configs = resJson.data
  console.log(global.configs, 'global configs')
  return
}