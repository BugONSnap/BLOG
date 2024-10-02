<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bolgdb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode(array("error" => "Connection failed: " . $conn->connect_error));
    exit();
}

$path = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$unique_id = end($path);

if ($unique_id) {
    $unique_id = $conn->real_escape_string($unique_id);
    $sql = "SELECT email FROM users WHERE unique_id = '$unique_id'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(array("email" => $row['email']));
    } else {
        error_log("No user found with the given unique ID");
        echo json_encode(array("error" => "No user found with the given unique ID"));
    }
} else {
    error_log("Unique ID not provided");
    echo json_encode(array("error" => "Unique ID not provided"));
}

$conn->close();
?>