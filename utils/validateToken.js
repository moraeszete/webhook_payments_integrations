const bcrypt = require('bcrypt')
// you can create new token using scripts/createToken.js 
// which will update the token in the database
module.exports = async (tokenValue) => {
  if (!tokenValue) return { error: true, message: "Token não enviado" }

  // the token received from header should be secret:tokenId
  // example: 1234567890abcdef:60c72b2f9b
  const [secret, tokenId] = tokenValue.split(":");
  if (!secret || !tokenId) return { error: true, message: "Token inválido" }

  // this is because the token is stored as hash in the database
  // and the tokenId is the ObjectId of the token
  const collTokens = await global.mongo.collection(process.env.SUPPLIERS_TOKENS);
  const tokenFromDb = await collTokens.findOne(
    { _id: global.mongo.ObjectId(tokenId) },
    { projection: { token: 1 } }
  );

  if (!tokenFromDb) return { error: true, message: "Token não encontrado" }

  try {
    // then if we compare the token in database with the secret received
    // we can check if the token is valid
    const comparedToken = await bcrypt.compare(secret, tokenFromDb.token);
    if (!comparedToken) return { error: true, message: "Token inválido" }
    return { error: false };
  } catch (error) {
    return { error: true, message: "Erro ao comparar token" };
  }
}
