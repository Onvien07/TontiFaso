<?php
// backend/payments/pay.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Only admins can trigger payouts in a real system, but we follow the simplified logic
    $tontine_id = $_POST['tontine_id'] ?? 0;
    $beneficiary_id = $_POST['beneficiary_id'] ?? 0;
    $amount = $_POST['amount'] ?? 0;
    $payment_date = $_POST['payment_date'] ?? date('Y-m-d');

    if ($tontine_id <= 0 || $beneficiary_id <= 0 || $amount <= 0) {
        echo json_encode(["success" => false, "message" => "Missing required data."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Record payment
        $stmt = $pdo->prepare("INSERT INTO payments (tontine_id, beneficiary_id, amount, payment_date) VALUES (?, ?, ?, ?)");
        $stmt->execute([$tontine_id, $beneficiary_id, $amount, $payment_date]);

        // 2. Create transaction for the beneficiary
        $stmt_trans = $pdo->prepare("INSERT INTO transactions (user_id, tontine_id, type, amount, description) VALUES (?, ?, 'payment', ?, ?)");
        $description = "Payout from tontine #$tontine_id";
        $stmt_trans->execute([$beneficiary_id, $tontine_id, $amount, $description]);

        // 3. Create notification for the beneficiary
        $stmt_notif = $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
        $message = "You have received a payout of $amount FCFA from the tontine!";
        $stmt_notif->execute([$beneficiary_id, $message]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Payment successful, transaction and notification created."
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Payment failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>