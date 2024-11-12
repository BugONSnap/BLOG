<?php
// CORS headers and other initial setup
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


// Database connection setup
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

// Get the data from the request
$data = json_decode(file_get_contents("php://input"), true);

// Log the received data for debugging
error_log(print_r($data, true));

if (isset($data['article_id'])) {
    $article_id = $conn->real_escape_string($data['article_id']);
    $title = isset($data['title']) ? $conn->real_escape_string($data['title']) : null;
    $summary = isset($data['summary']) ? $conn->real_escape_string($data['summary']) : null;
    $profile_image_url = isset($data['profile_image_url']) ? $conn->real_escape_string($data['profile_image_url']) : null;
    $article_image = isset($data['article_image']) ? $conn->real_escape_string($data['article_image']) : null;

    // Prepare the SQL statement with placeholders
    $sql = "UPDATE articles SET ";
    $params = [];
    $types = "";

    if ($title !== null) {
        $sql .= "title = ?, ";
        $params[] = $title;
        $types .= "s";
    }
    if ($summary !== null) {
        $sql .= "summary = ?, ";
        $params[] = $summary;
        $types .= "s";
    }
    if ($profile_image_url !== null) {
        $sql .= "profile_image_url = ?, ";
        $params[] = $profile_image_url;
        $types .= "s";
    }
    if ($article_image !== null) {
        $sql .= "article_image = ?, ";
        $params[] = $article_image;
        $types .= "s";
    }

    $sql = rtrim($sql, ", ") . " WHERE id = ?";
    $params[] = $article_id;
    $types .= "i";

    // Log the SQL query and parameters for debugging
    error_log("SQL Query: " . $sql);
    error_log("Parameters: " . print_r($params, true));

    // Initialize the statement
    $stmt = $conn->prepare($sql);

    // Bind the parameters to the statement
    $stmt->bind_param($types, ...$params);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(["message" => "Article updated successfully"]);
    } else {
        error_log("SQL Error: " . $stmt->error);
        echo json_encode(["error" => "Failed to update article"]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
}
?>
