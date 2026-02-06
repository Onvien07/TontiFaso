<?php
// check_all_data.php
require_once 'backend/config/database.php';

$tables = ['users', 'members', 'contributions', 'loans', 'payments', 'guarantees', 'transactions', 'tontines'];

foreach ($tables as $table) {
    echo "--- TABLE: $table ---\n";
    try {
        // Check schema
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Columns: " . implode(', ', $columns) . "\n";

        // Fetch data
        $stmt = $pdo->query("SELECT * FROM $table");
        $results = $stmt->fetchAll();
        echo "Count: " . count($results) . "\n";
        if (count($results) > 0) {
            print_r($results);
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
?>