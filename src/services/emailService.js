// PHP backend API base URL - update this to your PHP backend URL
const API_BASE_URL = 'http://localhost/autocerts-api'; // Change this to your PHP backend URL

export const sendBulkEmails = async (recipients, subject, body, attachments = []) => {
  try {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/emails/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipients,
        subject,
        body,
        attachments
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send emails');
    }

    return data.results || [];
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};