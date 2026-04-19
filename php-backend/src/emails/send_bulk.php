<?php
// src/emails/send_bulk.php

require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Verify JWT token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization token required']);
    exit;
}

$token = $matches[1];

try {
    $decoded = JWT::decode($token, $_ENV['JWT_SECRET'], ['HS256']);
    $userId = $decoded->user_id;
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

$results = [];

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

        // TODO: Add attachments if needed
        // if (isset($data['attachments'])) {
        //     foreach ($data['attachments'] as $attachment) {
        //         $mail->addAttachment($attachment['path'], $attachment['name']);
        //     }
        // }

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
        $pdo = new PDO(
            "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'],
            $_ENV['DB_USER'],
            $_ENV['DB_PASS']
        );

        $stmt = $pdo->prepare("INSERT INTO email_logs (user_id, recipient_email, subject, status, error_message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $recipientEmail, $subject, $status, $errorMessage]);
    } catch (Exception $e) {
        // Log to file if database logging fails
        error_log("Email log error: " . $e->getMessage());
    }
}
?>