<?php
// backend/tontines/create.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $amount = $_POST['amount'] ?? 0;
    $frequency = $_POST['frequency'] ?? 'monthly';
    $start_date = $_POST['start_date'] ?? date('Y-m-d');
    $created_by = $_SESSION['user_id'];

    if (empty($name) || $amount <= 0) {
        echo json_encode(["success" => false, "message" => "Name and a valid amount are required."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO tontines (name, amount, frequency, start_date, created_by) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $amount, $frequency, $start_date, $created_by]);
        $tontine_id = $pdo->lastInsertId();

        // Optionally add the creator as a member automatically
        $stmt_member = $pdo->prepare("INSERT INTO members (user_id, tontine_id) VALUES (?, ?)");
        $stmt_member->execute([$created_by, $tontine_id]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Tontine created successfully.",
            "data" => ["id" => $tontine_id]
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Creation failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>