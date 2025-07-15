const path = require('path')
// This file is part of the Webhook Template project.
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '.env') })
const fs = require('fs')
let server;

const configServer = require('./config/configServer')
// Importing the custom express configuration
async function main() {
  await configServer()
  const app = require('./config/custom-express')

  if (process.env.NODE_ENV === 'local') {
    app.proxy = true
    server = app.listen(process.env.PORT, () => {
      console.log(`Servidor HTTP na porta ${process.env.PORT} - ${new Date()}`)
    })
    return
  }
  server = require('https').createServer(
    {
      key: fs.readFileSync(path.join(__dirname, `../../certificates/${process.env.CERTS.KEY}`)),
      cert: fs.readFileSync(path.join(__dirname, `../../certificates/${process.env.CERTS.CERTIFICATION}`)),
      ca: [
        fs.readFileSync(path.join(__dirname, `../../certificates/${process.env.CERTS.CABUNDLE}`)),
        fs.readFileSync(path.join(__dirname, `../../certificates/${process.env.CERTS.CACERTIFICATESERVICES}`)),
      ]
    },
    app.callback())
  server.listen(process.env.PORT, () => {
    console.log(`Servidor HTTPS na porta: ${process.env.PORT}`)
  })
}

main()

module.exports = server;