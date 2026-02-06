<?php
// backend/api/add_loan.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $member_id = $_POST['memberId'] ?? 0;
    $principal = $_POST['principal'] ?? 0;
    $interest_rate = $_POST['interestRate'] ?? 0;
    $duration = $_POST['duration'] ?? 0;
    $start_date = $_POST['startDate'] ?? date('Y-m-d');
    $description = $_POST['description'] ?? '';

    if ($member_id <= 0 || $principal <= 0 || $duration <= 0) {
        echo json_encode(["success" => false, "message" => "Missing or invalid required data."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO loans (member_id, principal, interest_rate, duration, start_date, description, status) VALUES (?, ?, ?, ?, ?, ?, 'active')");
        $stmt->execute([$member_id, $principal, $interest_rate, $duration, $start_date, $description]);

        echo json_encode(["success" => true, "message" => "Loan created successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Failed to create loan: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>