<?php
// public/create_test_user.php - Create a test user for debugging

// Load environment variables
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

$dbPath = __DIR__ . '/../../database/autocerts.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create users table if needed
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create a test user
    $email = 'test@example.com';
    $password = 'password123';
    $name = 'Test User';
    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword]);
    
    $userId = $pdo->lastInsertId();
    
    echo "<h2>✓ Test user created successfully!</h2>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";
    echo "<p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>";
    echo "<br>";
    echo "<p><a href='/test_auth.php'>View all users</a></p>";

} catch (Exception $e) {
    if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
        echo "<h2>⚠ User already exists</h2>";
        echo "<p>Test user with email 'test@example.com' already exists.</p>";
        echo "<p><a href='/test_auth.php'>View all users</a></p>";
    } else {
        echo "<h2>❌ Error creating user</h2>";
        echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
    }
}
?>
