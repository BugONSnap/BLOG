<?php
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

try {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Log the received data
    error_log("Received data: " . print_r($data, true));

    if (isset($data['id'])) {
        $article_id = $conn->real_escape_string($data['id']);
        $title = isset($data['title']) ? $conn->real_escape_string($data['title']) : null;
        $summary = isset($data['summary']) ? $conn->real_escape_string($data['summary']) : null;
        $profile_image_url = isset($data['profile_image_url']) ? $conn->real_escape_string($data['profile_image_url']) : null;
        $author_unique_id = isset($data['author_unique_id']) ? $conn->real_escape_string($data['author_unique_id']) : null;
        $image_id = isset($data['image_id']) ? $conn->real_escape_string($data['image_id']) : null;

        // Log the processed data
        error_log("Processed data: article_id=$article_id, title=$title, summary=$summary, profile_image_url=$profile_image_url, author_unique_id=$author_unique_id, image_id=$image_id");

        if ($title && $summary && $profile_image_url && $author_unique_id) {
            $stmt = $conn->prepare("UPDATE articles SET title = ?, summary = ?, profile_image_url = ?, author_unique_id = ?, image_id = ? WHERE id = ?");
            if (!$stmt) {
                throw new Exception("Prepare statement failed: " . $conn->error);
            }
            $stmt->bind_param("sssssi", $title, $summary, $profile_image_url, $author_unique_id, $image_id, $article_id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Article updated successfully"]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Failed to update article"]);
            }

            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid article ID"]);
    }

    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    error_log("Error: " . $e->getMessage());
}
?>