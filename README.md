# Webhook Payments Integration System

[🇺🇸 **English Documentation**](#english-documentation) | [🇧🇷 **Documentação em Português**](#documentação-em-português)

---

## English Documentation

### Table of Contents
- [Project Description](#project-description)
- [System Architecture](#system-architecture)
- [File Structure](#file-structure)
- [Technologies Used](#technologies-used)
- [Module System](#module-system)
- [Objectives and Features](#objectives-and-features)
- [How It Works](#how-it-works)
- [Installation and Configuration](#installation-and-configuration)
- [Recent Updates & New Features](#recent-updates--new-features)
- [Usage](#usage)
- [Contributing](#contributing)

## Project Description

This is a **high-performance enterprise webhook system** developed in **Node.js** with **Redis** and **MongoDB** integration. The project was created specifically to process webhooks from payment platforms like **Asaas** and **Stripe**, ensuring idempotency, high availability, and efficient processing of financial events.

### Latest Improvements (August 2025)
- 🚀 **Advanced Token Management**: Multi-database token generation with auto-detection
- 🔧 **Enhanced CLI Tools**: Complete command-line interface for token operations  
- 🛠️ **Improved Reliability**: Fixed configuration issues and enhanced error handling
- 📚 **Better Documentation**: Comprehensive setup guides and troubleshooting

### Problem Solved

The system solves the problem of reliable payment webhook processing, avoiding:
- Event duplication
- Data loss during traffic peaks
- Processing slowdowns
- Communication failures between systems
- Authentication and security issues

## Objectives and Features

### Main Objectives
- **High Performance**: Fast processing with Redis cache
- **Reliability**: Idempotency system prevents duplications
- **Scalability**: Architecture prepared for vertical growth
- **Security**: Robust authentication and token validation
- **Flexibility**: Support for multiple payment providers
- **Simplicity**: Minimalist API focused on functionality

### Technical Features
- **Guaranteed Idempotency**: Duplicate events are automatically ignored via Redis
- **Asynchronous Processing**: MongoDB queue for future processing
- **Smart Cache**: RedisOver with configurable TTL and environment control
- **Multi-environment**: Automatic configuration for local (no Redis authentication) and production (with credentials)
- **Dynamic Configuration**: Environment variables organized by sections
- **Advanced Token Management**: Multi-database token generation with auto-detection
- **CLI Token Operations**: Complete command-line interface for token management
- **Multi-Database Support**: MongoDB and SQL database compatibility
- **Enterprise Security**: Bcrypt-hashed token storage with validation system

## System Architecture

### Conceptual Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Payment APIs   ───▶   Webhook Server  ───▶    MongoDB       │
│ (Asaas/Stripe)  │    │   (Node.js)     │    │   (Queues)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Idempotency)  │
                       └─────────────────┘
```

### Data Flow

1. **Reception**: Webhook receives event via POST `/asaas` or `/stripe`, and so on...
2. **Validation**: System validates authentication token
3. **Idempotency**: Redis checks if event has already been processed
4. **Storage**: Event is saved in MongoDB queue for processing
5. **Response**: Client receives immediate confirmation

### Main Components

#### 🔐 **Authentication System**
- Validation via headers `asaas-access-token` and `stripe-access-token`
- Tokens configured dynamically via database
- Security middleware on all routes

#### **Redis Cache (Idempotency)**
- Uses **RedisOver** for advanced functionality
- Stores unique keys per event (path + eventId)
- Configurable TTL (default: 24h / 86400s)
- Prevents duplicate event processing
- Dynamic configuration between local and production environments

#### **MongoDB Persistence**
- Event queue for asynchronous processing
- Dynamic collection configuration
- Support for multiple databases

#### **HTTP/HTTPS Server**
- Koa.js framework for high performance
- Automatic HTTP (development) and HTTPS (production) support
- CORS configured for cross-origin integration

## Technologies Used

### Backend Core
- **Node.js** - JavaScript Runtime (modules in **CommonJS**)
- **Koa.js** - Web framework 
- **RedisOver** - Advanced Redis Wrapper
- **nodemon** (v3.1.9) - Auto-reload during development ( _Development only_ )

### Databases
- **MongoDB** - NoSQL database for persistence
- **Redis** - In-memory cache for idempotency and state control

### Security & Authentication
- **bcrypt/bcryptjs** - Password hashing
- **crypto-js** - Cryptography
- **dotenv** - Environment variable management

## How Redis Works (RedisOver)

### RedisOver Integration
The project uses **RedisOver** which offers:
- 🔧 **Simplified configuration** for different environments
- 🚀 **Advanced methods** like `parse()` for idempotency
- 🛡️ **Automatic environment control** (local vs production)
- 📦 **Automatic prefixes** for key organization

```javascript
// Example of RedisOver usage in this project
const result = await global.redis.parse(
  {
    path: '/asaas'
    event: 'PAYMENT_RECEIVED', 
    eventId: 'unique-event-id' 
  }, //keys
  ctx.body, //value
  86400 //ttl
);
/*
  resultType {
    created: boolean, 
    key: string
    value: any, 
  }
*/ 
if (!result.created) {
  // Event already processed - idempotency guaranteed
  return { message: "Event already processed" };
}
```

## File Structure

```
webhook-template/
├── 📄 index.js                 # Entry point - server configuration
├── 📄 package.json             # Dependencies and npm scripts
├── 📄 README.md               # Project documentation  
├── 📄 .env.example            # Configuration example
├── 📄 CHANGELOG.md            # Version history and changes
├── 📄 SETUP.md                # Detailed setup guide
│
├── 📂 config/                 # System configurations
│   ├── configdbs.js           # Database connections setup
│   └── custom-express.js      # Custom Express/Koa configuration
│
├── 📂 controllers/            # Business logic controllers
│   ├── hookTemplate.js        # Generic webhook template
│   ├── asaas/
│   │   └── hook.js           # Asaas webhook processing
│   └── stripe/
│       └── hook.js           # Stripe webhook processing
│
├── 📂 database/               # Database connections
│   ├── mongo.js              # MongoDB configuration
│   └── redis.js              # Redis configuration
│
├── 📂 functions/              # Utility functions
│   ├── createTimestamps.js   # Timestamp generation
│   ├── getServerPort.js      # Port configuration
│   └── validateToken.js      # Token validation system
│
├── 📂 scripts/               # Automation scripts
│   └── createToken.js        # Advanced token creation system
│
└── 📂 routes/                # Route definitions
    └── index.js              # Main router
```


## How It Works

### 1. Webhook Reception
```javascript
// POST /asaas
{
  "event": "PAYMENT_RECEIVED",
  "id": "unique-event-id",
  "payment": { /* payment data */ }
}

// POST /stripe
{
  "type": "payment_intent.succeeded",
  "id": "evt_unique-event-id",
  "data": { /* payment data */ }
}
```

### 2. Security Validation
- Verification of appropriate header (`access-token`)
- Validation against tokens stored in the system

### 3. Idempotency Verification

**RedisOver** parse method checks and creates if necessary.

```javascript
// RedisOver generates unique key per provider with configurable prefix
const key = await global.redis.parse({ 
  path: 'asaas'
  event: 'PAYMENT_RECEIVED', 
  eventId: 'unique-event-id' 
});

// Resulting key: "${prefix}:path_asaas:event_PAYMENT_RECEIVED:eventId_unique-event-id"
```

### 4. Processing
- **If already processed**: Returns `200 OK` immediately
- **If new**: Saves to MongoDB queue and creates Redis key
- **If error**: Returns appropriate error with logs

### 5. Response
```javascript
// Success
{ "error": false, "message": "Event created!" }

// Already processed
{ "error": false, "message": "Event received!" }

// Error
{ "error": true, "message": "Error description" }
```

## Installation and Configuration

### Prerequisites
- Node.js >= 16.x
- MongoDB >= 4.x
- Redis >= 6.x

### 1. Cloning and Dependencies
```bash
git clone [repository]
cd webhook-template
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:


### 3. Token Creation System

This project includes an advanced token creation system that automatically detects your database configuration and creates authentication tokens.

#### Token Creation Script
The `scripts/createToken.js` module offers several ways to create authentication tokens:

```bash
# Detects which database will be used 
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

#### Environment Variables for Token Creation

Check if `.env` received the correct structure as in `.env.example`

If not, add these to your `.env` file:

```env
# Token Creation Configuration
CREATE_IN_DB=true                    # Set to true to save tokens in database
MONGO_URI=mongodb://localhost:27017  # MongoDB connection string
MONGO_DATABASE=webhook               # Database name
SUPPLIERS_TOKENS=suppliers_tokens    # Collection name for tokens

# SQL Configuration 
# SQL_HOST=localhost
# SQL_DATABASE=webhook
# SQL_USERNAME=your_username
# SQL_PWD=your_password
```

#### How Token Creation Works and Purpose

The functioning and purpose of token creation are simple and straightforward:

1. **Optimize**: Make authentication token creation for webhook systems more agile and simple.

1. **Auto-Detection**: The script automatically detects which database is configured
2. **Document Creation**: Creates a new document in MongoDB with bcrypt-hashed token
3. **ID Generation**: Returns the MongoDB ObjectId for the created token
4. **Token Format**: Returns the token in format `secret:objectId` (e.g., `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

#### Token Document Structure
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$hashedValue...",  // bcrypt hash
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```


### 4. Legacy Token Configuration
For compatibility with previous versions, tokens can still be configured dynamically via the `getServiceConfigs()` function that fetches configurations from an external service.

#### Advanced Token Creation System

The project includes an intelligent token creation system that supports MongoDB and SQL databases with automatic detection capabilities.

##### Token Creation Methods

**1. Auto-Detection (Recommended)**
The system automatically detects your database configuration:

```bash
# Auto-detect database and create token
node -e "require('./scripts/createToken').auto()"
```

**How it works:**
- Checks MongoDB environment variables (`MONGO_URI`, `MONGO_DATABASE`, `SUPPLIERS_TOKENS`)
- Checks SQL environment variables (`SQL_HOST`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD`)
- Prefers MongoDB if both databases are configured
- Generates memory-only if no database is configured

**2. Force MongoDB Creation**
```bash
# Force MongoDB creation
node -e "require('./scripts/createToken').mongo()"
```

**3. Force SQL Creation**
```bash
# Force SQL database creation
node -e "require('./scripts/createToken').sql()"
```

**4. Memory-Only Generation**
```bash
# Generate token without database storage
node -e "require('./scripts/createToken').generate()"
```

**5. Direct Script Execution**
```bash
# Execute script directly (uses auto-detection)
node scripts/createToken.js
```

##### Required Environment Variables

**For MongoDB Support:**
```env
CREATE_IN_DB=true
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=webhooks
SUPPLIERS_TOKENS=suppliers_tokens
```

**For SQL Support:**
```env
CREATE_IN_DB=true
SQL_HOST=localhost
SQL_DATABASE=webhooks
SQL_USER=your_username
SQL_PASSWORD=your_password
```

##### Token Format and Structure

**Generated Token Format:**
```
{secret}:{database_id}
```

**Example:** `abc123def:674a2b1c8d9e3f4a5b6c7d8e`

Where:
- `abc123def` = Plain text secret (10 characters)
- `674a2b1c8d9e3f4a5b6c7d8e` = Database record ID

##### Database Storage:

**MongoDB Document:**
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$hashedValue...",  // bcrypt hash of secret
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```

**SQL Table Structure:**
```sql
CREATE TABLE suppliers_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,           -- bcrypt hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);
```

##### Usage Examples and Output

**Success Output Example:**
```json
{
  "success": true,
  "token": "abc123def:674a2b1c8d9e3f4a5b6c7d8e",
  "secret": "abc123def",
  "hashSecret": "$2b$08$hashedValue...",
  "tokenId": "674a2b1c8d9e3f4a5b6c7d8e",
  "database": "MongoDB",
  "savedToDatabase": true,
  "timestamp": "2025-07-24T10:30:00.000Z"
}
```

**Error Output Example:**
```json
{
  "success": false,
  "error": "Missing required environment variables: MONGO_URI, MONGO_DATABASE",
  "missingVariables": ["MONGO_URI", "MONGO_DATABASE"],
  "database": "MongoDB",
  "savedToDatabase": false
}
```

##### How to Use Generated Tokens

1. **Copy the token value** from the output (e.g., `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

2. **Use in webhook requests** as authentication headers:
   ```http
   POST /asaas
   Content-Type: application/json
   asaas-access-token: abc123def:674a2b1c8d9e3f4a5b6c7d8e
   ```

3. **The system validates** through:
   - Extracting the secret part (`abc123def`)
   - Finding database record using the ID part (`674a2b1c8d9e3f4a5b6c7d8e`)
   - Comparing the bcrypt hash of the secret with stored hash

##### Token Validation Process

```javascript
// 1. Extract token parts
const [secret, tokenId] = receivedToken.split(':');

// 2. Find database record
const tokenRecord = await db.findById(tokenId);

// 3. Validate secret against stored hash
const isValid = await bcrypt.compare(secret, tokenRecord.token);

// 4. Check if token is active
if (isValid && tokenRecord.active) {
  // Token is valid - allow request
}
```

##### Advanced Configuration

**Disable Database Storage:**
```env
CREATE_IN_DB=false
```
When disabled, tokens are generated but not saved to database (useful for testing).

**Multiple Database Support:**
If MongoDB and SQL are configured, the system will:
1. Prefer MongoDB by default
2. Allow manual selection via specific methods
3. Provide clear indication of which database was used

#### How the Token System Works
1. **Auto-Detection**: The script automatically detects which database is configured
2. **Document Creation**: Creates a new document in MongoDB with bcrypt-hashed token
3. **ID Generation**: Returns the MongoDB ObjectId for the created token
4. **Token Format**: Returns token in format `secret:objectId` (e.g., `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

#### Token Document Structure
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$hashedValue...",  // bcrypt hash
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```

#### Output Example
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

### 5. NPM Scripts

#### Server Management
```bash
# Development (with auto-reload using nodemon)
npm run dev

# Production server
npm start

# Run tests (placeholder)
npm test
```

#### Token Management System (New!)
```bash
# Auto-detect database and create token (recommended)
npm run token:auto

# Force MongoDB token creation
npm run token:mongo

# Force SQL token creation
npm run token:sql

# Generate token in memory only (for testing)
npm run token:generate
```

#### Token Management Examples
```bash
# For first-time setup - automatically configures based on your .env
npm run token:auto
# Output: Creates token in detected database and returns authentication credentials

# For MongoDB-only environments
npm run token:mongo  
# Output: Forces token creation in MongoDB regardless of other configurations

# For development/testing without database
npm run token:generate
# Output: Returns token without storing in any database
```

## Recent Updates & New Features

### 🚀 Version 1.0.0 - August 2025

#### ✨ New Features Added

**Advanced Token Management System**
- 🔧 **Multi-Database Support**: Automatic detection of MongoDB and SQL configurations
- 🎯 **Smart Auto-Detection**: Intelligently chooses the best database based on available environment variables
- 🛠️ **CLI Token Operations**: Complete command-line interface for all token operations
- 🔒 **Enhanced Security**: Bcrypt hashing with secure token validation

**New NPM Scripts**
- `npm run token:auto` - Auto-detects and creates tokens in the appropriate database
- `npm run token:mongo` - Forces MongoDB token creation
- `npm run token:sql` - Forces SQL database token creation  
- `npm run token:generate` - Memory-only token generation for testing

**Database Schema Improvements**
- 📊 **MongoDB Collections**: Structured `suppliers_tokens` collection with proper indexing
- 🗄️ **SQL Tables**: Auto-creation of `suppliers_tokens` table with optimized schema
- 🔄 **Cross-Database Compatibility**: Seamless switching between database types

**Environment Configuration Enhancements**
- ✅ **Improved `.env.example`**: Comprehensive configuration examples for all environments
- 🔧 **Variable Standardization**: Consistent naming convention across all configuration files
- 📝 **Better Documentation**: Detailed setup guides and troubleshooting information

#### 🛠️ Technical Improvements
- **Fixed package.json syntax errors**: Removed trailing commas and corrected function calls
- **Enhanced error handling**: Better validation and debugging information
- **Streamlined architecture**: Simplified database connection management
- **Performance optimizations**: Improved token generation and validation processes

#### 📚 Documentation Updates
- **SETUP.md**: Comprehensive setup and configuration guide
- **CHANGELOG.md**: Detailed version history and changes
- **README.md**: Updated with all new features and usage examples

For detailed information about all changes, see [CHANGELOG.md](CHANGELOG.md) and [SETUP.md](SETUP.md).

## Usage

### Available Endpoints

#### Asaas Webhook
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

#### Stripe Webhook
```http
POST /stripe
Content-Type: application/json
stripe-access-token: your-token-here

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

### Expected Responses
- `200 OK` - Event successfully processed
- `400 Bad Request` - Processing error
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Internal server error

### Monitoring and Logs
The system includes detailed logs for:
- Requests received per route
- Webhook processing time
- Redis/RedisOver connection and status
- Idempotency events (duplicates detected)
- Errors and exceptions with stack trace
- MongoDB connection status

## Contributing

### Environment Structure
```javascript
// Development (local) - Redis without authentication
const config = {
  prefix: process.env.MONGO_DATABASE,
  // options commented for local environment
}

// Production - Redis with full credentials
if (process.env.NODE_ENV === 'production') {
  config.options = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  }
}
```

### Adding New Provider
```javascript
// 1. Create controller in controllers/newprovider/hook.js
module.exports = async (ctx) => {
  // Provider-specific logic
};

// 2. Add route in routes/index.js
const newprovider = require('../controllers/newprovider/hook.js');
router.post('/newprovider', newprovider);

// 3. Configure token in validation middleware
const tokenHeaders = [
  "asaas-access-token",
  "stripe-access-token",
  "newprovider-access-token"  // Add here
];
```

**Built for reliable and performant webhook processing**

## Author: Lucas Silva de Moraes - Full-stack Developer



## Documentação em Português

### Índice
- [Descrição do Projeto](#descrição-do-projeto)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Sistema de Módulos](#sistema-de-módulos)
- [Objetivos e Características](#objetivos-e-características)
- [Como Funciona](#como-funciona)
- [Instalação e Configuração](#instalação-e-configuração)
- [Uso](#uso)
- [Contribuição](#contribuição)

## Descrição do Projeto

Este é um **sistema webhook empresarial de alta performance** desenvolvido em **Node.js** com integração **Redis** e **MongoDB**. O projeto foi criado especificamente para processar webhooks de plataformas de pagamento como **Asaas** e **Stripe**, garantindo idempotência, alta disponibilidade e processamento eficiente de eventos financeiros.

### Problema Resolvido

O sistema resolve o problema de processamento confiável de webhooks de pagamento, evitando:
- Duplicação de eventos
- Perda de dados durante picos de tráfego
- Lentidão no processamento
- Falhas de comunicação entre sistemas
- Problemas de autenticação e segurança

## Arquitetura do Sistema

### Diagrama Conceitual
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ APIs de Pagamento ──▶  Webhook Server  ───▶    MongoDB       │
│ (Asaas/Stripe)  │    │   (Node.js)     │    │   (Filas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Idempotency)  │
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

#### **Cache Redis (Idempotência)**
- Utiliza **RedisOver** para funcionalidades avançadas
- Armazena chaves únicas por evento (path + eventId) 
- TTL configurável (padrão: 24h / 86400s)
- Previne processamento duplicado de eventos
- Configuração dinâmica entre ambientes local e produção

#### **Persistência MongoDB**
- Fila de eventos para processamento assíncrono
- Configuração dinâmica de collections
- Suporte a múltiplos bancos de dados

#### **Servidor HTTP/HTTPS**
- Framework Koa.js para alta performance
- Suporte automático HTTP (desenvolvimento) e HTTPS (produção)
- CORS configurado para integração cross-origin

## Estrutura de Arquivos

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

## Tecnologias Utilizadas

### Backend Core
- **Node.js** - Runtime JavaScript (modulos em **CommonJs**)
- **Koa.js** - Framework web 
- **RedisOver** - Wrapper Avançado para Redis
- **nodemon** (v3.1.9) - Auto-reload durante desenvolvimento ( _Apenas desenvolvimento_ )

### Bancos de Dados
- **MongoDB** - Banco NoSQL para persistência
- **Redis** - Cache em memória para idempotência e controle de estado

### Segurança & Autenticação
- **bcrypt/bcryptjs** - Hash de senhas
- **crypto-js** - Criptografia
- **dotenv** - Gerenciamento de variáveis de ambiente

## Como redis fuciona (RedisOver )

### RedisOver Integration
O projeto utiliza **RedisOver** que oferece:
- 🔧 **Configuração simplificada** para diferentes ambientes
- 🚀 **Métodos avançados** como `parse()` para idempotência
- 🛡️ **Controle de ambiente** automático (local vs produção)
- 📦 **Prefixos automáticos** para organização de chaves

```javascript
// Exemplo de uso do RedisOver neste projeto
const result = await global.redis.parse(
  {
    path: '/asaas'
    event: 'PAYMENT_RECEIVED', 
    eventId: 'unique-event-id' 
  }, //keys
  ctx.body, //value
  86400 //ttl
);
/*
  resultType {
    created: boolean, 
    key: string
    value: any, 
  }
*/ 
if (!result.created) {
  // Evento já processado - idempotência garantida
  return { message: "Event already processed" };
}
```

## Objetivos e Características

### Objetivos Principais
- **Alta Performance**: Processamento rápido com cache Redis
- **Confiabilidade**: Sistema de idempotência previne duplicações
- **Escalabilidade**: Arquitetura preparada para crescimento vertical
- **Segurança**: Autenticação robusta e validação de tokens
- **Flexibilidade**: Suporte a múltiplos provedores de pagamento
- **Simplicidade**: API minimalista com foco na funcionalidade

### Características Técnicas
- **Idempotência Garantida**: Eventos duplicados são automaticamente ignorados via redis
- **Processamento Assíncrono**: Fila MongoDB para processamento futuro.
- **Cache Inteligente**: RedisOver com TTL configurável e controle de ambiente
- **Multi-ambiente**: Configuração automática local (sem autenticação Redis) e produção (com credenciais)
- **Configuração Dinâmica**: Variáveis de ambiente organizadas por seções

## Como Funciona

### 1. Recepção do Webhook
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

### 2. Validação de Segurança
- Verificação do header apropriado (`access-token`)
- Validação contra tokens armazenados no sistema

### 3. Verificação de Idempotência

Método parse do **RedisOver** verifica e criar se necessario.

```javascript
// RedisOver gera chave única por provedor com prefix configurável
const key = await global.redis.parse({ 
  path: 'asaas'
  event: 'PAYMENT_RECEIVED', 
  eventId: 'unique-event-id' 
});

// Chave resultante: "${prefix}:path_asaas:event_PAYMENT_RECEIVED:eventId_unique-event-id"
```

### 4. Processamento
- **Se já processado**: Retorna `200 OK` imediatamente
- **Se novo**: Salva na fila MongoDB e cria chave Redis
- **Se erro**: Retorna erro apropriado com logs

### 5. Resposta
```javascript
// Sucesso
{ "error": false, "message": "Event created!" }

// Já processado
{ "error": false, "message": "Event received!" }

// Erro
{ "error": true, "message": "Error description" }
```

## Instalação e Configuração

### Pré-requisitos
- Node.js >= 16.x
- MongoDB >= 4.x
- Redis >= 6.x

### 1. Clonagem e Dependências
```bash
git clone [repositório]
cd webhook-template
npm install
```

### 2. Configuração de Ambiente
Crie arquivo `.env` baseado no `.env.example`:

### 3. Sistema de Criação de Tokens

Este projeto inclui um sistema avançado de criação de tokens que detecta automaticamente sua configuração de banco de dados e cria tokens de autenticação.

#### Script de Criação de Token
O `scripts/createToken.js` modulo oferece varias maneiras de criar as tokens de authenticação:

```bash
# Detecta o banco de dados que será usado 
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

#### Variáveis de Ambiente para Criação de Tokens

Verifique se `.env` recebeu a estrutura correta como em `.env.example`

Se não adicione estas ao seu arquivo `.env`:

```env
# Configuração de Criação de Token
CREATE_IN_DB=true                    # Defina como true para salvar tokens no banco de dados
MONGO_URI=mongodb://localhost:27017  # String de conexão do MongoDB
MONGO_DATABASE=webhook               # Nome do banco de dados
SUPPLIERS_TOKENS=suppliers_tokens    # Nome da coleção para tokens

# Configuração SQL 
# SQL_HOST=localhost
# SQL_DATABASE=webhook
# SQL_USERNAME=seu_usuario
# SQL_PWD=sua_senha
```

#### Como Funciona e finalidade a Criação de Tokens

O funcionamento e fnalidade são simples da criação token e bem simples:

1. **Otimizar**: Tornar a criação de tokens de autenticação de sistemas para o webhook mais agil e simples.

1. **Auto-Detecção**: O script detecta automaticamente qual banco de dados está configurado
2. **Criação de Documento**: Cria um novo documento no MongoDB com token hasheado por bcrypt
3. **Geração de ID**: Retorna o ObjectId do MongoDB para o token criado
4. **Formato do Token**: Retorna o token no formato `secret:objectId` (ex: `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

#### Estrutura do Documento de Token
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$valorHasheado...",  // hash bcrypt
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```

### 4. Configuração Legada de Tokens
Para compatibilidade com versões anteriores, os tokens ainda podem ser configurados dinamicamente via função `getServiceConfigs()` que busca configurações de um serviço externo.

#### Sistema Avançado de Criação de Tokens

O projeto inclui um sistema inteligente de criação de tokens que suporta bancos MongoDB e SQL com capacidades de detecção automática.

##### Métodos de Criação de Tokens

**1. Auto-Detecção (Recomendado)**
O sistema detecta automaticamente sua configuração de banco de dados:

```bash
# Auto-detecta o banco e cria token
node -e "require('./scripts/createToken').auto()"
```

**Como funciona:**
- Verifica variáveis de ambiente do MongoDB (`MONGO_URI`, `MONGO_DATABASE`, `SUPPLIERS_TOKENS`)
- Verifica variáveis de ambiente do SQL (`SQL_HOST`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD`)
- Prefere MongoDB se ambos os bancos estiverem configurados
- Gera apenas na memória se nenhum banco estiver configurado

**2. Forçar Criação no MongoDB**
```bash
# Força criação no MongoDB
node -e "require('./scripts/createToken').mongo()"
```

**3. Forçar Criação no SQL**
```bash
# Força criação no banco SQL
node -e "require('./scripts/createToken').sql()"
```

**4. Geração Apenas na Memória**
```bash
# Gera token sem armazenar no banco
node -e "require('./scripts/createToken').generate()"
```

**5. Execução Direta do Script**
```bash
# Executa o script diretamente (usa auto-detecção)
node scripts/createToken.js
```

##### **Variáveis de Ambiente Necessárias**

**Para Suporte ao MongoDB:**
```env
CREATE_IN_DB=true
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=webhooks
SUPPLIERS_TOKENS=suppliers_tokens
```

**Para Suporte ao SQL:**
```env
CREATE_IN_DB=true
SQL_HOST=localhost
SQL_DATABASE=webhooks
SQL_USER=seu_usuario
SQL_PASSWORD=sua_senha
```

##### **Formato e Estrutura do Token**

**Formato do Token Gerado:**
```
{secret}:{id_do_banco}
```

**Exemplo:** `abc123def:674a2b1c8d9e3f4a5b6c7d8e`

Onde:
- `abc123def` = Segredo em texto simples (10 caracteres)
- `674a2b1c8d9e3f4a5b6c7d8e` = ID do registro no banco de dados

##### **Armazenamento no Banco:**

**Documento MongoDB:**
```javascript
{
  _id: ObjectId("674a2b1c8d9e3f4a5b6c7d8e"),
  token: "$2b$08$valorHasheado...",  // hash bcrypt do segredo
  createdAt: Date,
  updatedAt: Date,
  active: true
}
```

**Estrutura da Tabela SQL:**
```sql
CREATE TABLE suppliers_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,           -- hash bcrypt
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);
```

##### **Exemplos de Uso e Saída**

**Exemplo de Saída de Sucesso:**
```json
{
  "success": true,
  "token": "abc123def:674a2b1c8d9e3f4a5b6c7d8e",
  "secret": "abc123def",
  "hashSecret": "$2b$08$valorHasheado...",
  "tokenId": "674a2b1c8d9e3f4a5b6c7d8e",
  "database": "MongoDB",
  "savedToDatabase": true,
  "timestamp": "2025-07-24T10:30:00.000Z"
}
```

**Exemplo de Saída de Erro:**
```json
{
  "success": false,
  "error": "Missing required environment variables: MONGO_URI, MONGO_DATABASE",
  "missingVariables": ["MONGO_URI", "MONGO_DATABASE"],
  "database": "MongoDB",
  "savedToDatabase": false
}
```

##### **Como Usar os Tokens Gerados**

1. **Copie o valor do token** da saída (ex: `abc123def:674a2b1c8d9e3f4a5b6c7d8e`)

2. **Use em requisições de webhook** como headers de autenticação:
   ```http
   POST /asaas
   Content-Type: application/json
   asaas-access-token: abc123def:674a2b1c8d9e3f4a5b6c7d8e
   ```

3. **O sistema valida** através de:
   - Extração da parte do segredo (`abc123def`)
   - Busca do registro no banco usando a parte do ID (`674a2b1c8d9e3f4a5b6c7d8e`)
   - Comparação do hash bcrypt do segredo com o hash armazenado

##### **Processo de Validação do Token**

```javascript
// 1. Extrair partes do token
const [secret, tokenId] = tokenRecebido.split(':');

// 2. Buscar registro no banco
const registroToken = await db.findById(tokenId);

// 3. Validar segredo contra hash armazenado
const isValido = await bcrypt.compare(secret, registroToken.token);

// 4. Verificar se token está ativo
if (isValido && registroToken.active) {
  // Token é válido - permitir requisição
}
```

##### **Configuração Avançada**

**Desabilitar Armazenamento no Banco:**
```env
CREATE_IN_DB=false
```
Quando desabilitado, tokens são gerados mas não salvos no banco (útil para testes).

**Suporte a Múltiplos Bancos:**
Se MongoDB e SQL estiverem configurados, o sistema irá:
1. Preferir MongoDB por padrão
2. Permitir seleção manual via métodos específicos
3. Fornecer indicação clara de qual banco foi usado

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

### 5. Scripts Disponíveis
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start

# Testes
npm test
```

## Uso

### Endpoints Disponíveis

#### Asaas Webhook
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

#### Stripe Webhook
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

### Respostas Esperadas
- `200 OK` - Evento processado com sucesso
- `400 Bad Request` - Erro no processamento
- `401 Unauthorized` - Token inválido ou ausente
- `500 Internal Server Error` - Erro interno do servidor

### Monitoramento e Logs
O sistema inclui logs detalhados para:
- Requisições recebidas por rota
- Tempo de processamento dos webhooks
- Conexão e status do Redis/RedisOver
- Eventos de idempotência (duplicados detectados)
- Erros e exceções com stack trace
- Status de conexão MongoDB

## Contribuição

### Estrutura de Ambiente
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

### Adicionando Novo Provedor
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

<!-- ### **Padrões de Código**
- Use `async/await` para operações assíncronas
- Valide entrada com middleware personalizado
- Implemente tratamento de erros consistente
- Mantenha funções pequenas e focadas
- Use CommonJS para consistência
- Documente mudanças no README
--- -->

**Desenvolvido para processar webhooks de forma confiável e performática**

### Autor: Lucas Silva de Moraes - Desenvolvedor Full-stack