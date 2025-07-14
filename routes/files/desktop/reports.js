module.exports = () => {
  global.router.post('/desktop/reports/getChildrenReportByUserId', require('../../../controllers/desktop/reports/getChildrenReportByUserId'))
  global.router.post('/desktop/reports/getReportsList', require('../../../controllers/desktop/reports/getReportsList'))
  global.router.post('/desktop/reports/createNewReportTicket', require('../../../controllers/desktop/reports/createNewReportTicket'))
}