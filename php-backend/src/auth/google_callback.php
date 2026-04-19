<?php
// src/auth/google_callback.php

require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Firebase\JWT\JWT;

session_start();

// Initialize Google Client
$client = new Google\Client();
$client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
$client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
$client->setRedirectUri($_ENV['GOOGLE_REDIRECT_URI'] ?? 'http://localhost/autocerts-api/auth/google/callback');

// Handle the OAuth callback
if (isset($_GET['code'])) {
    try {
        $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);

        if (isset($token['error'])) {
            throw new Exception('OAuth error: ' . $token['error']);
        }

        $client->setAccessToken($token);

        // Get user info from Google
        $oauth = new Google\Service\Oauth2($client);
        $userInfo = $oauth->userinfo->get();

        $googleId = $userInfo->id;
        $email = $userInfo->email;
        $name = $userInfo->name;

        // Connect to database
        $dbPath = $_ENV['DB_PATH'];
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

        // Check if user exists
        $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE google_id = ? OR email = ?");
        $stmt->execute([$googleId, $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // Create new user
            $stmt = $pdo->prepare("INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)");
            $stmt->execute([$name, $email, $googleId]);
            $userId = $pdo->lastInsertId();
            $user = [
                'id' => $userId,
                'name' => $name,
                'email' => $email
            ];
        } else {
            // Update existing user with Google ID if not set
            if (!$user['google_id']) {
                $stmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                $stmt->execute([$googleId, $user['id']]);
            }
            $userId = $user['id'];
        }

        // Generate JWT token
        $payload = [
            'iss' => 'autocerts-api',
            'aud' => 'autocerts-client',
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60), // 24 hours
            'user_id' => $userId,
            'email' => $email
        ];

        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        // Store token in session for frontend to pick up
        $_SESSION['auth_token'] = $jwt;
        $_SESSION['user_data'] = json_encode($user);

        // Redirect back to frontend with token in URL fragment
        $redirectUrl = 'http://localhost:5173/auth/callback#' . http_build_query([
            'token' => $jwt,
            'user' => json_encode($user)
        ]);
        header('Location: ' . $redirectUrl);
        exit;

    } catch (Exception $e) {
        error_log('Google OAuth callback error: ' . $e->getMessage());
        header('Location: http://localhost:5173/login?error=oauth_failed');
        exit;
    }
} else {
    header('Location: http://localhost:5173/login?error=no_code');
    exit;
}
?>