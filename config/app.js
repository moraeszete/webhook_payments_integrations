const express = require('express');
const cors = require('cors');
const authMiddleware = require('../middleware/auth');

const app = express();

// Apply CORS 
app.use(cors(
  {
    origin: '*',
    methods: ['POST'],
    credentials: true
  }
));

// Parse JSON bodies
app.use(express.json());

// Apply authentication middleware
app.use(authMiddleware);

// Import hooks
const asaasHook = require('../hooks/asaas');
const stripeHook = require('../hooks/stripe');

// Routes
app.post('/asaas', asaasHook);
app.post('/stripe', stripeHook);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Webhook server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
