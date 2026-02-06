<?php
// backend/api/add_guarantee.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $loan_id = $_POST['loanId'] ?? 0;
    $type = $_POST['type'] ?? '';
    $value = $_POST['value'] ?? 0;
    $description = $_POST['description'] ?? '';

    if ($loan_id <= 0 || empty($type) || $value <= 0) {
        echo json_encode(["success" => false, "message" => "Missing or invalid required data."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO guarantees (loan_id, type, value, description) VALUES (?, ?, ?, ?)");
        $stmt->execute([$loan_id, $type, $value, $description]);

        echo json_encode(["success" => true, "message" => "Guarantee added successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Failed to add guarantee: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>