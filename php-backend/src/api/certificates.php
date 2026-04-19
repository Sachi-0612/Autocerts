<?php
// src/api/certificates.php

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

    // Get user's certificates
    $stmt = $pdo->prepare("SELECT id, template_data, certificate_data, created_at FROM certificates WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$decoded->user_id]);
    $certificates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return certificates data
    echo json_encode([
        'certificates' => array_map(function($cert) {
            return [
                'id' => $cert['id'],
                'template_data' => json_decode($cert['template_data']),
                'certificate_data' => json_decode($cert['certificate_data']),
                'created_at' => $cert['created_at']
            ];
        }, $certificates)
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
}
?>