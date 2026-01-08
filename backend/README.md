# KyatFlow Backend API

Backend API server for KyatFlow - Smart Finance OS for Myanmar SMEs

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Process Manager:** PM2
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kyatflow
DB_USER=postgres
DB_PASSWORD=your_password
PORT=9800
NODE_ENV=development
FRONTEND_URL=http://localhost:3555
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
```

### 3. Setup Database

```bash
# Create database
createdb kyatflow

# Run migrations
npm run migrate:dev
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm start
```

### 6. Start with PM2

```bash
npm run build
pm2 start ecosystem.config.js
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations (production)
- `npm run migrate:dev` - Run database migrations (development)

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── connection.ts    # PostgreSQL connection pool
│   │   ├── schema.sql       # Database schema
│   │   └── migrate.ts       # Migration script
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   ├── errorHandler.ts  # Error handling middleware
│   │   └── validation.ts    # Request validation middleware
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   ├── transactions.ts  # Transaction routes
│   │   ├── parties.ts       # Party routes
│   │   └── analytics.ts     # Analytics routes
│   └── server.ts            # Express app entry point
├── dist/                    # Compiled JavaScript (generated)
├── logs/                    # PM2 logs (generated)
├── ecosystem.config.js      # PM2 configuration
└── package.json
```

## API Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete API endpoint documentation.

## Database Schema

- **users** - User accounts
- **parties** - Customers and suppliers
- **transactions** - Income and expense transactions
- **user_settings** - User preferences and settings

## License

ISC

