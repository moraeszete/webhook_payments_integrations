const token = require('../scripts/createToken');

module.exports = {
  token: async(req, res , next) => {
    return await token.main()
  } 
}