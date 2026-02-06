<?php
require_once 'backend/config/database.php';

function checkTable($pdo, $table)
{
    echo "\nColumns for table: $table\n";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        while ($row = $stmt->fetch()) {
            echo "- {$row['Field']} ({$row['Type']})\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

checkTable($pdo, 'contributions');
checkTable($pdo, 'transactions');
checkTable($pdo, 'loans');
checkTable($pdo, 'guarantees');
?>