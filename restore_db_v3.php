<?php
// restore_db_v3.php
require_once 'backend/config/database.php';

try {
    echo "Starting full database restoration...\n";

    // 1. Drop existing tables to ensure new schema is applied
    echo "Dropping existing tables...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $tables_to_drop = ['users', 'members', 'tontines', 'contributions', 'loans', 'transactions', 'payments', 'guarantees'];
    foreach ($tables_to_drop as $t) {
        $pdo->exec("DROP TABLE IF EXISTS $t");
    }
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Re-initialize basic tables
    echo "Initializing basic tables...\n";
    include 'backend/config/init_db.php';

    // 3. Clear existing data to avoid duplicates during restoration
    echo "Cleaning tables...\n";
    $tables = ['users', 'contributions', 'loans', 'transactions', 'payments', 'guarantees'];
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    foreach ($tables as $t) {
        $pdo->exec("TRUNCATE TABLE $t");
    }
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 4. Restore Users
    echo "Restoring users...\n";
    $users = [
        [3, 'Steve TO', 'tosteve6@gmail.com', '06265730', '$2y$10$02bm6l2rz7zhdmB2eohkFuG2UW9AdTIU0mwqzO5h/bSe4eHPlwuna', 'user', '2026-02-03 18:57:35', 'Steve', 'TO', 'Blvd Charles De Gaulle', '2026-02-03'],
        [4, 'Fati Sawadogo', 'Fati12@gmail.com', '04567849', '$2y$10$epkoaZf/y3sdYUh27Hdne.LVPgFXC7saiuQSekOE.2PBysOwAtzkG', 'user', '2026-02-03 19:33:15', 'Fati', 'Sawadogo', 'Ouagadougou, Karpala', '2026-02-03'],
        [5, 'Verification User', 'verify@example.com', '555', 'pass', 'user', '2026-02-03 19:49:57', 'Verify', 'User', 'Test Address', '2024-01-01'],
        [6, 'Ernest Badolo', 'Ernerst@gmail.com', '78456734', '$2y$10$35SS7Hgr53UnLf8YcfilsO/eKiFx6u9Sj1dqhiN86erzA5LMUz//G', 'user', '2026-02-03 20:06:41', 'Ernest', 'Badolo', 'Karpala, Ouagadoudou', '2026-02-03'],
        [7, 'Fati Ouedraogo', 'Fati61@gmail.com', '78987654', '$2y$10$MJRxcDAXlVhwCbm5cTFlBe87zKkMNE89zr.n.t/fsofjdQlnEzuaC', 'user', '2026-02-04 12:37:42', 'Fati', 'Ouedraogo', 'Koudougou, secteur 7', '2026-02-04']
    ];

    $stmt = $pdo->prepare("INSERT INTO users (id, fullname, email, phone, password, role, created_at, first_name, last_name, address, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($users as $u) {
        $stmt->execute($u);
    }

    // 5. Restore Contributions
    echo "Restoring contributions...\n";
    $contributions = [
        [1, 3, 1, 2000000.00, '2026-02-04', 'Terrain', 'paid', '2026-02-04 12:38:08'],
        [2, 3, 1, 99999999.99, '2026-02-04', 'Terrain', 'paid', '2026-02-04 12:38:37']
    ];
    $stmt = $pdo->prepare("INSERT INTO contributions (id, user_id, tontine_id, amount, contribution_date, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($contributions as $c) {
        $stmt->execute($c);
    }

    // 6. Restore Loans
    echo "Restoring loans...\n";
    $loans = [
        [1, 5, 100000.00, 5.00, 12, '2024-02-01', 'Test Loan', 'active', '2026-02-03 19:49:57']
    ];
    $stmt = $pdo->prepare("INSERT INTO loans (id, member_id, principal, interest_rate, duration, start_date, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($loans as $l) {
        $stmt->execute($l);
    }

    // 7. Restore Transactions
    echo "Restoring transactions...\n";
    $transactions = [
        [1, 3, 1, 'contribution', 2000000.00, '2026-02-04 12:38:08', 'Terrain'],
        [2, 3, 1, 'contribution', 99999999.99, '2026-02-04 12:38:37', 'Terrain']
    ];
    $stmt = $pdo->prepare("INSERT INTO transactions (id, user_id, tontine_id, type, amount, transaction_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($transactions as $t) {
        $stmt->execute($t);
    }

    // 8. Restore Admin User (id 1)
    echo "Restoring admin user...\n";
    $admin_pass = password_hash('admin123', PASSWORD_DEFAULT);
    $pdo->exec("INSERT IGNORE INTO users (id, fullname, email, password, role) VALUES (1, 'Administrateur', 'admin@tontifaso.com', '$admin_pass', 'admin')");

    echo "Restoration completed successfully!\n";

} catch (Exception $e) {
    echo "Restoration failed: " . $e->getMessage() . "\n";
}
