# Quick Setup Guide

## Fix Database Connection Error

If you get this error:
```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

**Solution:** Make sure your `.env` file has a valid `DB_PASSWORD` set.

### Steps:

1. **Create `.env` file** (if not exists):
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit `.env` file** and set your PostgreSQL password:
   ```env
   DB_PASSWORD=your_actual_postgres_password_here
   ```

3. **Verify your PostgreSQL user and password:**
   ```bash
   # Try connecting manually
   psql -U postgres -d kyatflow
   # Or
   psql -h localhost -U postgres -d kyatflow
   ```

4. **If you forgot your PostgreSQL password:**
   ```bash
   # Reset postgres user password
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'new_password';
   \q
   ```

5. **Run migration again:**
   ```bash
   npm run migrate:dev
   ```

## Common Issues

### Issue 1: Database doesn't exist
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE kyatflow;
\q
```

### Issue 2: User doesn't have permissions
```bash
# Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE kyatflow TO postgres;
\q
```

### Issue 3: Connection refused
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Start PostgreSQL: `sudo systemctl start postgresql`
- Check port: `sudo netstat -tlnp | grep 5432`

