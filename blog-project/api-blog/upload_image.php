<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Preflight request handling for CORS
}

// Set upload limits
ini_set('upload_max_filesize', '20M');
ini_set('post_max_size', '20M');
ini_set('max_input_time', 300);
ini_set('max_execution_time', 300);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bolgdb";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$target_dir = "uploads/";
if (!is_dir($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (isset($_FILES['file'])) {
    $target_file = $target_dir . basename($_FILES['file']['name']);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Validate file extensions and image size
    $valid_extensions = ["jpg", "jpeg", "png", "gif"];
    if (!in_array($imageFileType, $valid_extensions)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."]);
        exit();
    }

    $check = getimagesize($_FILES['file']['tmp_name']);
    if ($check !== false) {
        if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
            $file_path = $conn->real_escape_string($target_file);
            $sql = "INSERT INTO images (file_path) VALUES ('$file_path')";
            if ($conn->query($sql) === TRUE) {
                $image_id = $conn->insert_id;
                $image_url = "http://localhost/api-blog/" . $target_file;
                echo json_encode(["message" => "Image uploaded successfully", "url" => $image_url, "image_id" => $image_id]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error storing image metadata: " . $conn->error]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to upload the file."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Uploaded file is not a valid image."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No file was uploaded."]);
}

$conn->close();
?>
