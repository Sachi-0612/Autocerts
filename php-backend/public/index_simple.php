<?php
// public/index.php - Simplified entry point without external dependencies

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple environment variables for testing
$_ENV['DB_PATH'] = '../database/autocerts.db';

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string from URI
$path = parse_url($requestUri, PHP_URL_PATH);

// Route the request
switch ($path) {
    case '/auth/register':
        require_once __DIR__ . '/../src/auth/register_simple.php';
        break;
    case '/auth/login':
        require_once __DIR__ . '/../src/auth/login_simple.php';
        break;
    case '/api/user':
        require_once __DIR__ . '/../src/api/user_simple.php';
        break;
    case '/api/certificates':
        if ($requestMethod === 'GET') {
            require_once __DIR__ . '/../src/api/certificates_simple.php';
        } elseif ($requestMethod === 'POST') {
            require_once __DIR__ . '/../src/api/create_certificate_simple.php';
        }
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>