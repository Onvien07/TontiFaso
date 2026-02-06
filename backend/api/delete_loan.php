<?php
// backend/api/delete_loan.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing loan ID."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Delete associated payments
        $stmt = $pdo->prepare("DELETE FROM payments WHERE loan_id = ?");
        $stmt->execute([$id]);

        // Delete associated guarantees
        $stmt = $pdo->prepare("DELETE FROM guarantees WHERE loan_id = ?");
        $stmt->execute([$id]);

        // Delete the loan
        $stmt = $pdo->prepare("DELETE FROM loans WHERE id = ?");
        $stmt->execute([$id]);

        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Loan and associated data deleted."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Deletion failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>