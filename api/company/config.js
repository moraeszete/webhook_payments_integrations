module.exports = async(req, res) => {
  // buscar na req.auth.companyId id do usuario se for company ou main
  const auth = req.auth
  // chega do body alguma configs para o wbhook 
  const {
    nome 
    , pathFinal // para o webhook
    , tipo // webhook ou outro
    , detalhes // json com detalhes do webhook 
  } = req.body;


  // verifica o que for preciso para escrever no config do servidor que vai ficar esperando 
  // ele conecta via sssh e escreve o arquivo de config la no nginx

  await configNewWebhook(configs);

  return res.json({
    error: false,
    message: 'Configuração criada com sucesso!'
  });
}