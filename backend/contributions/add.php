<?php
// backend/contributions/add.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tontine_id = $_POST['tontine_id'] ?? 0;
    $amount = $_POST['amount'] ?? 0;
    $contribution_date = $_POST['contribution_date'] ?? date('Y-m-d');
    $description = $_POST['description'] ?? "Contribution to tontine #$tontine_id";
    // Allow admin to specify user_id, otherwise use current session
    $user_id = $_POST['member_id'] ?? $_SESSION['user_id'];

    if ($tontine_id <= 0 || $amount <= 0 || $user_id <= 0) {
        echo json_encode(["success" => false, "message" => "Missing required data or invalid amount."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Add contribution
        $stmt = $pdo->prepare("INSERT INTO contributions (user_id, tontine_id, amount, contribution_date, description, status) VALUES (?, ?, ?, ?, ?, 'paid')");
        $stmt->execute([$user_id, $tontine_id, $amount, $contribution_date, $description]);

        // 2. Add transaction
        $stmt_trans = $pdo->prepare("INSERT INTO transactions (user_id, tontine_id, type, amount, description) VALUES (?, ?, 'contribution', ?, ?)");
        $stmt_trans->execute([$user_id, $tontine_id, $amount, $description]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Contribution recorded and transaction created."
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Contribution failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>