<?php
// backend/auth/register.php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullname = $_POST['fullname'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $first_name = $_POST['firstName'] ?? '';
    $last_name = $_POST['lastName'] ?? '';
    $address = $_POST['address'] ?? '';
    $join_date = $_POST['joinDate'] ?? date('Y-m-d');

    if (empty($fullname) || empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All required fields must be filled."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (fullname, email, password, phone, first_name, last_name, address, join_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$fullname, $email, $hashed_password, $phone, $first_name, $last_name, $address, $join_date, 'user']);

        echo json_encode([
            "success" => true,
            "message" => "User registered successfully."
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(["success" => false, "message" => "Email already exists."]);
        } else {
            echo json_encode(["success" => false, "message" => "Registration failed: " . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>