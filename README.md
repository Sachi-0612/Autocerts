# AutoCerts - Certificate Automation Tool

A React application for generating personalized certificates and sending them via email with PHP backend authentication.

## Features

- Email/Password and Google OAuth authentication
- Certificate template customization
- Excel data import for bulk certificate generation
- Email configuration with personalization
- Bulk email sending via PHP backend

## Setup Instructions

### 1. PHP Backend Setup

1. Navigate to the `php-backend` directory
2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Create a `.env` file in the `php-backend` directory:
   ```env
   DB_HOST=localhost
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

4. Set up your database:
   - Create a MySQL database named `autocerts`
   - Run the SQL schema from `php-backend/README.md`

5. Configure your web server (Apache/Nginx) to serve the `php-backend/public` directory

6. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add your PHP backend URL to authorized redirect URIs

### 2. React Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update the API base URL in `src/contexts/AuthContext.jsx` and `src/services/emailService.js`:
   ```javascript
   const API_BASE_URL = 'https://your-php-backend-domain.com'; // Replace with your PHP backend URL
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Configuration

Update the `API_BASE_URL` in these files to match your PHP backend domain:

- `src/contexts/AuthContext.jsx`
- `src/services/emailService.js`

## Database Schema

Create these tables in your MySQL database:

### users table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### email_logs table
```sql
CREATE TABLE email_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    recipient_email VARCHAR(255),
    subject VARCHAR(255),
    status ENUM('sent', 'failed'),
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Usage

1. **Authentication**: Sign in with email/password or Google OAuth
2. **Upload Template**: Upload your certificate template image
3. **Upload Data**: Upload Excel file with recipient data
4. **Customize**: Adjust text position, font, color, etc.
5. **Generate**: Create certificates for all recipients
6. **Configure Email**: Set subject and body with placeholders
7. **Send**: Send personalized emails to all recipients

## Placeholders

Use these placeholders in your email body:
- `{name}` - Recipient name
- `{email}` - Recipient email
- `{position}` - Recipient position (if available in Excel data)

## Important Notes

- **Email Attachments**: Currently emails are sent without attachments. For production, implement file upload to cloud storage and include download links.
- **CORS**: Configure your PHP backend to allow requests from your React app domain.
- **Security**: Store JWT secrets securely and validate tokens properly.
- **Email Limits**: Check your SMTP provider's sending limits.

## Development

```bash
npm install
npm run dev
```

## Deployment

1. Build the React app:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your web server

3. Ensure your PHP backend is running and accessible

## Technologies Used

- React 19
- Firebase Authentication
- Firebase Cloud Functions
- Nodemailer (for email sending)
- Tailwind CSS
- Vite
- XLSX for Excel processing
- JSZip for file compression
