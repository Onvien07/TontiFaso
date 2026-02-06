<?php
// backend/api/add_payment.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $loan_id = $_POST['loanId'] ?? null;
    $tontine_id = $_POST['tontineId'] ?? null;
    $member_id = $_POST['memberId'] ?? 0;
    $amount = $_POST['amount'] ?? 0;
    $payment_date = $_POST['date'] ?? date('Y-m-d');
    $type = $_POST['type'] ?? 'repayment'; // Default to repayment for loans

    if ($amount <= 0 || (!$loan_id && !$tontine_id)) {
        echo json_encode(["success" => false, "message" => "Missing or invalid payment data."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Insert into payments
        $stmt = $pdo->prepare("INSERT INTO payments (tontine_id, loan_id, beneficiary_id, amount, payment_date, type) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$tontine_id, $loan_id, $member_id, $amount, $payment_date, $type]);

        // 2. Insert transaction
        $stmt_trans = $pdo->prepare("INSERT INTO transactions (user_id, tontine_id, type, amount, description) VALUES (?, ?, ?, ?, ?)");
        $desc = ($type === 'repayment' ? "Loan Repayment" : "Tontine Payout");
        $stmt_trans->execute([$member_id, $tontine_id, $type, $amount, $desc]);

        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Payment recorded successfully."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Failed to record payment: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>