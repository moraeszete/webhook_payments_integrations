# Webhook Payments Integration System

Sistema de processamento de webhooks para plataformas de pagamento com **Node.js** e **MongoDB**. Desenvolvido para processar webhooks do **Asaas**, **Stripe** e outros provedores com garantia de idempotência e alta performance usando MongoDB TTL.

## 🚀 Funcionalidades

- **✅ Processamento de Webhooks**: Recebe e processa webhooks de pagamento
- **🔒 Sistema de Autenticação**: Validação por tokens de acesso
- **⚡ Idempotência**: Previne processamento duplicado usando MongoDB TTL
- **📊 Persistência**: Armazena eventos no MongoDB para processamento assíncrono
- **🛡️ Segurança**: Validação de tokens e headers obrigatórios
- **📈 Health Check**: Monitoramento da saúde do sistema

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd webhook-template

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```env
# Servidor
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=webhooks

# Tokens (Gerados automaticamente)
ASAAS_ACCESS_TOKEN=
STRIPE_ACCESS_TOKEN=
```

## 🔑 Gerenciamento de Tokens

O sistema inclui scripts automatizados para criação e gerenciamento de tokens:

### Scripts Disponíveis

```bash
# Geração automática de token (detecta o banco configurado)
npm run token:create

# Apenas gera token em memória (sem salvar)
npm run token:generate
```

### Como Funcionam os Scripts

1. **token:create** - Criação do token no MongoDB (cria collection "tokens" se não existir)
2. **token:generate** - Gera um token UUID e exibe no console (útil para testes)

> **📌 Nota**: Para suporte a bancos SQL e auto-detecção de banco, consulte a [versão anterior do gerador de tokens](https://github.com/moraeszete/webhook_payments_integrations/tree/09b696b169f892be404adb3cc102ec2c83d7bfea) que inclui funções `token:auto` e `token:sql` com documentação completa.

## 🎯 Como Usar

### 1. Iniciar o Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

### 2. Endpoints Disponíveis

#### **POST /asaas**
Recebe webhooks do Asaas
```bash
curl -X POST http://localhost:3000/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: seu-token-aqui" \
  -d '{"event": "PAYMENT_RECEIVED", "id": "evt_123", "data": {...}}'
```

#### **POST /stripe**  
Recebe webhooks do Stripe
```bash
curl -X POST http://localhost:3000/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-access-token: seu-token-aqui" \
  -d '{"type": "payment_intent.succeeded", "id": "evt_456", "data": {...}}'
```

#### **GET /health**
Verifica a saúde do sistema
```bash
curl http://localhost:3000/health
# Resposta: {"status": "ok", "message": "Webhook server is running", "timestamp": "..."}
```

## 🔄 Fluxo de Processamento

1. **Recebimento**: Webhook chega no endpoint apropriado
2. **Autenticação**: Valida token no header da requisição
3. **Idempotência**: Verifica no MongoDB TTL se o evento já foi processado
4. **Persistência**: Salva evento na fila do MongoDB para processamento
5. **Resposta**: Retorna confirmação de recebimento

## 🏗️ Estrutura do Projeto

```
webhook-template/
├── 📄 index.js                 # Ponto de entrada do servidor
├── 📄 package.json             # Dependências e scripts npm
│
├── 📂 config/                  # Configurações
│   ├── database.js             # Conexões com bancos de dados
│   └── app.js                  # Configuração do Express
│
├── 📂 hooks/                   # Processadores de webhook
│   ├── asaas.js                # Lógica do Asaas
│   ├── stripe.js               # Lógica do Stripe
│   └── template.js             # Template para novos provedores
│
├── 📂 middleware/              # Middlewares do Express
│   ├── auth.js                 # Autenticação
│   └── cors.js                 # CORS
│
├── 📂 utils/                   # Utilitários
│   ├── validateToken.js        # Validação de tokens
│   └── timestamps.js           # Geração de timestamps
│
├── 📂 database/                # Conexões com bancos
│   └── mongo.js                # MongoDB
│
└── 📂 scripts/                 # Scripts de automação
    └── createToken.js          # Geração de tokens
```

## 🔧 Adicionando Novos Provedores

1. **Criar novo hook** em `hooks/novo-provedor.js`:
```javascript
module.exports = async (req, res) => {
  const collQueue = await global.mongo.collection("novo_provedor_queue");
  
  const eventData = {
    event: req.body.type,
    eventId: req.body.id,
    timestamp: new Date()
  };

  try {
    // Verificar idempotência com MongoDB TTL
    const result = await global.idempotency.parse(
      {
        path: req.path,
        event: eventData.event,
        eventId: eventData.eventId
      },
      req.body,
      86400 // TTL 24 horas
    );

    if (!result.created) {
      return res.status(200).json({ 
        error: false, 
        message: "Event already processed" 
      });
    }

    // Salvar na fila do MongoDB
    const insert = await collQueue.insertOne(req.body);
    
    if (insert.insertedId) {
      res.status(200).json({ 
        error: false, 
        message: "Event created!" 
      });
    } else {
      throw new Error("Failed to insert event");
    }
    
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).json({
      error: true,
      message: "Error processing event"
    });
  }
};
```

2. **Adicionar rota** em `config/app.js`:
```javascript
const novoProvedorHook = require('../hooks/novo-provedor');
app.post('/novo-provedor', novoProvedorHook);
```

3. **Configurar autenticação** em `middleware/auth.js`:
```javascript
const tokenHeaders = [
  "asaas-access-token",
  "stripe-access-token", 
  "novo-provedor-access-token"  // Adicionar aqui
];
```

## 📋 Scripts de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar em produção  
npm start

# Gerar token automaticamente
npm run token:create

# Verificar sintaxe
node -c index.js

# Ver logs em tempo real (se usando PM2)
pm2 logs
```

## 🔍 Troubleshooting

### Problemas Comuns

**Erro de conexão com MongoDB:**
- Verifique se o MongoDB está rodando
- Confirme a URL no arquivo `.env`

**Token inválido:**
- Execute `npm run token:create` para gerar novos tokens
- Verifique se o token está correto no header da requisição

**Webhook duplicado:**
- Comportamento esperado! O sistema previne duplicação automaticamente

---

**🎉 Sistema pronto para processar webhooks com alta performance e confiabilidade usando MongoDB TTL!**

**Made by AI and reviewed by me**