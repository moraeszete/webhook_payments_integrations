module.exports = () => {
  global.router.post('/desktop/solicitations/getSolicitations', require('../../../controllers/desktop/solicitations/getSolicitations'))
  global.router.post('/desktop/solicitations/getSolicitationDetails', require('../../../controllers/desktop/solicitations/getSolicitationDetails'))
  global.router.post('/desktop/solicitations/getSolicitationMessages', require('../../../controllers/desktop/solicitations/getSolicitationMessages'))
  global.router.post('/desktop/solicitations/newMessage', require('../../../controllers/desktop/solicitations/newMessage'))
  global.router.post('/desktop/solicitations/changeSolicitationDepartment', require('../../../controllers/desktop/solicitations/changeSolicitationDepartment'))
  global.router.post('/desktop/solicitations/changeSolicitationStatus', require('../../../controllers/desktop/solicitations/changeSolicitationStatus'))
}