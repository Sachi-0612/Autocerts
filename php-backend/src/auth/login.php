<?php
// src/auth/login.php

require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

// TODO: Connect to your database and verify user credentials
// This is a placeholder - implement your database connection

// Example database connection (replace with your actual DB code)
try {
    // Connect to SQLite database
    $dbPath = __DIR__ . '/../../' . $_ENV['DB_PATH'];
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create users table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }

    // Generate JWT token
    $payload = [
        'iss' => 'autocerts-api',
        'aud' => 'autocerts-client',
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60), // 24 hours
        'user_id' => $user['id'],
        'email' => $user['email']
    ];

    $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

    // Return user data and token
    echo json_encode([
        'token' => $jwt,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>