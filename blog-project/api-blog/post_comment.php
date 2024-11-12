<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit();
}

if (isset($data['article_id']) && isset($data['user_id']) && isset($data['comment'])) {
    $article_id = $conn->real_escape_string($data['article_id']);
    $user_id = $conn->real_escape_string($data['user_id']);
    $comment = $conn->real_escape_string($data['comment']);
    $created_at = date('Y-m-d H:i:s'); // Get the current timestamp

    $sql = "INSERT INTO comments (article_id, user_id, comment, created_at) VALUES ('$article_id', '$user_id', '$comment', '$created_at')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Comment added successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error adding comment: " . $conn->error]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>