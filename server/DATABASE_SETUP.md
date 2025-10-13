# Local Database Setup for Doctrack

This project is configured to use a local PostgreSQL database for development and a remote Supabase database for production.

## Environment Configuration

### Development (Local)
- Database: Local PostgreSQL running in Docker on port 5433
- Connection: `postgresql://postgres:password@localhost:5433/doctrack_dev`

### Production 
- Database: Remote Supabase database
- Connection: Use your actual Supabase credentials (see `.env.example`)

## Setup Instructions

### 1. Environment Files

The project uses environment-specific configurations:
- `.env` - Local development settings (not committed to git)
- `.env.example` - Template showing required environment variables

### 2. Starting the Local Database

```bash
# Start the PostgreSQL database
npm run db:start

# Verify the database is running
docker compose ps
```

### 3. Database Migrations

```bash
# Run migrations on the local database
npm run db:migrate

# Reset the database (if needed)
npm run db:reset
```

### 4. Database Management

```bash
# Start database
npm run db:start

# Stop database
npm run db:stop

# Open Prisma Studio (database GUI)
npm run db:studio

# Run migrations
npm run db:migrate
```

### 5. Running the Application

```bash
# Start the development server
npm run dev
```

## Database URLs

### Local Development
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/doctrack_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5433/doctrack_dev"
```

### Production (Example)
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require"
```

## Troubleshooting

### Port 5432 Already in Use
If you see "address already in use" for port 5432, the Docker setup is configured to use port 5433 instead.

### Connection Issues
1. Ensure the database container is running: `docker compose ps`
2. Check the connection string in `.env`
3. Verify the database credentials

### Migration Issues
If you encounter migration conflicts:
```bash
# Reset migrations and start fresh
npm run db:reset
```

## Docker Configuration

The local database runs using Docker with the following configuration:
- Image: postgres:16-alpine
- Port: 5433 (mapped to internal 5432)
- Database: doctrack_dev
- Username: postgres  
- Password: password

Data is persisted in a Docker volume named `server_postgres_data`.
