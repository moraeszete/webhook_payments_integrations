const validateToken = require("../utils/tokenGen");

/**
 * Authentication middleware for Express
 * Validates tokens from specific headers
 */
module.exports = async (req, res, next) => {
  const splitRoute = req.path.split("/");
  console.log(req.path, "- Rota chamada");

  if (splitRoute[1] === "health") {
    return next()
  }

  const headerIsValid = await validateToken.verifyToken(req.auth.token)
  if (!headerIsValid) {
    return res.status(401).json({
      error: true,
      message: "Token de acesso não fornecido",
    });
  }

  // const validationResult = await validateToken(tokenValue);

  // if (validationResult.error) {
  //   return res.status(401).json({
  //     error: true,
  //     message: "Token de acesso inválido",
  //   });
  // }

  return next();
};
