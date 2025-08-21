const path = require('path')
// This file is part of the Webhook Template project.
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '.env') })
let server;

const configdbs = require('./config/configdbs')
// Importing the custom express configuration
async function main() {
  await configdbs()
  const app = require('./config/custom-express')

  app.listen(process.env.PORT, () => {
    console.log(`Server is on port: ${process.env.PORT}`)
  })
}

main()

module.exports = server;