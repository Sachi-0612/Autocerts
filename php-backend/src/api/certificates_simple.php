<?php
// src/api/certificates_simple.php - Simplified certificates endpoint

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

    // Get all certificates (simplified - no user filtering for now)
    $stmt = $pdo->query("SELECT id, template_data, certificate_data, created_at FROM certificates ORDER BY created_at DESC");
    $certificates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return certificates data
    echo json_encode([
        'success' => true,
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
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>