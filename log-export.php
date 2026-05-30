<?php
header('Content-Type: application/json');

$allowed = ['play', 'image', 'video'];
$type = $_POST['type'] ?? '';

if (!in_array($type, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid export type']);
    exit;
}

$file = __DIR__ . '/export-log.json';

$data = [
    'play' => 0,
    'image' => 0,
    'video' => 0,
    'play_settings' => [],
    'languages' => []
];

if (file_exists($file)) {
    $json = file_get_contents($file);
    $decoded = json_decode($json, true);

    if (is_array($decoded)) {
        $data = array_merge($data, $decoded);
    }
}

$data[$type]++;

if ($type === 'play') {

    $mode = $_POST['mode'] ?? 'unknown';
    $years = $_POST['years'] ?? 'unknown';
    $per = $_POST['per'] ?? 'unknown';
    $layer = $_POST['layer'] ?? 'unknown';
    $language = $_POST['language'] ?? 'unknown';

    $key =
        "mode={$mode}" .
        "|years={$years}" .
        "|per={$per}" .
        "|layer={$layer}";

    if (!isset($data['play_settings'][$key])) {
        $data['play_settings'][$key] = 0;
    }

    $data['play_settings'][$key]++;

    if (!isset($data['languages'][$language])) {
        $data['languages'][$language] = 0;
    }

    $data['languages'][$language]++;
}

$result = file_put_contents(
    $file,
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($result === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Cannot write export-log.json',
        'path' => $file
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'type' => $type,
    'count' => $data[$type]
]);
