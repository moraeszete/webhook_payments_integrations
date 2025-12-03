const validateToken = require("../utils/validateToken");
const tokenHeaders = require("./headerTokens");
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

  const headerIsValid = tokenHeaders.find((token) => req.headers[token]);

  if (!headerIsValid) {
    return res.status(401).json({
      error: true,
      message: "Token de acesso não fornecido",
    });
  }

  const tokenValue = req.headers[headerIsValid];
  const validationResult = await validateToken(tokenValue);

  if (validationResult.error) {
    return res.status(401).json({
      error: true,
      message: "Token de acesso inválido",
    });
  }

  return next();
};
