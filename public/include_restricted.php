<?php
session_start();
define('AUTH_PAGE', 'http://dev-auth-katalyst.egc.gov.bn//');
define('ACCESS_PAGE', value: '/business-card/'); // Where to send after login

$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']); // Detect fetch/AJAX
$key = getenv('AES_KEY');
$authenticated = FALSE;

$token = $_COOKIE["auth-token"] ?? null;
if ($token) {
    try {
        $cipher = 'aes-256-gcm';
        $ivLength = openssl_cipher_iv_length($cipher);
        $decodedData = base64_decode($token);
        $iv = substr($decodedData, 0, $ivLength);
        $tag = substr($decodedData, $ivLength, 16);
        $ciphertext = substr($decodedData, $ivLength + 16);

        $data = openssl_decrypt($ciphertext, $cipher, $key, 0, $iv, $tag);
        $decode = json_decode($data);

        $_SESSION["name"] = $decode->name;
        $_SESSION["username"] = $decode->username;
        $_SESSION["email"] = $decode->email;
        $_SESSION["agency"] = $decode->agency;
        $_SESSION["department"] = $decode->department;

        $authenticated = TRUE;
    } catch (Exception $e) {
        if ($isAjax) {
            echo json_encode(['authenticated' => false, 'redirect' => AUTH_PAGE]);
            exit;
        } else {
            header("Location: " . AUTH_PAGE . "?location=" . urlencode($_SERVER['REQUEST_URI']));
            exit;
        }
    }

    if ($authenticated) {
        $redirectBack = $_GET['redirect'] ?? ACCESS_PAGE;

        if ($isAjax) {
            echo json_encode(['authenticated' => true, 'user' => $_SESSION]);
            exit;
        } else {
            // 🔁 Redirect to Laravel API to process session and give token
            $redirectToLaravel = "/business-card/api/sso/sync?redirect=" . urlencode(string: $redirectBack);
            header("Location: $redirectToLaravel");
            exit;
        }
    }

} else {
    if ($isAjax) {
        echo json_encode(['authenticated' => false, 'redirect' => AUTH_PAGE]);
    } else {
        header("Location: " . AUTH_PAGE . "?location=" . urlencode(string: $_SERVER['REQUEST_URI']));
    }
    exit;
}
