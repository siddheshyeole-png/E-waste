<?php
// php/config/db.php
// MySQL database connection using MySQLi (Web Technologies Practical Style)

// Disable automatic MySQLi exception throwing to allow manual error checking ($conn->connect_error)
mysqli_report(MYSQLI_REPORT_OFF);

// Default Database Server Configuration
$host = "localhost";
$user = "root";
$password = ""; // Enter your local MySQL password here if required
$database = "e_waste_db";

// Optional: Auto-detect credentials from backend/.env if available
$envPath = __DIR__ . '/../../backend/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if ($key === 'DB_PASSWORD' && $val !== 'your_mysql_password') {
                $password = $val;
            } elseif ($key === 'DB_HOST') {
                $host = $val;
            } elseif ($key === 'DB_USER') {
                $user = $val;
            } elseif ($key === 'DB_NAME') {
                $database = $val;
            }
        }
    }
}

// 1. Create a MySQLi connection object
$conn = @new mysqli($host, $user, $password, $database);

// 2. Check for connection errors
$db_error = false;
$db_error_message = '';

if ($conn->connect_error) {
    $db_error = true;
    $db_error_message = "Could not connect to MySQL database '$database'. Please ensure MySQL is running and set your password in php/config/db.php or backend/.env.";
} else {
    // Set character set to UTF-8
    $conn->set_charset("utf8mb4");
}
?>
