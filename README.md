# Webhook API

A small Node.js + Express + MongoDB REST API for handling incoming webhooks, JWT-based authentication and company webhook configuration.

> 🚧 Personal/portfolio project — production-ready.

## Tech Stack

- Node.js / Express
- MongoDB (native driver)
- JWT (`jsonwebtoken`) + `bcryptjs` for authentication
- `dotenv` for configuration

## Project Structure

```
webhook-api/
├── index.js                # Entry point
├── config/
│   ├── app.js                # Express app setup (CORS, middlewares, router)
│   ├── router.js              # Route definitions
│   └── database.js            # Connects to MongoDB on startup
├── api/
│   ├── user/login.js          # Login endpoint (JWT + cookie)
│   └── company/config.js       # Company webhook configuration
├── middlewares/auth.js        # JWT validation middleware
├── database/mongo.js          # MongoDB connection helper
└── utils/
    ├── tokenGen.js              # JWT generation & verification
    └── timestamps.js            # Date/time helpers
```

## Getting Started

```bash
git clone <repository-url>
cd webhook-api
npm install
```

Create a `.env` file in the project root (never commit real secrets):

```env
PORT=3000
SERVER_MODE=local

SECRET_KEY=change-me
JWT_ALGORITHM=HS256

MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=webhooks_api
```

Run it:

```bash
npm run dev    # development, auto-reload
npm start      # production
```

## API Endpoints

| Method | Route          | Description                    | Auth required |
|--------|----------------|---------------------------------|----------------|
| GET    | `/health`      | Health check                    | No             |
| POST   | `/config/new`  | Register a new webhook config   | Yes            |

## License

MIT — Lucas Silva de Moraes

