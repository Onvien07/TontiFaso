<?php
require_once 'backend/config/database.php';

try {
    echo "Starting migrations...\n";

    // Add description to contributions
    echo "Adding 'description' column to 'contributions' table...\n";
    $pdo->exec("ALTER TABLE contributions ADD COLUMN description TEXT AFTER contribution_date");
    echo "Success.\n";

    // Add description to transactions
    echo "Adding 'description' column to 'transactions' table...\n";
    $pdo->exec("ALTER TABLE transactions ADD COLUMN description TEXT AFTER amount");
    echo "Success.\n";

    echo "Migrations completed successfully.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>