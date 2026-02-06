<?php
// backend/tontines/list.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

try {
    // List all tontines with creator names
    $stmt = $pdo->query("SELECT t.*, u.fullname as creator_name FROM tontines t JOIN users u ON t.created_by = u.id ORDER BY t.created_at DESC");
    $tontines = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $tontines
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Fetch failed: " . $e->getMessage()]);
}
?>