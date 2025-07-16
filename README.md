# 🚀 Webhook Template - Node.js/Redis/MongoDB

[🇺🇸 **English**](#-english-documentation) | [🇧🇷 **Português**](#-documentação-em-português)

---

## 🇺🇸 English Documentation

### 🌐 Project Overview

This is a **high-performance enterprise webhook system** built with **Node.js**, **Redis**, and **MongoDB**. The project was specifically designed to process webhooks from payment platforms like **Asaas** and **Stripe**, ensuring idempotency, high availability, and efficient processing of financial events.

### 🎯 Key Features

- ✅ **Idempotency**: Prevents duplicate event processing
- ✅ **High Performance**: Redis-powered caching and optimization
- ✅ **Multi-Provider**: Support for Asaas and Stripe webhooks
- ✅ **Scalable Architecture**: Vertical scaling with MongoDB queues
- ✅ **Enterprise Security**: Token-based authentication
- ✅ **Production Ready**: HTTP/HTTPS support with SSL certificates

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Payment APIs   │───▶│  Webhook Server │───▶│   MongoDB       │
│ (Asaas/Stripe)  │    │   (Node.js)     │    │   (Queues)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Idempotency)  │
                       └─────────────────┘
```

### 🛠️ Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Koa.js
- **Database**: MongoDB 6.8.0
- **Cache**: Redis (ioredis 5.6.0)
- **Security**: bcrypt, crypto-js
- **Dev Tools**: TypeScript, nodemon

### 🚀 Quick Start

```bash
# Clone and install
git clone [repository-url]
cd webhook-template
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run development
npm run dev

# Run production
npm start
```

### 📡 API Endpoints

```http
POST /asaas
POST /stripe
```

Both endpoints require authentication via headers:
- `asaas-access-token` for Asaas webhooks
- `stripe-access-token` for Stripe webhooks (if configured)

### 📖 Documentation

For detailed documentation in Portuguese, see below section.

---

## 🇧🇷 Documentação em Português

### 📋 Índice
- [Descrição do Projeto](#-descrição-do-projeto)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Sistema de Módulos](#-sistema-de-módulos)
- [Objetivos e Características](#-objetivos-e-características)
- [Como Funciona](#-como-funciona)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Uso](#-uso)
- [Contribuição](#-contribuição)

## 🌐 Descrição do Projeto

Este é um **sistema webhook empresarial de alta performance** desenvolvido em **Node.js** com integração **Redis** e **MongoDB**. O projeto foi criado especificamente para processar webhooks de plataformas de pagamento como **Asaas** e **Stripe**, garantindo idempotência, alta disponibilidade e processamento eficiente de eventos financeiros.

### 🎯 Problema Resolvido

O sistema resolve o problema de processamento confiável de webhooks de pagamento, evitando:
- ✅ Duplicação de eventos
- ✅ Perda de dados durante picos de tráfego
- ✅ Lentidão no processamento
- ✅ Falhas de comunicação entre sistemas
- ✅ Problemas de autenticação e segurança

## 🏗️ Arquitetura do Sistema

### Diagrama Conceitual
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  APIs Pagamento │───▶│  Webhook Server │───▶│   MongoDB       │
│ (Asaas/Stripe)  │    │   (Node.js)     │    │   (Filas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Idempotência) │
                       └─────────────────┘
```

### Fluxo de Dados

1. **Recepção**: Webhook recebe evento via POST `/asaas` ou `/stripe`, assim por diante...
2. **Validação**: Sistema valida token de autenticação
3. **Idempotência**: Redis verifica se evento já foi processado
4. **Armazenamento**: Evento é salvo na fila MongoDB para processamento
5. **Resposta**: Cliente recebe confirmação imediata

### Componentes Principais

#### 🔐 **Sistema de Autenticação**
- Validação via headers `asaas-access-token` e `stripe-access-token`
- Tokens configurados dinamicamente via base de dados
- Middleware de segurança em todas as rotas

#### ⚡ **Cache Redis (Idempotência)**
- Armazena chaves únicas por evento (eventId + path)
- TTL configurável (padrão: 24h / 86400s)
- Previne processamento duplicado de eventos

#### 💾 **Persistência MongoDB**
- Fila de eventos para processamento assíncrono
- Configuração dinâmica de collections
- Suporte a múltiplos bancos de dados

#### 🌐 **Servidor HTTP/HTTPS**
- Framework Koa.js para alta performance
- Suporte automático HTTP (desenvolvimento) e HTTPS (produção)
- CORS configurado para integração cross-origin

## 📁 Estrutura de Arquivos

```
webhook-template/
├── 📄 index.js                 # Ponto de entrada - configuração do servidor
├── 📄 package.json             # Dependências e configurações npm
├── 📄 README.md               # Documentação do projeto
├── 📄 .env.example            # Exemplo de configuração
│
├── 📂 config/                 # Configurações do sistema
│   ├── configServer.js        # Configuração principal do servidor
│   └── custom-express.js      # Configuração customizada do Koa.js
│
├── 📂 controllers/            # Controladores de lógica de negócio
│   ├── asaas/
│   │   └── hook.js           # Processamento de webhooks Asaas
│   └── stripe/
│       └── hook.js           # Processamento de webhooks Stripe
│
├── 📂 database/               # Conexões com bancos de dados
│   ├── mongo.js              # Configuração MongoDB
│   ├── redis.js              # Configuração Redis
│   └── redisfromtsteste.js   # Testes Redis
│
├── 📂 functions/              # Funções utilitárias
│   ├── createTimestamps.js   # Geração de timestamps
│   ├── createToken.js        # Criação de tokens
│   ├── getServerPort.js      # Configuração de porta
│   ├── getServiceConfigs.js  # Configurações de serviços
│   └── validateToken.js      # Validação de tokens
│
└── 📂 routes/                # Definição de rotas
    └── index.js              # Roteador principal
```

## 🛠️ Tecnologias Utilizadas

### **Backend Core**
- **Node.js** - Runtime JavaScript
- **Koa.js** (v2.14.2) - Framework web minimalista e performático
- **@koa/router** (v12.0.0) - Sistema de roteamento
- **@koa/cors** (v5.0.0) - Middleware CORS

### **Bancos de Dados**
- **MongoDB** (v6.8.0) - Banco NoSQL para persistência
- **Redis** (ioredis v5.6.0) - Cache em memória para idempotência

### **Segurança & Autenticação**
- **bcrypt/bcryptjs** - Hash de senhas
- **crypto-js** (v4.1.1) - Criptografia
- **dotenv** (v16.0.3) - Gerenciamento de variáveis de ambiente

### **Utilitários**
- **node-fetch** (v2.6.2) - Cliente HTTP
- **uid-generator** (v2.0.0) - Geração de IDs únicos
- **sharp** (v0.32.6) - Processamento de imagens
- **fluent-ffmpeg** (v2.1.3) - Processamento de vídeo

### **Desenvolvimento**
- **TypeScript** (v5.8.2) - Tipagem estática
- **nodemon** (v3.1.9) - Auto-reload durante desenvolvimento
- **@types/node** (v22.13.16) - Tipos TypeScript para Node.js

## 🔧 Sistema de Módulos

### **CommonJS (Configurado)**
Este projeto utiliza **CommonJS** como sistema de módulos, configurado em `package.json`:

```json
{
  "type": "commonjs"
}
```

### **Sintaxe Utilizada**
```javascript
// Importação
const Router = require('@koa/router');
const asaas = require('../controllers/asaas/hook.js');

// Exportação
module.exports = router;
```

### **Configuração Alternativa (ES6 Modules)**
Para usar ES6 modules, altere `package.json`:
```json
{
  "type": "module"
}
```

E use sintaxe ES6:
```javascript
// Importação
import Router from '@koa/router';
import asaas from '../controllers/asaas/hook.js';

// Exportação
export default router;
```

## ✅ Objetivos e Características

### **🎯 Objetivos Principais**
- **Alta Performance**: Processamento rápido com cache Redis
- **Confiabilidade**: Sistema de idempotência previne duplicações
- **Escalabilidade**: Arquitetura preparada para crescimento vertical
- **Segurança**: Autenticação robusta e validação de tokens
- **Flexibilidade**: Suporte a múltiplos provedores de pagamento
- **Simplicidade**: API minimalista com foco na funcionalidade

### **🔧 Características Técnicas**
- **Idempotência Garantida**: Eventos duplicados são automaticamente ignorados
- **Processamento Assíncrono**: Fila MongoDB para processamento em background
- **Cache Inteligente**: Redis com TTL configurável para otimização
- **Multi-ambiente**: Suporte automático HTTP (dev) e HTTPS (prod)
- **Monitoramento**: Sistema de logs integrado para debugging
- **Configuração Dinâmica**: Variáveis de ambiente e configuração externa

## ⚙️ Como Funciona

### **1. Recepção do Webhook**
```javascript
// POST /asaas
{
  "event": "PAYMENT_RECEIVED",
  "id": "unique-event-id",
  "payment": { /* dados do pagamento */ }
}

// POST /stripe
{
  "type": "payment_intent.succeeded",
  "id": "evt_unique-event-id",
  "data": { /* dados do pagamento */ }
}
```

### **2. Validação de Segurança**
- Verificação do header apropriado (`asaas-access-token` ou `stripe-access-token`)
- Validação contra tokens armazenados no sistema

### **3. Verificação de Idempotência**
```javascript
// Gera chave única por provedor
const key = await redis.createKey('/asaas', { 
  event: 'PAYMENT_RECEIVED', 
  eventId: 'unique-event-id' 
});
```

### **4. Processamento**
- **Se já processado**: Retorna `200 OK` imediatamente
- **Se novo**: Salva na fila MongoDB e cria chave Redis
- **Se erro**: Retorna erro apropriado com logs

### **5. Resposta**
```javascript
// Sucesso
{ "error": false, "message": "Event created!" }

// Já processado
{ "error": false, "message": "Event received!" }

// Erro
{ "error": true, "message": "Error description" }
```

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js >= 16.x
- MongoDB >= 4.x
- Redis >= 6.x
- Certificados SSL (para produção)

### **1. Clonagem e Dependências**
```bash
git clone [repositorio]
cd webhook-template
npm install
```

### **2. Configuração de Ambiente**
Crie arquivo `.env` baseado no `.env.example`:
```env
# Ambiente
NODE_ENV=local  # ou 'production'
PORT=3000

# MongoDB
MONGO_DATABASE=webhook_db
ASAAS_QUEUE={"db": "webhook_db", "coll": "asaas_events"}
STRIPE_QUEUE={"db": "webhook_db", "coll": "stripe_events"}

# Redis (configurado dinamicamente via getServiceConfigs)
# Valores padrão: host=100.64.92.6, port=6379

# Certificados SSL (apenas produção)
SERVER_MODE=local  # ou 'production'
CERTS_KEY=server.key
CERTS_CERTIFICATION=server.crt
CERTS_CABUNDLE=ca-bundle.crt
CERTS_CACERTIFICATESERVICES=ca-services.crt
```

### **3. Configuração de Tokens**
Os tokens são configurados dinamicamente via função `getServiceConfigs()` que busca configurações de um serviço externo.

### **4. Scripts Disponíveis**
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start

# Testes
npm test
```

## 📖 Uso

### **Endpoints Disponíveis**

#### **Asaas Webhook**
```http
POST /asaas
Content-Type: application/json
asaas-access-token: seu-token-aqui

{
  "event": "PAYMENT_RECEIVED",
  "id": "evt_123456789",
  "dateCreated": "2025-01-15 10:30:00",
  "payment": {
    "id": "pay_123456789",
    "value": 100.00,
    "status": "RECEIVED"
  }
}
```

#### **Stripe Webhook**
```http
POST /stripe
Content-Type: application/json
stripe-access-token: seu-token-aqui

{
  "type": "payment_intent.succeeded",
  "id": "evt_123456789",
  "created": 1642262400,
  "data": {
    "object": {
      "id": "pi_123456789",
      "amount": 10000,
      "status": "succeeded"
    }
  }
}
```

### **Respostas Esperadas**
- `200 OK` - Evento processado com sucesso
- `400 Bad Request` - Erro no processamento
- `401 Unauthorized` - Token inválido ou ausente
- `500 Internal Server Error` - Erro interno do servidor

### **Monitoramento e Logs**
O sistema inclui logs detalhados para:
- Requisições recebidas
- Tempo de processamento
- Eventos de idempotência
- Erros e exceções

## 🤝 Contribuição

### **Estrutura para Novos Recursos**
1. **Controllers**: Adicione lógica em `controllers/[provider]/`
2. **Rotas**: Registre em `routes/index.js`
3. **Funções**: Utilitários em `functions/`
4. **Validação**: Sempre inclua validação de tokens
5. **Logs**: Use sistema de logs integrado
6. **Testes**: Adicione testes apropriados

### **Adicionando Novo Provedor**
```javascript
// 1. Criar controller em controllers/newprovider/hook.js
module.exports = async (ctx) => {
  // Lógica específica do provedor
};

// 2. Adicionar rota em routes/index.js
const newprovider = require('../controllers/newprovider/hook.js');
router.post('/newprovider', newprovider);

// 3. Configurar token no middleware de validação
const tokenHeaders = [
  "asaas-access-token",
  "stripe-access-token",
  "newprovider-access-token"  // Adicionar aqui
];
```

### **Padrões de Código**
- Use `async/await` para operações assíncronas
- Valide entrada com middleware personalizado
- Implemente tratamento de erros consistente
- Mantenha funções pequenas e focadas
- Use CommonJS para consistência
- Documente mudanças no README

### **Estrutura de Commits**
```bash
feat: adiciona suporte ao provedor XYZ
fix: corrige validação de token Stripe
docs: atualiza documentação de instalação
refactor: melhora estrutura de rotas
```

---

**Desenvolvido para processar webhooks de forma confiável e performática** 🚀

### 👤 Autor
**Lucas Silva de Moraes** - Desenvolvedor Backend

### 📄 Licença
Este projeto está sob a licença **MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.
