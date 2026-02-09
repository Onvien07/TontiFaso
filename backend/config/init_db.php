<?php
// backend/config/init_db.php
require_once __DIR__ . '/database.php';

try {
    echo "Starting database initialization...\n";

    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            address TEXT,
            join_date DATE
        )",
        "CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            tontine_id INT,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS tontines (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS contributions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            tontine_id INT,
            amount DECIMAL(15,2),
            contribution_date DATE,
            description TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            tontine_id INT,
            type VARCHAR(50),
            amount DECIMAL(15,2),
            transaction_date DATE,
            description TEXT
        )",
        "CREATE TABLE IF NOT EXISTS loans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT,
            principal DECIMAL(15,2),
            interest_rate DECIMAL(5,2),
            duration INT,
            start_date DATE,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS guarantees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            loan_id INT,
            type VARCHAR(100),
            value DECIMAL(15,2),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            loan_id INT,
            tontine_id INT,
            beneficiary_id INT,
            amount DECIMAL(15,2),
            payment_date DATE,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(255),
            message TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    ];

    foreach ($queries as $query) {
        $pdo->exec($query);
        echo "Executed query successfully.\n";
    }

    // Insert dummy tontine if none exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tontines");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO tontines (name, description) VALUES ('Tontine Principale', 'La tontine par défaut pour tous les membres.')");
        echo "Default tontine created.\n";
    }

    echo "Database initialization completed successfully.\n";
} catch (PDOException $e) {
    echo "Database initialization failed: " . $e->getMessage() . "\n";
}
