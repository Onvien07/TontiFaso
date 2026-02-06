<?php
// backend/api/delete_deposit.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing deposit ID."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM contributions WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["success" => true, "message" => "Deposit deleted."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Deletion failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>