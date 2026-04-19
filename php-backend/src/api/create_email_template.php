<?php
// src/api/create_email_template.php

require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;

// Get Authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization token required']);
    exit;
}

$token = $matches[1];

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name']) || !isset($data['template_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Template name and template data are required']);
    exit;
}

$name = trim($data['name']);
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Template name cannot be empty']);
    exit;
}

try {
    // Decode JWT token
    $decoded = JWT::decode($token, $_ENV['JWT_SECRET'], ['HS256']);

    // Connect to database
    $dbPath = __DIR__ . '/../../' . $_ENV['DB_PATH'];
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create email_templates table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        template_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Insert new email template
    $stmt = $pdo->prepare("INSERT INTO email_templates (user_id, name, template_data) VALUES (?, ?, ?)");
    $stmt->execute([
        $decoded->user_id,
        $name,
        json_encode($data['template_data'])
    ]);

    $templateId = $pdo->lastInsertId();

    // Return success response
    echo json_encode([
        'message' => 'Email template created successfully',
        'template_id' => $templateId
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
}
?>