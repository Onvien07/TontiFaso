<?php
// backend/auth/login.php
header('Content-Type: application/json');
require_once '../config/database.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Email and password are required."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['fullname'] = $user['fullname'];
            $_SESSION['role'] = $user['role'];

            echo json_encode([
                "success" => true,
                "message" => "Login successful.",
                "data" => [
                    "id" => $user['id'],
                    "fullname" => $user['fullname'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Login failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>