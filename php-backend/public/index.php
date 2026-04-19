<?php
// public/index.php - Simplified entry point without external dependencies

// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        $_ENV[$name] = $value;
    }
}

loadEnv(__DIR__ . '/../.env');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple environment variables for testing
$_ENV['DB_PATH'] = realpath(__DIR__ . '/../../database/autocerts.db');

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
    case '/auth/logout':
        require_once __DIR__ . '/../src/auth/logout.php';
        break;
    case '/auth/google':
        require_once __DIR__ . '/../src/auth/google.php';
        break;
    case '/auth/google/callback':
        require_once __DIR__ . '/../src/auth/google_callback.php';
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