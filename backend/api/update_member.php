<?php
// backend/api/update_member.php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;
    $first_name = $_POST['firstName'] ?? '';
    $last_name = $_POST['lastName'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $join_date = $_POST['joinDate'] ?? '';

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing member ID."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET first_name = ?, last_name = ?, fullname = ?, email = ?, phone = ?, address = ?, join_date = ? WHERE id = ?");
        $fullname = "$first_name $last_name";
        $stmt->execute([$first_name, $last_name, $fullname, $email, $phone, $address, $join_date, $id]);

        echo json_encode(["success" => true, "message" => "Member updated successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>