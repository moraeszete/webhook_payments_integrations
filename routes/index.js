const Router = require('@koa/router');
global.router = new Router()

// require('./files/payments')()
// require('./files/desktop/social')()
// require('./files/desktop/solicitations')()
// require('./files/desktop/pedagogical')()
// require('./files/desktop/reports')()
// require('./files/notifications')()
// require('./files/scripts')()

global.router.post('/asaas', require('../controllers/asaas/hookTreatment'))

module.exports = global.router