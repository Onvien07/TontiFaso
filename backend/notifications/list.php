<?php
// backend/notifications/list.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $notifications = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $notifications
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Fetch failed: " . $e->getMessage()]);
}
?>