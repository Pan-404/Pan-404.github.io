<?php
declare(strict_types=1);

$code = strtoupper((string) ($_GET['c'] ?? ''));

if (!preg_match('/^[0-9A-Z]{3,12}$/', $code)) {
    http_response_code(404);
    echo 'Short link not found.';
    exit;
}

try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/data/links.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $select = $pdo->prepare('SELECT url FROM links WHERE code = :code LIMIT 1');
    $select->execute([':code' => $code]);
    $url = $select->fetchColumn();

    if (!$url) {
        http_response_code(404);
        echo 'Short link not found.';
        exit;
    }

    $update = $pdo->prepare('UPDATE links SET clicks = clicks + 1 WHERE code = :code');
    $update->execute([':code' => $code]);

    header('Location: ' . $url, true, 302);
    exit;
} catch (Throwable $error) {
    http_response_code(500);
    echo 'Shortener error.';
}
