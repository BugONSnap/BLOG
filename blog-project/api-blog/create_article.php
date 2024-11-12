<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

if (isset($data['title']) && isset($data['summary']) && isset($data['profile_image_url']) && isset($data['author_unique_id']) && isset($data['article_image'])) {
    $title = $conn->real_escape_string($data['title']);
    $summary = $conn->real_escape_string($data['summary']);
    $profile_image_url = $conn->real_escape_string($data['profile_image_url']);
    $author_unique_id = $conn->real_escape_string($data['author_unique_id']);
    $article_image = $conn->real_escape_string($data['article_image']);

    $sql = "INSERT INTO articles (title, summary, profile_image_url, author_unique_id, article_image) VALUES ('$title', '$summary', '$profile_image_url', '$author_unique_id', '$article_image')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Article created successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error creating article: " . $conn->error]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
}

$conn->close();
?>
