const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { MongoClient, ObjectId } = require('mongodb'); // Importa o MongoDB client

// Configurações do MongoDB
const MONGO_URI = 'mongodb://100.64.92.6:27017';
const DATABASE_NAME = 'webhook';
const COLLECTION_NAME = 'suppliers_tokens';
const tokenId = '67ec16a21b7728c08e42d11f'; //criação prévia

// Função principal
async function createToken(){
  try {
    // Conecta ao MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collTokens = db.collection(COLLECTION_NAME);

    // ID do token a ser atualizado

    // Gera um secret aleatório de no máximo 10 caracteres
    const secret = crypto.randomBytes(5).toString('hex').slice(0, 10);
    const hashSecret = await bcrypt.hash(secret, 8);

    // Atualiza o token no banco de dados
    await collTokens.updateOne(
      { _id: new ObjectId(tokenId) },
      { $set: { token: hashSecret } }
    );

    console.warn(`Token atualizado com sucesso!`);
    console.warn(`Token de autenticação: ${secret}:${tokenId}`);

    // Fecha a conexão com o banco
    await client.close();
    console.warn('Conexão com o MongoDB encerrada');
  } catch (error) {
    console.error('Erro ao atualizar o token:', error.message);
    return;
  }
}

createToken();