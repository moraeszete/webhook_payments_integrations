const bcrypt = require('bcrypt');


module.exports = async (tokenValue) => {
  if (!tokenValue) {
    return { error: true, message: "Token não enviado" };
  }

  // Divide o token em hash e tokenId
  const [secret, tokenId] = tokenValue.split(":");
  if (!secret || !tokenId) {
    return { error: true, message: "Token inválido" };
  }

  // Busca o token no banco de dados
  const collTokens = await global.mongo.config(process.env.SUPPPLIERS_TOKENS);
  const tokenFromDb = await collTokens.findOne(
    { _id: global.mongo.ObjectId(tokenId) },
    { projection: { token: 1 } }
  );

  if (!tokenFromDb) return { error: true, message: "Token não encontrado" }

  try {
    const comparedToken = await bcrypt.compare(secret, tokenFromDb.token);
    if (!comparedToken) return { error: true, message: "Token inválido" }
    return { error: false };
  } catch (error) {
    return { error: true, message: "Erro ao comparar token" };    
  }

};
