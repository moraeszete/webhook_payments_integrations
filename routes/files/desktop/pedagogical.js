module.exports = () => {
  global.router.post('/desktop/pedagogical/createNewPedagogicalRegister', require('../../../controllers/desktop/pedagogical/createNewPedagogicalRegister'))
  global.router.post('/desktop/pedagogical/getRegisterList', require('../../../controllers/desktop/pedagogical/getRegisterList'))
  global.router.post('/desktop/pedagogical/inactiveRegister', require('../../../controllers/desktop/pedagogical/inactiveRegister'))
  global.router.post('/desktop/pedagogical/getMedicineInSchool', require('../../../controllers/desktop/pedagogical/getMedicineInSchool'))
  global.router.post('/desktop/pedagogical/inactiveMedicine', require('../../../controllers/desktop/pedagogical/inactiveMedicine'))
  global.router.post('/desktop/pedagogical/getRegisterDetailById', require('../../../controllers/desktop/pedagogical/getRegisterDetailById'))
  global.router.post('/desktop/pedagogical/getMedicineDetailById', require('../../../controllers/desktop/pedagogical/getMedicineDetailById'))
  global.router.post('/desktop/pedagogical/updateMedicineData', require('../../../controllers/desktop/pedagogical/updateMedicineData'))
  global.router.post('/desktop/pedagogical/updateRegisterData', require('../../../controllers/desktop/pedagogical/updateRegisterData'))
  global.router.post('/desktop/pedagogical/newChildMedicine', require('../../../controllers/desktop/pedagogical/newChildMedicine'))
}