<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    exit(0);
}


// Set upload limits
ini_set('upload_max_filesize', '100M'); // Increase if needed
ini_set('post_max_size', '100M'); // Increase if needed
ini_set('max_input_time', 300);
ini_set('max_execution_time', 300);


$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bolgdb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['unique_id'])) {
    $unique_id = $conn->real_escape_string($data['unique_id']);

    $sql = "SELECT unique_id, username, email FROM users WHERE unique_id = '$unique_id'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode(["user" => $user]);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>