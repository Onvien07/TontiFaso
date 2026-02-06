<?php
// backend/config/database.php

$host = 'localhost'; // Use 'db' if running inside Docker with docker-compose
$db = 'tontifaso';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "message" => "Connection failed: " . $e->getMessage()
    ]);
    exit;
}
?>