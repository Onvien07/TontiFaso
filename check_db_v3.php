<?php
require_once 'backend/config/database.php';

$output = "";
function checkTable($pdo, $table)
{
    global $output;
    $output .= "\n--- $table ---\n";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        while ($row = $stmt->fetch()) {
            $output .= "{$row['Field']}\n";
        }
    } catch (Exception $e) {
        $output .= "Error: " . $e->getMessage() . "\n";
    }
}

$tables = ['contributions', 'transactions', 'loans', 'guarantees', 'payments'];
foreach ($tables as $t) {
    checkTable($pdo, $t);
}

file_put_contents('db_schema.txt', $output);
echo "Schema written to db_schema.txt\n";
?>