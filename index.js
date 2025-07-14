const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config({ path: path.join(__dirname, '.env')})
const configServer = require('./config/configServer')
let server

async function createServer() {
  await configServer()
  const today = new Date()
  const app = require('./config/custom-express')
  let server
  let serverConfigured
  if (global.configs.env === 'local') {
    serverConfigured = 'http'
    app.proxy = true
    server = app.listen(global.configs.serverPort, () => {
      console.log(`Servidor HTTP na porta ${global.configs.serverPort} - ${today}`)
    })
  }
  else {
    serverConfigured = 'https'
    server = require('https').createServer(
      {
        key: fs.readFileSync(path.join(__dirname, `../../certificates/${global.configs.certs.key}`)),
        cert: fs.readFileSync(path.join(__dirname, `../../certificates/${global.configs.certs.cert}`)),
        ca: [
          fs.readFileSync(path.join(__dirname, `../../certificates/${global.configs.certs.caBundle}`)),
          fs.readFileSync(path.join(__dirname, `../../certificates/${global.configs.certs.caCertificateServices}`)),
        ]
      },
      app.callback())
    server.listen(global.configs.serverPort, () => {
      console.log(`Servidor HTTPS na porta: ${global.configs.serverPort}`)
    })
  }
}
createServer()

module.exports = server;