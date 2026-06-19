<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /');
    exit;
}

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_SPECIAL_CHARS);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS);
$adults = filter_input(INPUT_POST, 'adults', FILTER_SANITIZE_SPECIAL_CHARS);
$children = filter_input(INPUT_POST, 'children', FILTER_SANITIZE_SPECIAL_CHARS);
$checkin = filter_input(INPUT_POST, 'checkin', FILTER_SANITIZE_SPECIAL_CHARS);
$checkout = filter_input(INPUT_POST, 'checkout', FILTER_SANITIZE_SPECIAL_CHARS);
$source = filter_input(INPUT_POST, 'source', FILTER_SANITIZE_SPECIAL_CHARS);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_SPECIAL_CHARS);

if (!$name || !$phone) {
    header('Location: Reserve%20Now.html?error=1');
    exit;
}

$to = 'vimalkumark@hotmail.com';
$mail_subject = 'New Enquiry from Urban Retreat Website';
if ($subject) $mail_subject = 'Website Enquiry: ' . $subject;

$body = "New enquiry from Urban Retreat website:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n";
if ($adults) $body .= "Adults: $adults\n";
if ($children) $body .= "Children: $children\n";
if ($checkin) $body .= "Check-in: $checkin\n";
if ($checkout) $body .= "Check-out: $checkout\n";
if ($source) $body .= "Source: $source\n";
$body .= "\nMessage:\n$message\n";

$headers = "From: Urban Retreat <noreply@urbanretreatmangalore.com>\r\n";
$headers .= "Reply-To: " . ($email ?: 'noreply@urbanretreatmangalore.com') . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: UrbanRetreat/1.0";

mail($to, $mail_subject, $body, $headers);

header('Location: Reserve%20Now.html?sent=1');
exit;
