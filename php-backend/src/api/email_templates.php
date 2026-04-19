<?php
// src/api/email_templates.php

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

    // Get user's email templates
    $stmt = $pdo->prepare("SELECT id, name, template_data, created_at, updated_at FROM email_templates WHERE user_id = ? ORDER BY updated_at DESC");
    $stmt->execute([$decoded->user_id]);
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return templates data
    echo json_encode([
        'templates' => array_map(function($template) {
            return [
                'id' => $template['id'],
                'name' => $template['name'],
                'template_data' => json_decode($template['template_data']),
                'created_at' => $template['created_at'],
                'updated_at' => $template['updated_at']
            ];
        }, $templates)
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
}
?>