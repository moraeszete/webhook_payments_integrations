const cors = require('cors');

/**
 * CORS configuration for Express
 */
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'asaas-access-token', 'stripe-access-token'],
  credentials: true
};

module.exports = cors(corsOptions);
