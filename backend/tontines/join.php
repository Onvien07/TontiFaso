<?php
// backend/tontines/join.php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../utils/auth_check.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tontine_id = $_POST['tontine_id'] ?? 0;
    $user_id = $_SESSION['user_id'];

    if ($tontine_id <= 0) {
        echo json_encode(["success" => false, "message" => "Invalid tontine ID."]);
        exit;
    }

    try {
        // Check if already a member
        $stmt_check = $pdo->prepare("SELECT id FROM members WHERE user_id = ? AND tontine_id = ?");
        $stmt_check->execute([$user_id, $tontine_id]);
        if ($stmt_check->fetch()) {
            echo json_encode(["success" => false, "message" => "Already a member of this tontine."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO members (user_id, tontine_id) VALUES (?, ?)");
        $stmt->execute([$user_id, $tontine_id]);

        echo json_encode([
            "success" => true,
            "message" => "Joined tontine successfully."
        ]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Join failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>