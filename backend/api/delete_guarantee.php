<?php
// backend/api/delete_guarantee.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing guarantee ID."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM guarantees WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["success" => true, "message" => "Guarantee deleted."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Deletion failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>