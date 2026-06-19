<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /');
    exit;
}

if (!empty($_POST['website'])) {
    header('Location: /');
    exit;
}

function field(string $name, int $maxLength): string
{
    $value = isset($_POST[$name]) && is_scalar($_POST[$name]) ? trim((string) $_POST[$name]) : '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value) ?? '';
    $value = strip_tags($value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }
    return substr($value, 0, $maxLength);
}

function headerSafe(string $value): string
{
    return str_replace(["\r", "\n"], '', $value);
}

$name = field('name', 120);
$email = filter_var(field('email', 254), FILTER_VALIDATE_EMAIL) ?: '';
$phone = field('phone', 40);
$message = field('message', 2000);
$adults = field('adults', 10);
$children = field('children', 10);
$checkin = field('checkin', 20);
$checkout = field('checkout', 20);
$source = field('source', 80);
$subject = headerSafe(field('subject', 100));

if ($name === '' || $phone === '') {
    header('Location: /Reserve%20Now.html?error=1');
    exit;
}

if ($email === '' && isset($_POST['email']) && trim((string) $_POST['email']) !== '') {
    header('Location: /Reserve%20Now.html?error=1');
    exit;
}

$to = 'vimalkumark@hotmail.com';
$mail_subject = 'New Enquiry from Urban Retreat Website';
if ($subject !== '') {
    $mail_subject = 'Website Enquiry: ' . $subject;
}

$body = "New enquiry from Urban Retreat website:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n";
if ($adults !== '') $body .= "Adults: $adults\n";
if ($children !== '') $body .= "Children: $children\n";
if ($checkin !== '') $body .= "Check-in: $checkin\n";
if ($checkout !== '') $body .= "Check-out: $checkout\n";
if ($source !== '') $body .= "Source: $source\n";
$body .= "\nMessage:\n$message\n";

$headers = "From: Urban Retreat <noreply@urbanretreatmangalore.com>\r\n";
$headers .= "Reply-To: " . ($email !== '' ? $email : 'noreply@urbanretreatmangalore.com') . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: UrbanRetreat/1.0";

if (!mail($to, $mail_subject, $body, $headers)) {
    header('Location: /Reserve%20Now.html?error=1');
    exit;
}

header('Location: /Reserve%20Now.html?sent=1');
exit;
