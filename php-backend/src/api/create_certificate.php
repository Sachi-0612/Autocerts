<?php
// src/api/create_certificate.php

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

if (!$data || !isset($data['template_data']) || !isset($data['certificate_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Template data and certificate data are required']);
    exit;
}

try {
    // Decode JWT token
    $decoded = JWT::decode($token, $_ENV['JWT_SECRET'], ['HS256']);

    // Connect to database
    $dbPath = __DIR__ . '/../../' . $_ENV['DB_PATH'];
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create certificates table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_data TEXT NOT NULL,
        certificate_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Insert new certificate
    $stmt = $pdo->prepare("INSERT INTO certificates (user_id, template_data, certificate_data) VALUES (?, ?, ?)");
    $stmt->execute([
        $decoded->user_id,
        json_encode($data['template_data']),
        json_encode($data['certificate_data'])
    ]);

    $certificateId = $pdo->lastInsertId();

    // Return success response
    echo json_encode([
        'message' => 'Certificate created successfully',
        'certificate_id' => $certificateId
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
}
?>