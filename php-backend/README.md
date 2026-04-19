# AutoCerts PHP Backend API

This is the PHP backend API for the AutoCerts certificate generation tool.

## 🚀 Quick Start

1. **Start the PHP Backend:**
   ```bash
   cd php-backend
   php -S localhost:8001 -t public
   ```

2. **Test the API:**
   ```bash
   # Register a user
   curl -X POST http://localhost:8001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

   # Login
   curl -X POST http://localhost:8001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'

   # Get certificates
   curl http://localhost:8001/api/certificates

   # Create a certificate
   curl -X POST http://localhost:8001/api/certificates \
     -H "Content-Type: application/json" \
     -d '{"template_data":{"title":"Certificate"},"certificate_data":{"recipient":"John Doe"}}'
   ```

## Setup Instructions

### 1. Install Dependencies

The backend uses only built-in PHP features (PDO with SQLite), no external dependencies required!

### 2. Environment Configuration

The `.env` file is configured for SQLite by default. No changes needed for development.

### 3. Database Setup

The SQLite database is created automatically when you first run the API. No manual setup required!

### 4. Google OAuth Setup (Optional)

For production with Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add the redirect URI: `http://localhost/autocerts-api/auth/google/callback`

### 5. Start the Server

```bash
# From the project root
php -S localhost:8001 -t php-backend/public
```

The API will be available at `http://localhost:8001`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login with email/password

### API Endpoints (Simplified - No JWT required for development)

- `GET /api/user` - Get demo user information
- `GET /api/certificates` - Get all certificates
- `POST /api/certificates` - Create new certificate

### Future Endpoints (when JWT is implemented)

- `GET /auth/google` - Google OAuth redirect
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/logout` - User logout
- `GET /api/email-templates` - Get user's email templates
- `POST /api/email-templates` - Create new email template
- `POST /emails/send-bulk` - Send bulk emails with certificates

## Database Schema

The database tables are created automatically using SQLite. Here are the table structures:

### users table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    google_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### certificates table
```sql
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    template_data TEXT NOT NULL,
    certificate_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### email_templates table
```sql
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    template_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Environment Variables

Create a `.env` file with:
```
DB_HOST=localhost
DB_NAME=autocerts_db
DB_USER=root
DB_PASS=
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost/autocerts-api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
php-backend/
├── public/
│   └── index.php          # Main entry point
├── src/
│   ├── auth/
│   │   ├── register.php
│   │   ├── google.php
│   │   ├── google_callback.php
│   │   └── logout.php
│   └── api/
│       └── user.php       # User-related API endpoints
├── vendor/                # Composer dependencies
├── .env                   # Environment variables
├── composer.json
└── database_schema.sql
```

## Security Notes

- Change the `JWT_SECRET` in production
- Use HTTPS in production
- Validate and sanitize all input data
- Implement rate limiting for API endpoints
- Store sensitive data securely
DB_NAME=autocerts
DB_USER=your_db_user
DB_PASS=your_db_password

JWT_SECRET=your_jwt_secret_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=AutoCerts
```

## Installation

1. Install PHP dependencies:
```bash
composer install
```

2. Set up your web server (Apache/Nginx) to point to the `public` directory

3. Configure your database and run migrations

4. Set up Google OAuth credentials

5. Configure SMTP settings for email sending

## CORS Configuration

Make sure your PHP backend allows CORS requests from your React app domain.