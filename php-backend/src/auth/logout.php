<?php
// src/auth/logout.php

session_start();

// Clear session data
$_SESSION = array();

// Destroy the session
session_destroy();

// Clear any cookies if needed
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Return success response
http_response_code(200);
echo json_encode(['message' => 'Logged out successfully']);
?>