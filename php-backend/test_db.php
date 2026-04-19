<?php
// Simple test script to verify SQLite database connection

// Load environment variables manually for testing
$_ENV['DB_PATH'] = '../database/autocerts.db';

try {
    // Connect to SQLite database
    $dbPath = __DIR__ . '/' . $_ENV['DB_PATH'];
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

    echo "Database connection successful!\n";
    echo "Database file: $dbPath\n";

    // Test inserting a user
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->execute(['Test User', 'test@example.com', password_hash('password123', PASSWORD_DEFAULT)]);

    echo "Test user inserted successfully!\n";

    // Test retrieving the user
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->execute(['test@example.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "User retrieved: " . json_encode($user) . "\n";
    }

    echo "All tests passed!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>