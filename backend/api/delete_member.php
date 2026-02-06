<?php
// backend/api/delete_member.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing member ID."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Delete dependencies first (contributions, member records, etc.)
        // Delete from 'members' table
        $stmt = $pdo->prepare("DELETE FROM members WHERE user_id = ?");
        $stmt->execute([$id]);

        // Delete from 'contributions' table
        $stmt = $pdo->prepare("DELETE FROM contributions WHERE user_id = ?");
        $stmt->execute([$id]);

        // Finally delete the user
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Member and associated data deleted successfully."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Deletion failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>