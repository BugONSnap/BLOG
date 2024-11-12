<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Set upload limits
ini_set('upload_max_filesize', '100M');
ini_set('post_max_size', '100M');
ini_set('max_input_time', 300);
ini_set('max_execution_time', 300);

$target_dir = " Uploads/";
if (!is_dir($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (isset($_FILES['file'])) {
    $target_file = $target_dir . basename($_FILES['file']['name']);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Validate file extensions
    $valid_extensions = ["jpg", "jpeg", "png", "gif"];
    if (!in_array($imageFileType, $valid_extensions)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."]);
        exit();
    }

    $check = getimagesize($_FILES['file']['tmp_name']);
    if ($check !== false) {
        $source = imagecreatefromstring(file_get_contents($_FILES['file']['tmp_name']));
        $width = imagesx($source);
        $height = imagesy($source);
        $new_width = 800; // Set desired width
        $new_height = ($height / $width) * $new_width;
        $resized = imagecreatetruecolor($new_width, $new_height);
        imagecopyresampled($resized, $source, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

        if ($imageFileType == 'jpg' || $imageFileType == 'jpeg') {
            imagejpeg($resized, $target_file);
        } elseif ($imageFileType == 'png') {
            imagepng($resized, $target_file);
        } elseif ($imageFileType == 'gif') {
            imagegif($resized, $target_file);
        }

        imagedestroy($source);
        imagedestroy($resized);

        echo json_encode(["message" => "Image uploaded and resized successfully", "url" => "http://localhost/api-blog/" . $target_file]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Uploaded file is not a valid image."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No file was uploaded."]);
}
?>
