<?php
session_start();
session_unset();
session_destroy();

// List of cookies to clear (for both domains)
$cookieNames = ['auth-token', 'egnc-auth']; // adjust names if needed
$domains = ['.egc.gov.bn', '.mydomain']; // both primary and secondary domains

foreach ($cookieNames as $cookie) {
    foreach ($domains as $domain) {
        setcookie($cookie, '', time() - 3600, '/', $domain, true, true);
    }
}

// After clearing cookies, redirect via JS
?>
<script>
    const redirectAfter = "https://preprod-katalyst.egc.gov.bn/business-card/";  // Where you want to return after logout
    const AUTH_LOGOUT = "http://dev-auth-katalyst.egc.gov.bn/logout.php"; // SSO logout URL

    // Final redirect to SSO logout with return URL
    window.location.href = `${redirectAfter}`;
</script>
