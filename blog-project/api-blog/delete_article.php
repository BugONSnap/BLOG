<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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

if (isset($data['article_id']) && isset($data['author_unique_id'])) {
    $article_id = $conn->real_escape_string($data['article_id']);
    $author_unique_id = $conn->real_escape_string($data['author_unique_id']);

    // Prepare the SQL statement with placeholders
    $sql = "DELETE FROM articles WHERE id = ? AND author_unique_id = ?";

    // Initialize the statement
    $stmt = $conn->prepare($sql);

    // Bind the parameters to the statement
    $stmt->bind_param("is", $article_id, $author_unique_id);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(["message" => "Article deleted successfully"]);
    } else {
        echo json_encode(["error" => "Failed to delete article"]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["error" => "Invalid input"]);
}
?>