require('dotenv').config();

const database = require('./config/database')

// Importing the Express app configuration
async function main() {
  await database()
  const app = require('./config/app')

  const port = process.env.PORT || 3000

  app.listen(port, () => {
    console.log(`Running on: ${port}`)
    console.log(`Health check: http://localhost:${port}/health`)
  })
}

main().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
});