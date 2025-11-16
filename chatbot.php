<?php
// Aktifkan CORS agar bisa diakses dari browser lokal
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Tangani preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ambil input JSON dari client
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);
$userMessage = $data["message"] ?? "";

if (!$userMessage) {
    echo json_encode(["reply" => "⚠️ Pesan kosong tidak bisa diproses."]);
    exit;
}

$API_KEY = "AIzaSyCbZWRtBFEQJcqvg57k9XZjiZqK1bacz6A"; // 🔑 API key Gemini
$MODEL = "gemini-2.0-flash"; // versi model
$URL = "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent?key=$API_KEY";

// Buat payload request
$payload = json_encode([
    "contents" => [
        [
            "parts" => [
                ["text" => $userMessage]
            ]
        ]
    ]
]);

// Kirim ke Gemini API
$ch = curl_init($URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => $payload,
]);
$response = curl_exec($ch);

// Tangani error koneksi
if (curl_errno($ch)) {
    echo json_encode(["reply" => "⚠️ Gagal terhubung ke server Gemini."]);
    curl_close($ch);
    exit;
}
curl_close($ch);

// Parse respons dari Gemini
$data = json_decode($response, true);
if (isset($data["candidates"][0]["content"]["parts"][0]["text"])) {
    $reply = $data["candidates"][0]["content"]["parts"][0]["text"];
} else {
    $reply = "⚠️ Tidak ada respons dari Gemini.";
}

echo json_encode(["reply" => $reply]);
?>