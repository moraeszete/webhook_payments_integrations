# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-08-20

### Added
- **Token Management System**: Complete token generation and management system
  - Added `scripts/createToken.js` with multi-database support
  - Auto-detection of database type based on environment variables
  - Support for MongoDB, SQL databases, and in-memory token generation

### New NPM Scripts
- `npm run token:auto` - Auto-detects database and creates authentication token
- `npm run token:mongo` - Creates token using MongoDB (forces MongoDB usage)
- `npm run token:sql` - Creates token using SQL database (forces SQL usage)  
- `npm run token:generate` - Generates token in memory only (no database storage)

### Environment Variables Added
- `CREATE_IN_DB` - Boolean flag to enable/disable database token storage
- `MONGO_COLLECTION` - MongoDB collection name for token storage
- `SECRET_KEY` - Secret key used for token encryption/decryption

### Fixed
- **package.json syntax errors**:
  - Removed trailing comma after last script entry
  - Fixed `token:generate` script to include proper function call parentheses

### Features
- **Multi-Database Support**: System now supports both MongoDB and SQL databases
- **Token Validation**: Implemented robust token validation system in `functions/validateToken.js`
- **Environment-based Configuration**: Smart configuration that adapts to local and production environments
- **CLI Token Generation**: All token operations can be run via command line

### Database Schema
#### MongoDB Collections
- `suppliers_tokens` - Stores authentication tokens with metadata

#### SQL Tables
- `suppliers_tokens` - Stores authentication tokens with fields:
  - `id` (AUTO_INCREMENT PRIMARY KEY)
  - `token` (VARCHAR(500) UNIQUE)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
  - `active` (BOOLEAN DEFAULT TRUE)

### Technical Improvements
- **Error Handling**: Enhanced error handling in token generation scripts
- **Logging**: Comprehensive logging for debugging and monitoring
- **Validation**: Environment variable validation with helpful error messages
- **Security**: Encrypted token storage with bcrypt hashing

### Usage Examples
```bash
# Generate token with auto-detection
npm run token:auto

# Force MongoDB token creation
npm run token:mongo

# Force SQL token creation  
npm run token:sql

# Generate token without database storage
npm run token:generate
```

### Environment Configuration
The system now requires proper configuration of database connection variables. See `.env.example` for the complete list of required variables.

---

## How to Update

1. **Update package.json dependencies** (if needed)
2. **Configure environment variables** based on `.env.example`
3. **Run token generation**: `npm run token:auto`
4. **Test webhook endpoints** to ensure proper authentication

## Breaking Changes
- None in this release

## Migration Guide
- No migration required for new installations
- Existing installations should add the new environment variables from `.env.example`
