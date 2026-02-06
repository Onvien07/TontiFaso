<?php
// migrate_payments.php
require_once 'backend/config/database.php';

try {
    $pdo->exec("ALTER TABLE payments ADD COLUMN loan_id INT AFTER tontine_id");
    $pdo->exec("ALTER TABLE payments ADD COLUMN type VARCHAR(50) DEFAULT 'repayment' AFTER payment_date");
    echo "Migration successful: loan_id and type added to payments table.\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>