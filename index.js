const path = require('path')
// This file is part of the Webhook Template project.
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '.env') })
const fs = require('fs')
let server;

( async() => {
  const app = require('./config/custom-express')

  if (process.env.SERVER_MODE === 'local') {
    app.proxy = true
    server = app.listen(process.env.PORT, () => {
      console.log(`Servidor HTTP na porta ${process.env.configs.PORT} - ${new Date().toLocaleDateString()}`)
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
}) ()

module.exports = server;