<?php
// Prevent unauthorized access (only allow if they know the key)
if (!isset($_GET['key']) || $_GET['key'] !== 'vibe_backup_9921') {
    header('HTTP/1.0 403 Forbidden');
    echo 'Forbidden';
    exit;
}

// DB credentials - Using 127.0.0.1 for local internal connection on server
$host = '127.0.0.1';
$db = 'u615613673_vibethink_lms';
$user = 'u615613673_vibethink_lms';
$pass = 'LN7mOJS2o!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage() . "\n");
}

// Get all tables
$tables = [];
$stmt = $pdo->query("SHOW TABLES");
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    $tables[] = $row[0];
}

$sql = "-- VibeThink LMS Database Backup\n";
$sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
$sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

foreach ($tables as $table) {
    // Structure
    $stmt = $pdo->query("SHOW CREATE TABLE `$table`");
    $row = $stmt->fetch();
    $sql .= "\n\n-- Table structure for table `$table`\n";
    $sql .= "DROP TABLE IF EXISTS `$table`;\n";
    $sql .= $row['Create Table'] . ";\n\n";

    // Data
    $stmt = $pdo->query("SELECT * FROM `$table`");
    $rows = $stmt->fetchAll();
    if (count($rows) > 0) {
        $sql .= "-- Dumping data for table `$table`\n";
        foreach ($rows as $r) {
            $keys = array_keys($r);
            $values = array_values($r);
            
            $escaped_values = [];
            foreach ($values as $val) {
                if ($val === null) {
                    $escaped_values[] = 'NULL';
                } else {
                    $escaped_values[] = $pdo->quote($val);
                }
            }
            
            $sql .= "INSERT INTO `$table` (`" . implode("`, `", $keys) . "`) VALUES (" . implode(", ", $escaped_values) . ");\n";
        }
    }
}

$sql .= "\n\nSET FOREIGN_KEY_CHECKS=1;\n";

// Force download
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="u615613673_vibethink_lms.sql"');
echo $sql;

// Delete the file after execution for security
@unlink(__FILE__);
exit;
