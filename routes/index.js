const Router = require('@koa/router');
const router = new Router();

// importing routes
const asaas = require('../controllers/asaas/hook.js');
const stripe = require('../controllers/stripe/hook.js');

// setting up routes
router.post('/asaas', asaas);
router.post('/stripe', stripe);

// Make router globally available (maintaining compatibility)
global.router = router;

module.exports = router;