<?php
// src/emails/send_bulk.php

require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Verify simple token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization token required']);
    exit;
}

$token = $matches[1];

try {
    $decoded = json_decode(base64_decode($token), true);
    if (!$decoded || !isset($decoded['user_id'])) {
        throw new Exception('Invalid token');
    }
    $userId = $decoded['user_id'];
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['recipients']) || !isset($data['subject']) || !isset($data['body'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipients, subject, and body are required']);
    exit;
}

$recipients = $data['recipients'];
$subject = $data['subject'];
$body = $data['body'];
$attachments = $data['attachments'] ?? []; // attachments mapped by recipient email

$results = [];

// Create temp directory for attachments if needed
$tempDir = sys_get_temp_dir() . '/autocerts_attachments_' . uniqid();

foreach ($recipients as $recipient) {
    try {
        $mail = new PHPMailer(true);

        // Server settings
        $mail->isSMTP();
        $mail->Host = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['SMTP_USER'];
        $mail->Password = $_ENV['SMTP_PASS'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $_ENV['SMTP_PORT'];

        // Recipients
        $mail->setFrom($_ENV['SMTP_FROM'], $_ENV['SMTP_FROM_NAME']);
        $mail->addAddress($recipient['email'], $recipient['name'] ?? '');

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;

        // Replace placeholders in body
        $personalizedBody = $body;
        foreach ($recipient as $key => $value) {
            $personalizedBody = str_replace('{' . $key . '}', $value, $personalizedBody);
        }
        $mail->Body = $personalizedBody;

        // Add attachments for this recipient if they exist
        $recipientEmail = $recipient['email'];
        if (isset($attachments[$recipientEmail])) {
            // Create temp directory if it doesn't exist
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            foreach ($attachments[$recipientEmail] as $attachment) {
                if (isset($attachment['content']) && isset($attachment['filename'])) {
                    // Decode base64 content
                    $fileContent = base64_decode($attachment['content']);
                    $tempFilePath = $tempDir . '/' . basename($attachment['filename']);
                    
                    // Write decoded content to temp file
                    file_put_contents($tempFilePath, $fileContent);
                    
                    // Add attachment to mail
                    $mail->addAttachment($tempFilePath, $attachment['filename']);
                }
            }
        }

        $mail->send();

        $results[] = [
            'email' => $recipient['email'],
            'success' => true,
            'messageId' => $mail->getLastMessageID()
        ];

        // Log successful email
        logEmail($userId, $recipient['email'], $subject, 'sent');

    } catch (Exception $e) {
        $results[] = [
            'email' => $recipient['email'],
            'success' => false,
            'error' => $mail->ErrorInfo
        ];

        // Log failed email
        logEmail($userId, $recipient['email'], $subject, 'failed', $mail->ErrorInfo);
    }
}

// Clean up temp directory and files
if (is_dir($tempDir)) {
    $files = glob($tempDir . '/*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    rmdir($tempDir);
}

header('Content-Type: application/json');
echo json_encode([
    'results' => $results,
    'summary' => [
        'total' => count($recipients),
        'successful' => count(array_filter($results, fn($r) => $r['success'])),
        'failed' => count(array_filter($results, fn($r) => !$r['success']))
    ]
]);

function logEmail($userId, $recipientEmail, $subject, $status, $errorMessage = null) {
    try {
        $pdo = new PDO('sqlite:' . $_ENV['DB_PATH']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Create table if not exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS email_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            recipient_email TEXT,
            subject TEXT,
            status TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $stmt = $pdo->prepare("INSERT INTO email_logs (user_id, recipient_email, subject, status, error_message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $recipientEmail, $subject, $status, $errorMessage]);
    } catch (Exception $e) {
        // Log to file if database logging fails
        error_log("Email log error: " . $e->getMessage());
    }
}
?>