# AutoCerts - Certificate Automation Tool

A React application for generating personalized certificates and sending them via email with Google authentication.

## Features

- Google OAuth authentication
- Certificate template customization
- Excel data import for bulk certificate generation
- Email configuration with personalization
- Bulk email sending

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains
4. Enable Cloud Functions:
   - Go to Functions in the Firebase Console
   - Enable Cloud Functions if not already enabled
5. Get your Firebase config:
   - Go to Project settings > General
   - Scroll to "Your apps" section
   - Copy the config object

6. Update `src/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

7. Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 2. Deploy Firebase Functions

1. Install Firebase CLI globally (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Set up SendGrid email configuration:
```bash
firebase functions:config:set sendgrid.key="your-sendgrid-api-key"
firebase functions:config:set email.from_email="noreply@yourdomain.com"
firebase functions:config:set email.from_name="AutoCerts"
```

4. Install function dependencies:
```bash
cd functions
npm install
cd ..
```

5. Deploy functions:
```bash
firebase deploy --only functions
```

### 3. Alternative Email Setup (Using Gmail with Nodemailer)

If you prefer to use Gmail instead of SendGrid, modify `functions/index.js` to use Nodemailer:

1. Install Nodemailer in functions:
```bash
cd functions
npm install nodemailer
npm uninstall @sendgrid/mail
```

2. Update the function to use Nodemailer with Gmail
3. Set Gmail credentials:
```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
```

**Note**: Gmail has strict sending limits and may mark bulk emails as spam. SendGrid is recommended for production use.

## Usage

1. **Authentication**: Sign in with Google
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
- `{position}` - Recipient position (if available)

## Important Notes

- **Email Attachments**: Attachments can be supported by uploading files to Firebase Storage first, then including download links in emails.
- **Email Limits**: Firebase Functions have quotas. Check Firebase pricing for higher limits.
- **Security**: Never expose sensitive API keys in client-side code for production applications.
- **Deployment**: You must deploy the Firebase Functions for email sending to work.

## Development

```bash
npm install
npm run dev
```

## Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Technologies Used

- React 19
- Firebase Authentication
- Firebase Cloud Functions
- Nodemailer (for email sending)
- Tailwind CSS
- Vite
- XLSX for Excel processing
- JSZip for file compression
