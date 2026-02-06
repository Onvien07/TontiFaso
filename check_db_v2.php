<?php
require_once 'backend/config/database.php';

function checkTable($pdo, $table)
{
    echo "\n--- $table ---\n";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        while ($row = $stmt->fetch()) {
            echo "{$row['Field']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

$tables = ['contributions', 'transactions', 'loans', 'guarantees', 'payments'];
foreach ($tables as $t) {
    checkTable($pdo, $t);
}
?>