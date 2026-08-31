<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

function database(): PDO
{
    $directory = __DIR__ . '/data';

    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        fail(500, 'Could not create data directory');
    }

    $pdo = new PDO('sqlite:' . $directory . '/links.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS links (
            code TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            created_at TEXT NOT NULL,
            clicks INTEGER NOT NULL DEFAULT 0
        )'
    );
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_links_url ON links(url)');

    return $pdo;
}

function read_url(): string
{
    $body = file_get_contents('php://input') ?: '';
    $json = json_decode($body, true);
    $url = is_array($json) ? ($json['url'] ?? '') : ($_POST['url'] ?? '');
    $url = trim((string) $url);

    if ($url === '') {
        fail(400, 'Missing url');
    }

    if (strlen($url) > 4000) {
        fail(400, 'URL too long');
    }

    $parts = parse_url($url);
    $scheme = strtolower((string) ($parts['scheme'] ?? ''));

    if (!in_array($scheme, ['http', 'https'], true) || empty($parts['host'])) {
        fail(400, 'Only http and https URLs are allowed');
    }

    return $url;
}

function random_code(int $length = 5): string
{
    $alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $code = '';

    for ($index = 0; $index < $length; $index += 1) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }

    return $code;
}

function site_origin(): string
{
    $forwardedProto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $forwardedProto === 'https';
    $scheme = $isHttps ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    return strtoupper($scheme . '://' . $host);
}

try {
    $url = read_url();
    $pdo = database();

    $existing = $pdo->prepare('SELECT code FROM links WHERE url = :url LIMIT 1');
    $existing->execute([':url' => $url]);
    $code = $existing->fetchColumn();

    if (!$code) {
        $insert = $pdo->prepare('INSERT INTO links (code, url, created_at) VALUES (:code, :url, :created_at)');

        for ($attempt = 0; $attempt < 12; $attempt += 1) {
            $code = random_code($attempt > 6 ? 6 : 5);

            try {
                $insert->execute([
                    ':code' => $code,
                    ':url' => $url,
                    ':created_at' => gmdate('c')
                ]);
                break;
            } catch (PDOException $error) {
                $code = '';
            }
        }

        if (!$code) {
            fail(500, 'Could not create short link');
        }
    }

    echo json_encode([
        'url' => $url,
        'code' => $code,
        'shortUrl' => site_origin() . '/R/' . $code
    ]);
} catch (Throwable $error) {
    fail(500, 'Shortener error');
}
