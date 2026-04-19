<?php
// src/api/create_certificate_simple.php - Simplified create certificate endpoint

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['template_data']) || !isset($data['certificate_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Template data and certificate data are required']);
    exit;
}

try {
    // Connect to SQLite database
    $pdo = new PDO('sqlite:' . $_ENV['DB_PATH']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create certificates table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_data TEXT NOT NULL,
        certificate_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Insert new certificate (using user_id 1 for demo)
    $stmt = $pdo->prepare("INSERT INTO certificates (user_id, template_data, certificate_data) VALUES (?, ?, ?)");
    $stmt->execute([
        1, // Demo user ID
        json_encode($data['template_data']),
        json_encode($data['certificate_data'])
    ]);

    $certificateId = $pdo->lastInsertId();

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Certificate created successfully',
        'certificate_id' => $certificateId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>