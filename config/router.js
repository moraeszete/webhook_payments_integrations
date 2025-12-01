const { Router } = require("express")
const router = Router()

// Import hooks
const asaasHook = require("../hooks/asaas");
const stripeHook = require("../hooks/stripe");

// Routes
router.post('/asaas', asaasHook);
router.post('/stripe', stripeHook);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Webhook server is running'
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
    path: req.path
  });
});

// Error handler
router.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: true,
    message: "Internal server error"
  });
});

module.exports = router