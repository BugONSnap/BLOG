<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}


// Set upload limits
ini_set('upload_max_filesize', '100M'); // Increase if needed
ini_set('post_max_size', '100M'); // Increase if needed
ini_set('max_input_time', 300);
ini_set('max_execution_time', 300);


$target_dir = "uploads/";

if (isset($_GET['filename'])) {
    $filename = basename($_GET['filename']);
    $file_path = $target_dir . $filename;

    if (file_exists($file_path)) {
        $mime_type = mime_content_type($file_path);
        header("Content-Type: $mime_type");
        readfile($file_path);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "File not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No filename specified"]);
}
?>