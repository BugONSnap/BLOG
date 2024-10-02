<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight request
    exit(0);
}

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

$target_dir = "uploads/"; // Ensure this is the correct path relative to the script
if (!is_dir($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (isset($_FILES['file'])) {
    $target_file = $target_dir . basename($_FILES['file']['name']);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Check if image file is a actual image or fake image
    $check = getimagesize($_FILES['file']['tmp_name']);
    if ($check !== false) {
        if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
            error_log("File uploaded successfully: " . $target_file); // Log successful upload
            $file_path = $conn->real_escape_string($target_file);
            $sql = "INSERT INTO images (file_path) VALUES ('$file_path')";
            if ($conn->query($sql) === TRUE) {
                $image_id = $conn->insert_id;
                // Return the URL relative to the web server root
                $image_url = "http://localhost/api-blog/" . $target_file;
                echo json_encode(["message" => "Image uploaded successfully", "url" => $image_url, "image_id" => $image_id]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error storing image metadata: " . $conn->error]);
            }
        } else {
            error_log("Error uploading file: " . $_FILES['file']['error']); // Log upload error
            http_response_code(500);
            echo json_encode(["error" => "Sorry, there was an error uploading your file."]);
        }
    } else {
        error_log("File is not an image: " . $_FILES['file']['tmp_name']); // Log invalid image
        http_response_code(400);
        echo json_encode(["error" => "File is not an image."]);
    }
} else {
    error_log("No file was uploaded."); // Log missing file
    http_response_code(400);
    echo json_encode(["error" => "No file was uploaded."]);
}

$conn->close();
?>