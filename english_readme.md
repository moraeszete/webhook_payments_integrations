# Webhook Payments Integration System

Payment webhook processing system with **Node.js** and **MongoDB**. Developed to process webhooks from **Asaas**, **Stripe**, and other providers with idempotency guarantee and high performance using MongoDB TTL.

## 🚀 Features

- **✅ Webhook Processing**: Receives and processes payment webhooks
- **🔒 Authentication System**: Access token validation
- **⚡ Idempotency**: Prevents duplicate processing using MongoDB TTL
- **📊 Persistence**: Stores events in MongoDB for asynchronous processing
- **🛡️ Security**: Token validation and required headers
- **📈 Health Check**: System health monitoring

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd webhook-template

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit the .env file with your settings
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=webhooks

# Tokens (Automatically generated)
ASAAS_ACCESS_TOKEN=
STRIPE_ACCESS_TOKEN=
```

## 🔑 Token Management

The system includes automated scripts for token creation and management:

### Available Scripts

```bash
# Token generation (MongoDB or memory, based on configuration)
npm run token
```

### How the Script Works

The `npm run token` script automatically:
- Creates the token in **MongoDB** if `CREATE_IN_DB=true` in `.env`
- Generates the token in **memory only** if `CREATE_IN_DB=false` or not defined

For programmatic usage:
```javascript
const tokenModule = require('./scripts/createToken');
await tokenModule.main();      // Follows CREATE_IN_DB configuration
await tokenModule.mongo();     // Forces MongoDB creation
const token = tokenModule.generate(); // Memory only
```

> **📌 Note**: For SQL database support and auto-detection, check the [previous version of the token generator](https://github.com/moraeszete/webhook_payments_integrations/tree/09b696b169f892be404adb3cc102ec2c83d7bfea) which includes `token:auto` and `token:sql` functions with complete documentation.

## 🎯 How to Use

### 1. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 2. Available Endpoints

#### **POST /asaas**
Receives webhooks from Asaas
```bash
curl -X POST http://localhost:3000/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: your-token-here" \
  -d '{"event": "PAYMENT_RECEIVED", "id": "evt_123", "data": {...}}'
```

#### **POST /stripe**  
Receives webhooks from Stripe
```bash
curl -X POST http://localhost:3000/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-access-token: your-token-here" \
  -d '{"type": "payment_intent.succeeded", "id": "evt_456", "data": {...}}'
```

#### **GET /health**
Checks system health
```bash
curl http://localhost:3000/health
# Response: {"status": "ok", "message": "Webhook server is running", "timestamp": "..."}
```

## 🔄 Processing Flow

1. **Reception**: Webhook arrives at the appropriate endpoint
2. **Authentication**: Validates token in request header
3. **Idempotency**: Checks in MongoDB TTL if the event has already been processed
4. **Persistence**: Saves event in MongoDB queue for processing
5. **Response**: Returns reception confirmation

## 🏗️ Project Structure

```
webhook-template/
├── 📄 index.js                 # Server entry point
├── 📄 package.json             # Dependencies and npm scripts
│
├── 📂 config/                  # Configurations
│   ├── database.js             # Database connections
│   └── app.js                  # Express configuration
│
├── 📂 hooks/                   # Webhook processors
│   ├── asaas.js                # Asaas logic
│   ├── stripe.js               # Stripe logic
│   └── template.js             # Template for new providers
│
├── 📂 middleware/              # Express middlewares
│   ├── auth.js                 # Authentication
│   └── cors.js                 # CORS
│
├── 📂 utils/                   # Utilities
│   ├── validateToken.js        # Token validation
│   └── timestamps.js           # Timestamp generation
│
├── 📂 database/                # Database connections
│   └── mongo.js                # MongoDB
│
└── 📂 scripts/                 # Automation scripts
    └── createToken.js          # Token generation
```

## 🔧 Adding New Providers

1. **Create new hook** in `hooks/new-provider.js`:
```javascript
module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("new_provider_queue");
  
  const eventData = {
    event: req.body.type,
    eventId: req.body.id,
    timestamp: new Date()
  };

  try {
    // Check idempotency with MongoDB TTL
    const result = await global.idempotency.parse(
      {
        path: req.path,
        event: eventData.event,
        eventId: eventData.eventId
      },
      req.body,
      86400 // TTL 24 hours
    );

    if (!result.created) {
      return res.status(200).json({ 
        error: false, 
        message: "Event already processed" 
      });
    }

    // Save to MongoDB queue
    const insert = await collQueue.insertOne(req.body);
    
    if (insert.insertedId) {
      res.status(200).json({ 
        error: false, 
        message: "Event created!" 
      });
    } else {
      throw new Error("Failed to insert event");
    }
    
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).json({
      error: true,
      message: "Error processing event"
    });
  }
};
```

2. **Add route** in `config/app.js`:
```javascript
const newProviderHook = require('../hooks/new-provider');
app.post('/new-provider', newProviderHook);
```

3. **Configure authentication** in `middleware/auth.js`:
```javascript
const tokenHeaders = [
  "asaas-access-token",
  "stripe-access-token", 
  "new-provider-access-token"  // Add here
];
```

## 📋 Development Scripts

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run in production  
npm start

# Generate token automatically
npm run token

# Check syntax
node -c index.js

# View logs in real-time (if using PM2)
pm2 logs
```

## 🔍 Troubleshooting

### Common Issues

**MongoDB connection error:**
- Check if MongoDB is running
- Confirm the URL in the `.env` file

**Invalid token:**
- Run `npm run token:create` to generate new tokens
- Verify if the token is correct in the request header

**Duplicate webhook:**
- Expected behavior! The system automatically prevents duplication

---

**🎉 System ready to process webhooks with high performance and reliability using MongoDB TTL!**

**Documentation made by Sonnet 4.5 and reviewed by Me**
