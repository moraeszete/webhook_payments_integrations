# Webhook Payments Integration System

A high-performance enterprise webhook system built with Node.js, Redis, and MongoDB for processing payment platform webhooks from Asaas, Stripe, and other providers.

## Overview

This project provides a robust webhook processing system designed specifically for payment platforms. It ensures idempotency, high availability, and efficient processing of financial events with enterprise-grade security and scalability.

## Key Features

- **Idempotency**: Prevents duplicate event processing using Redis
- **High Performance**: Redis-powered caching and optimization  
- **Multi-Provider Support**: Compatible with Asaas, Stripe, and extensible to other providers
- **Scalable Architecture**: MongoDB queues for background processing
- **Enterprise Security**: Token-based authentication system
- **Production Ready**: HTTP/HTTPS support with SSL certificates

## Architecture

```
Payment APIs     →    Webhook Server    →    MongoDB
(Asaas/Stripe)         (Node.js)              (Queues)
                            ↓
                        Redis
                    (Idempotency)
```

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Koa.js
- **Database**: MongoDB 6.8.0
- **Cache**: Redis with RedisOver 1.1.1
- **Security**: bcrypt, crypto-js
- **Development**: TypeScript, nodemon

## Quick Start

```bash
# Clone and install dependencies
git clone [repository-url]
cd webhook_payments_integrations
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Redis and MongoDB settings

# Create authentication tokens
node -e "require('./scripts/createToken').auto()"

# Run in development mode
npm run dev

# Run in production
npm start
```

## Project Structure

```
webhook_payments_integrations/
├── index.js                   # Application entry point
├── package.json              # Dependencies and npm configuration
├── README.md                 # Project documentation
├── .env.example              # Environment configuration template
│
├── config/                   # System configuration
│   ├── configServer.js       # Main server configuration
│   └── custom-express.js     # Koa.js custom configuration
│
├── controllers/              # Business logic controllers
│   ├── asaas/
│   │   └── hook.js          # Asaas webhook processing
│   └── stripe/
│       └── hook.js          # Stripe webhook processing
│
├── database/                 # Database connections
│   ├── mongo.js             # MongoDB configuration
│   └── redis.js             # Redis configuration
│
├── functions/                # Utility functions
│   ├── createTimestamps.js  # Timestamp generation
│   ├── getServerPort.js     # Port configuration
│   └── validateToken.js     # Token validation
│
├── scripts/                 # Automation scripts
│   └── createToken.js       # Token creation system
│
└── routes/                  # Route definitions
    └── index.js             # Main router
```

## Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
NODE_ENV=local
PORT=3000
SERVER_MODE=local

# Security
SECRET_KEY=your-secret-key-here

# MongoDB Configuration
MONGO_DATABASE=webhooks
MONGO_URI=mongodb://localhost:27017

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=your-redis-username
REDIS_PASSWORD=your-redis-password

# Token Management
CREATE_IN_DB=true
SUPPLIERS_TOKENS=suppliers_tokens

# Queue Collections
ASAAS_QUEUE=asaas_queue
STRIPE_QUEUE=stripe_queue
```

## Token Management

The project includes an intelligent token creation system:

```bash
# Auto-detect database and create token
node -e "require('./scripts/createToken').auto()"

# Output example:
{
  "success": true,
  "token": "abc123def:674a2b1c8d9e3f4a5b6c7d8e",
  "tokenId": "674a2b1c8d9e3f4a5b6c7d8e",
  "database": "MongoDB",
  "savedToDatabase": true
}
```

## API Endpoints

### Webhook Endpoints

```http
POST /asaas
POST /stripe
```

Both endpoints require authentication via headers:
- `asaas-access-token` for Asaas webhooks
- `stripe-access-token` for Stripe webhooks

### Request/Response Examples

**Asaas Webhook Request:**
```http
POST /asaas
Content-Type: application/json
asaas-access-token: your-token-here

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

**Success Response:**
```json
{
  "error": false,
  "message": "Event created!"
}
```

**Duplicate Event Response:**
```json
{
  "error": false,
  "message": "Event received!"
}
```

## How It Works

### 1. Webhook Reception
The system receives webhook events via POST requests to provider-specific endpoints.

### 2. Security Validation
- Validates authentication token in request headers
- Checks token against stored credentials in database

### 3. Idempotency Check
Uses Redis to prevent duplicate processing:
```javascript
// Check if event already exists
const existingEvent = await global.redis.get(ctx.path);

if (existingEvent) {
  // Return duplicate response
  return { message: "Event received!" };
}
```

### 4. Event Processing
- Stores event metadata in Redis with TTL (24 hours)
- Inserts complete event data into MongoDB queue
- Returns immediate confirmation to webhook sender

### 5. Response Handling
- **New Event**: `200 OK` with "Event created!"
- **Duplicate**: `200 OK` with "Event received!"
- **Error**: `500` with error details

## Redis Integration with RedisOver

The project uses **RedisOver v1.1.1** for enhanced Redis functionality:

### Key Features
- Simplified configuration for different environments
- JSON object storage with `setJSON()` and `getJSON()`
- Automatic key prefixing for organization
- TTL management with `expire()`
- Environment-specific connection handling

### Configuration
```javascript
// Development (local) - no authentication
const config = {
  prefix: process.env.MONGO_DATABASE
}

// Production - with Redis credentials
if (process.env.SERVER_MODE !== 'local') {
  config.options = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  }
}
```

### Usage Example
```javascript
// Store event with TTL
await global.redis.setJSON(ctx.path, params);
await global.redis.expire(ctx.path, 86400);

// Check for existing event
const existingEvent = await global.redis.get(ctx.path);
```

## Development Scripts

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Run tests
npm test
```

## Database Collections

### MongoDB Collections
- `suppliers_tokens` - Authentication tokens
- `asaas_queue` - Asaas webhook events queue
- `stripe_queue` - Stripe webhook events queue

### Redis Keys
- Format: `{prefix}:{endpoint_path}`
- Example: `webhooks:/asaas`
- TTL: 86400 seconds (24 hours)

## Contributing

### Adding New Payment Provider

1. **Create Controller**: Add new file in `controllers/newprovider/hook.js`
2. **Add Route**: Register route in `routes/index.js`
3. **Configure Authentication**: Add token header to validation middleware
4. **Update Documentation**: Document the new provider

### Code Standards
- Use `async/await` for asynchronous operations
- Implement consistent error handling
- Follow CommonJS module system
- Keep functions focused and small
- Document significant changes

### Commit Format
```bash
feat: add support for XYZ provider
fix: resolve Stripe token validation issue
docs: update installation documentation
refactor: improve route structure
```

## Security Considerations

- All tokens are bcrypt hashed before storage
- Environment variables for sensitive configuration
- HTTPS support for production environments
- Input validation on all webhook endpoints
- Rate limiting considerations for production deployment

## Production Deployment

### SSL Configuration
For HTTPS in production, configure certificates:
```env
CERTS_KEY=server.key
CERTS_CERTIFICATION=server.crt
CERTS_CABUNDLE=ca-bundle.crt
CERTS_CACERTIFICATESERVICES=ca-services.crt
```

### Performance Optimization
- Redis connection pooling
- MongoDB connection optimization
- Request/response compression
- Monitoring and logging

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Lucas Silva de Moraes** - Backend Developer

---

**Built for reliable and performant webhook processing**

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

1. **Recepção**: Webhook recebe evento via POST `/asaas` ou `/stripe`, e assim por diante...
2. **Validação**: Sistema valida token de autenticação
3. **Idempotência**: Redis verifica se evento já foi processado
4. **Armazenamento**: Evento é salvo na fila MongoDB para processamento
5. **Resposta**: Cliente recebe confirmação imediata

### Componentes Principais

#### 🔐 **Sistema de Autenticação**
- Validação via headers `asaas-access-token` e `stripe-access-token`
- Tokens configurados dinamicamente via banco de dados
- Middleware de segurança em todas as rotas

#### ⚡ **Cache Redis (Idempotência)**
- Utiliza **RedisOver** para funcionalidades avançadas
- Armazena chaves únicas por evento (eventId + path) 
- TTL configurável (padrão: 24h / 86400s)
- Previne processamento duplicado de eventos
- Configuração dinâmica entre ambientes local e produção

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
│   ├── getServerPort.js      # Configuração de porta
│   ├── getServiceConfigs.js  # Configurações de serviços
│   └── validateToken.js      # Validação de tokens
│
├── 📂 scripts/               # Scripts de automação
│   └── createToken.js        # Sistema avançado de criação de tokens
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
- **Redis** com **RedisOver** (v1.1.1) - Cache em memória para idempotência e controle de estado

### **Segurança & Autenticação**
- **bcrypt/bcryptjs** - Hash de senhas
- **crypto-js** (v4.1.1) - Criptografia
- **dotenv** (v16.0.3) - Gerenciamento de variáveis de ambiente

### **Utilitários**
- **node-fetch** (v2.6.2) - Cliente HTTP
- **uid-generator** (v2.0.0) - Geração de IDs únicos
- **sharp** (v0.32.6) - Processamento de imagens
- **fluent-ffmpeg** (v2.1.3) - Processamento de vídeo
- **redisover** (v1.1.1) - Wrapper avançado para Redis

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

### **RedisOver Integration**
O projeto utiliza **RedisOver v1.1.1** que oferece:
- 🔧 **Configuração simplificada** para diferentes ambientes
- 🚀 **Métodos avançados** como `parseKey()` para idempotência
- 🛡️ **Controle de ambiente** automático (local vs produção)
- 📦 **Prefixos automáticos** para organização de chaves
- ⚡ **Performance otimizada** para aplicações Node.js

```javascript
// Exemplo de uso do RedisOver
const result = await global.redis.parseKey('/webhook', {
  provider: 'asaas',
  eventId: 'evt_123'
}, 86400, webhookData);

if (result.keyValue) {
  // Evento já processado - idempotência garantida
  return { message: "Event already processed" };
}
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
- **Idempotência Garantida**: Eventos duplicados são automaticamente ignorados via RedisOver
- **Processamento Assíncrono**: Fila MongoDB para processamento em background
- **Cache Inteligente**: RedisOver com TTL configurável e controle de ambiente
- **Multi-ambiente**: Configuração automática local (sem autenticação Redis) e produção (com credenciais)
- **Monitoramento**: Sistema de logs integrado para debugging
- **Configuração Dinâmica**: Variáveis de ambiente organizadas por seções

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
// RedisOver gera chave única por provedor com prefix configurável
const key = await redis.parseKey('/asaas', { 
  event: 'PAYMENT_RECEIVED', 
  eventId: 'unique-event-id' 
});

// Chave resultante: "webhooks:/asaas:event_PAYMENT_RECEIVED:eventId_unique-event-id"
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
git clone [repositório]
cd webhook-template
npm install
```

### **2. Configuração de Ambiente**
Crie arquivo `.env` baseado no `.env.example`:
```env
# =================================
# ENVIRONMENT CONFIGURATION
# =================================

# Server Configuration
NODE_ENV=local  # ou 'production'
PORT=3000
SERVER_MODE=local  # ou 'production' para HTTPS

# =================================
# DATABASE CONFIGURATION
# =================================

# MongoDB
MONGO_DATABASE=webhooks

# Redis (RedisOver Configuration)
REDIS_HOST=localhost          # ou seu host Redis
REDIS_PORT=6379              # porta do Redis
REDIS_USERNAME=your-username # se necessário
REDIS_PASSWORD=your-password # se necessário
REDIS_DB_NUMBER=0           # número do banco Redis

# =================================
# QUEUES CONFIGURATION
# =================================
SUPPLIERS_TOKENS=suppliers_tokens
ASAAS_QUEUE=asaas_queue
STRIPE_QUEUE=stripe_queue
TWILIO_QUEUE=twilio_queue

# =================================
# SECURITY CONFIGURATION
# =================================
SECRET_KEY=your-secret-key-here

# Token Creation Configuration
CREATE_IN_DB=true                    # Set to true to save tokens in database

# =================================
# SSL CERTIFICATES (Production Only)
# =================================
CERTS_KEY=server.key
CERTS_CERTIFICATION=server.crt
CERTS_CABUNDLE=ca-bundle.crt
CERTS_CACERTIFICATESERVICES=ca-services.crt
```

### **3. Token Creation and Management**

This project includes an advanced token creation system that automatically detects your database configuration and creates authentication tokens.

#### **Token Creation Script**
The `scripts/createToken.js` module provides multiple ways to create authentication tokens:

```bash
# Auto-detect database and create token
node -e "require('./scripts/createToken').auto()"

# Force MongoDB token creation
node -e "require('./scripts/createToken').mongo()"

# Force SQL token creation (future implementation)
node -e "require('./scripts/createToken').sql()"

# Generate token in memory only
node -e "require('./scripts/createToken').generate()"

# Direct execution
node scripts/createToken.js
```

#### **Environment Variables for Token Creation**
Add these to your `.env` file:

```env
# Token Creation Configuration
CREATE_IN_DB=true                    # Set to true to save tokens in database
MONGO_URI=mongodb://localhost:27017  # MongoDB connection string
MONGO_DATABASE=webhook               # Database name
SUPPLIERS_TOKENS=suppliers_tokens    # Collection name for tokens

# Optional SQL configuration (for future use)
# SQL_HOST=localhost
# SQL_DATABASE=webhook
# SQL_USER=your_username
# SQL_PASSWORD=your_password
```

#### **How Token Creation Works**
1. **Auto-Detection**: Script automatically detects which database is configured
2. **Document Creation**: Creates a new document in MongoDB with bcrypt-hashed token
3. **ID Generation**: Returns the MongoDB ObjectId for the created token
4. **Token Format**: Returns token in format `secret:objectId` (e.g., `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

#### **Token Document Structure**
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$hashedTokenValue...",  // bcrypt hash
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```

### **4. Configuração Legada de Tokens**
Para compatibilidade com versões anteriores, os tokens ainda podem ser configurados dinamicamente via função `getServiceConfigs()` que busca configurações de um serviço externo.

#### **Sistema Avançado de Criação de Tokens**

O projeto inclui um sistema inteligente de criação de tokens que detecta automaticamente sua configuração de banco de dados:

```bash
# Auto-detecta o banco e cria token
node -e "require('./scripts/createToken').auto()"

# Força criação no MongoDB
node -e "require('./scripts/createToken').mongo()"

# Força criação no SQL (implementação futura)
node -e "require('./scripts/createToken').sql()"

# Gera token apenas na memória
node -e "require('./scripts/createToken').generate()"

# Execução direta
node scripts/createToken.js
```

#### **Como Funciona o Sistema de Tokens**
1. **Auto-Detecção**: O script detecta automaticamente qual banco está configurado
2. **Criação de Documento**: Cria um novo documento no MongoDB com token hasheado via bcrypt
3. **Geração de ID**: Retorna o ObjectId do MongoDB para o token criado
4. **Formato do Token**: Retorna token no formato `secret:objectId` (ex: `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

#### **Estrutura do Documento de Token**
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$valorHasheado...",  // hash bcrypt
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```

#### **Exemplo de Output**
```json
{
  "success": true,
  "token": "abc123def:674a2b1c8d9e3f4a5b6c7d8e",
  "secret": "abc123def",
  "hashSecret": "$2b$08$...",
  "tokenId": "674a2b1c8d9e3f4a5b6c7d8e",
  "database": "MongoDB",
  "savedToDatabase": true,
  "timestamp": "2025-07-18T..."
}
```

### **5. Scripts Disponíveis**
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
- Requisições recebidas por rota
- Tempo de processamento dos webhooks
- Conexão e status do Redis/RedisOver
- Eventos de idempotência (duplicados detectados)
- Erros e exceções com stack trace
- Status de conexão MongoDB

## 🤝 Contribuição

### **Estrutura de Ambiente**
```javascript
// Desenvolvimento (local) - Redis sem autenticação
const config = {
  prefix: process.env.MONGO_DATABASE,
  // options comentadas para ambiente local
}

// Produção - Redis com credenciais completas
if (process.env.NODE_ENV === 'production') {
  config.options = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  }
}
```

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
