<?php
// backend/api/get_data.php
header('Content-Type: application/json');
require_once '../config/database.php';

try {
    $data = [];

    // Members (from users table - all users are treated as members for this display)
    $stmt = $pdo->query("SELECT id, first_name as firstName, last_name as lastName, email, phone, address, join_date as joinDate FROM users WHERE role != 'admin' OR id > 1");
    $data['members'] = $stmt->fetchAll();

    // Deposits (from contributions table)
    $stmt = $pdo->query("SELECT id, user_id as memberId, amount, contribution_date as date, description FROM contributions");
    $data['deposits'] = $stmt->fetchAll();

    // Loans with calculated fields for the frontend
    $stmt = $pdo->query("SELECT l.*, 
        l.member_id as memberId,
        l.start_date as startDate,
        l.interest_rate as interestRate,
        (l.principal * (1 + (l.interest_rate / 100) * l.duration)) as totalAmount,
        (l.principal * (l.interest_rate / 100) * l.duration) as totalInterest,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE loan_id = l.id) as paidAmount,
        (l.principal * (1 + (l.interest_rate / 100) * l.duration)) - (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE loan_id = l.id) as remainingBalance
        FROM loans l");
    $data['loans'] = $stmt->fetchAll();

    foreach ($data['loans'] as &$loan) {
        $loan['monthlyPayment'] = $loan['totalAmount'] / $loan['duration'];
    }

    // Guarantees
    $stmt = $pdo->query("SELECT id, loan_id as loanId, type, value, description FROM guarantees");
    $data['guarantees'] = $stmt->fetchAll();

    // Payments
    $stmt = $pdo->query("SELECT id, tontine_id as tontineId, loan_id as loanId, beneficiary_id as memberId, amount, payment_date as date, type FROM payments");
    $data['payments'] = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $data
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>