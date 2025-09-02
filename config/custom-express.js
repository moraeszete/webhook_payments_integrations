const express = require("express");
const corsMiddleware = require("../middleware/cors");
const authMiddleware = require("../middleware/auth");

// Import hooks
const asaasHook = require("../hooks/asaas");
const stripeHook = require("../hooks/stripe");

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication middleware
app.use(authMiddleware);

// Routes
app.post('/asaas', asaasHook);
app.post('/stripe', stripeHook);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Webhook server is running' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: true,
    message: "Internal server error"
  });
});

module.exports = app;
