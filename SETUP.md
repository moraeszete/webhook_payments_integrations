# Setup and Configuration Guide

This guide will help you set up and configure the Webhook Payment Integration System.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webhook-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Generate authentication token**
   ```bash
   npm run token:auto
   ```

5. **Start the server**
   ```bash
   npm start
   # Or for development with auto-reload
   npm run dev
   ```

## Environment Configuration

### Required Variables

#### Server Configuration
- `PORT` - Server port (default: 3000)
- `SERVER_MODE` - Environment mode (local/production)

#### Security
- `SECRET_KEY` - Secret key for token encryption (change in production!)
- `CREATE_IN_DB` - Whether to store tokens in database (true/false)

#### Database (Choose one or both)

**MongoDB Configuration:**
- `MONGO_URI` - MongoDB connection string
- `MONGO_DATABASE` - Database name  
- `SUPPLIERS_TOKENS` - Collection name for tokens

**SQL Configuration:**
- `SQL_HOST` - SQL server host
- `SQL_DATABASE` - SQL database name
- `SQL_USERNAME` - SQL username
- `SQL_PWD` - SQL password

#### Redis Configuration  
- `REDIS_PREFIX` - Redis key prefix
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `REDIS_USERNAME` - Redis username (optional)
- `REDIS_PASSWORD` - Redis password (optional)  
- `REDIS_DB_NUMBER` - Redis database number (optional)

### Environment Examples

#### Local Development
```env
PORT=3000
SERVER_MODE=local
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=webhooks_dev
SUPPLIERS_TOKENS=suppliers_tokens
REDIS_HOST=localhost
REDIS_PORT=6379
CREATE_IN_DB=true
SECRET_KEY=dev-secret-key-change-me
```

#### Production
```env
PORT=3000
SERVER_MODE=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/webhooks_prod?retryWrites=true&w=majority
MONGO_DATABASE=webhooks_prod
SUPPLIERS_TOKENS=suppliers_tokens
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_USERNAME=your-redis-user
REDIS_PASSWORD=your-redis-password
CREATE_IN_DB=true
SECRET_KEY=your-super-secure-production-key
```

## Token Management

### Available Commands

```bash
# Auto-detect database and create token
npm run token:auto

# Force MongoDB token creation  
npm run token:mongo

# Force SQL token creation
npm run token:sql  

# Generate token without database storage
npm run token:generate
```

### How Token Generation Works

1. **Auto-detection** (`token:auto`):
   - Checks available database configurations
   - Prefers MongoDB if both MongoDB and SQL are configured
   - Falls back to memory-only if no database is configured

2. **Database Storage**:
   - MongoDB: Stores in `suppliers_tokens` collection
   - SQL: Stores in `suppliers_tokens` table with auto-created schema
   - Memory: Returns token without storage (for testing)

3. **Token Structure**:
   - Encrypted using bcrypt
   - Includes timestamp information
   - Unique per generation

## Database Schema

### MongoDB Collection: `suppliers_tokens`
```javascript
{
  _id: ObjectId,
  token: String (encrypted),
  created_at: Date,
  updated_at: Date,
  active: Boolean
}
```

### SQL Table: `suppliers_tokens`
```sql
CREATE TABLE suppliers_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);
```

## Webhook Endpoints

### Available Routes
- `POST /webhook/asaas` - Asaas payment webhooks
- `POST /webhook/stripe` - Stripe payment webhooks  
- `POST /webhook/template` - Generic webhook template

### Request Authentication
All webhook requests require a valid authentication token in the request headers or body.

### Idempotency
The system prevents duplicate event processing using Redis caching with configurable TTL.

## Development

### File Structure
```
├── config/
│   ├── configdbs.js          # Database configuration
│   └── custom-express.js     # Express app configuration
├── controllers/
│   ├── hookTemplate.js       # Generic webhook controller
│   └── asaas/
│   └── stripe/
├── database/
│   ├── mongo.js             # MongoDB connection
│   └── redis.js             # Redis connection  
├── functions/
│   ├── createTimestamps.js  # Utility functions
│   ├── getServerPort.js     # Server utilities
│   └── validateToken.js     # Token validation
├── routes/
│   └── index.js             # Route definitions
└── scripts/
    └── createToken.js       # Token generation scripts
```

### Adding New Payment Providers

1. Create controller in `controllers/[provider]/hook.js`
2. Add route in `routes/index.js`
3. Implement provider-specific validation logic
4. Test with provider's webhook testing tools

## Troubleshooting

### Common Issues

**Token generation fails:**
- Check database connection settings
- Verify CREATE_IN_DB setting
- Check database permissions

**Redis connection errors:**
- Verify Redis server is running
- Check Redis credentials and host/port
- For local development, ensure Redis is accessible

**Webhook not receiving events:**
- Verify webhook URL is publicly accessible
- Check authentication token configuration  
- Review webhook provider settings

### Logs and Debugging
- Enable detailed logging by setting appropriate log levels
- Check server console output for connection status
- Monitor database connections and Redis cache operations

## Production Deployment

### Security Checklist
- [ ] Change default SECRET_KEY  
- [ ] Use strong database passwords
- [ ] Enable Redis authentication
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting

### Performance Considerations
- Configure appropriate Redis TTL values
- Monitor database connection pools
- Implement proper error handling and retries
- Set up database indexing for optimal performance
