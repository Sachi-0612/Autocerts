const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize SendGrid with API key from environment variable
// Set this in Firebase Functions environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY || functions.config().sendgrid?.key);

// Cloud Function to send emails
exports.sendBulkEmails = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails.'
    );
  }

  const { recipients, subject, body, attachments } = data;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Recipients array is required and cannot be empty.'
    );
  }

  const results = [];

  try {
    // Prepare batch email messages
    const messages = recipients.map(recipient => {
      // Personalize the email content
      const personalizedSubject = subject.replace(/\{(\w+)\}/g, (match, key) => {
        return recipient[key] || match;
      });

      const personalizedBody = body.replace(/\{(\w+)\}/g, (match, key) => {
        return recipient[key] || match;
      });

      return {
        to: recipient.email,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
          name: process.env.FROM_NAME || 'AutoCerts'
        },
        subject: personalizedSubject,
        html: personalizedBody,
        // attachments: attachments // Would need to handle file uploads separately
      };
    });

    // Send emails in batches (SendGrid allows up to 1000 emails per batch)
    const batchSize = 100;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);

      try {
        const result = await sgMail.send(batch);

        // SendGrid returns an array of results for batch sends
        batch.forEach((message, index) => {
          const emailResult = result[index];
          results.push({
            email: message.to,
            success: true,
            messageId: emailResult?.headers?.['x-message-id'] || `batch-${i + index}`
          });
        });

      } catch (batchError) {
        console.error(`Batch ${i / batchSize + 1} failed:`, batchError);

        // Mark all emails in this batch as failed
        batch.forEach(message => {
          results.push({
            email: message.to,
            success: false,
            error: batchError.message
          });
        });
      }
    }

    return {
      success: true,
      results: results,
      summary: {
        total: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };

  } catch (error) {
    console.error('Bulk email sending error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send emails: ' + error.message
    );
  }
});