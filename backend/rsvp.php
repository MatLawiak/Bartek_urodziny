<?php
// ============================================================
//  BARTEK 40 — backend RSVP
//  Plik: backend/rsvp.php
//
//  KONFIGURACJA (tylko 2 rzeczy do zmiany):
//  1. Zmień NOTIFY_EMAIL na swój adres e-mail
//  2. Wgraj folder "backend/" na serwer hosting
//  3. W js/config.js ustaw BACKEND_URL na:
//     'https://twoja-domena.pl/backend/rsvp.php'
//
//  Dane gości zapisywane są w pliku rsvp_data.json
//  (tworzony automatycznie przy pierwszym zgłoszeniu)
// ============================================================

// ── KONFIGURACJA ────────────────────────────────────────────
define('NOTIFY_EMAIL', 'WPISZ_SWOJ_EMAIL@example.com');
define('DATA_FILE',    __DIR__ . '/rsvp_data.json');
define('ADMIN_KEY',    'urodziny');        // klucz do listy gości
// ────────────────────────────────────────────────────────────

// CORS — zezwól na wywołania z dowolnej domeny
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── HELPERS ─────────────────────────────────────────────────

function loadData(): array {
    if (!file_exists(DATA_FILE)) return [];
    $raw = file_get_contents(DATA_FILE);
    return json_decode($raw, true) ?: [];
}

function saveData(array $data): void {
    file_put_contents(
        DATA_FILE,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

function out(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function clean(string $str): string {
    return trim(strip_tags($str));
}

// ── ROUTING ─────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ── POST: nowe RSVP ─────────────────────────────────────────
if ($method === 'POST') {

    $body = json_decode(file_get_contents('php://input'), true);

    $firstName  = clean($body['firstName']  ?? '');
    $lastName   = clean($body['lastName']   ?? '');
    $companions = max(0, intval($body['companions'] ?? 0));

    if ($firstName === '' || $lastName === '') {
        out(['success' => false, 'error' => 'Brak imienia lub nazwiska'], 400);
    }

    $rsvps = loadData();

    $entry = [
        'timestamp'  => date('Y-m-d H:i:s'),
        'firstName'  => $firstName,
        'lastName'   => $lastName,
        'companions' => $companions,
        'total'      => 1 + $companions,
    ];

    $rsvps[] = $entry;
    saveData($rsvps);

    // Łączna liczba osób po dodaniu
    $totalPeople = array_sum(array_column($rsvps, 'total'));

    // ── E-mail powiadomienie ─────────────────────────────────
    $subject = "=?UTF-8?B?" . base64_encode("🎉 RSVP Bartek 40: {$firstName} {$lastName} potwierdza!") . "?=";

    $message  = "NOWE POTWIERDZENIE OBECNOŚCI\n";
    $message .= str_repeat('─', 36) . "\n\n";
    $message .= "Imię:               {$firstName}\n";
    $message .= "Nazwisko:           {$lastName}\n";
    $message .= "Osoby towarzyszące: {$companions}\n";
    $message .= "Łącznie osób:       {$entry['total']}\n\n";
    $message .= "Data potwierdzenia: {$entry['timestamp']}\n\n";
    $message .= str_repeat('─', 36) . "\n";
    $message .= "Łączna liczba gości: {$totalPeople}\n";

    $headers  = "From: rsvp@bartek40.pl\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    @mail(NOTIFY_EMAIL, $subject, $message, $headers);

    out(['success' => true, 'total' => $totalPeople]);
}

// ── GET: licznik (publiczny) ─────────────────────────────────
if ($method === 'GET' && $action === 'count') {
    $rsvps  = loadData();
    $people = array_sum(array_column($rsvps, 'total'));
    out(['rsvps' => count($rsvps), 'people' => $people]);
}

// ── GET: lista gości (chroniony kluczem) ────────────────────
if ($method === 'GET' && $action === 'list') {
    $key = $_GET['key'] ?? '';

    if ($key !== ADMIN_KEY) {
        out(['error' => 'Brak dostępu'], 403);
    }

    $rsvps = loadData();
    out(['list' => $rsvps]);
}

// ── Domyślnie ────────────────────────────────────────────────
out(['error' => 'Nieznana akcja'], 400);
