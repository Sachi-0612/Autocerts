<?php
// src/api/user_simple.php - Simplified user endpoint

// For now, just return a success message
// In a real implementation, this would check authentication

echo json_encode([
    'success' => true,
    'user' => [
        'id' => 1,
        'name' => 'Demo User',
        'email' => 'demo@example.com'
    ],
    'message' => 'User data retrieved successfully'
]);
?>