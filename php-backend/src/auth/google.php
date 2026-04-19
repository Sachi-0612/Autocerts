<?php
// src/auth/google.php

require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;

// Initialize Google Client
$client = new Google\Client();
$client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
$client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
$client->setRedirectUri($_ENV['GOOGLE_REDIRECT_URI'] ?? 'http://localhost/autocerts-api/auth/google/callback');
$client->addScope('email');
$client->addScope('profile');

// Generate authorization URL
$authUrl = $client->createAuthUrl();

// Redirect to Google OAuth
header('Location: ' . $authUrl);
exit;
?>