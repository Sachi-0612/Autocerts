<?php
// public/test_auth.php - Debug script to test auth endpoints

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

// Set database path
$dbPath = realpath(__DIR__ . '/../../database/autocerts.db');
if (!$dbPath) {
    $dbPath = __DIR__ . '/../../database/autocerts.db';
}

echo "Database path: " . $dbPath . "<br>";
echo "Database exists: " . (file_exists($dbPath) ? "Yes" : "No") . "<br><br>";

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

    // Get all users
    $stmt = $pdo->query("SELECT id, name, email, password FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h3>Users in database:</h3>";
    if (count($users) === 0) {
        echo "No users found<br>";
    } else {
        foreach ($users as $user) {
            echo "<pre>";
            echo "ID: " . $user['id'] . "\n";
            echo "Name: " . $user['name'] . "\n";
            echo "Email: " . $user['email'] . "\n";
            echo "Password hash: " . substr($user['password'], 0, 20) . "...\n";
            echo "</pre>";
        }
    }

    echo "<br><h3>Test password verification:</h3>";
    if (count($users) > 0) {
        $testUser = $users[0];
        $testPasswords = ['password', 'test123', 'admin', 'password123'];
        
        foreach ($testPasswords as $testPass) {
            $result = password_verify($testPass, $testUser['password']) ? "✓ Match" : "✗ No match";
            echo "Password '$testPass': $result<br>";
        }
    }

} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>
