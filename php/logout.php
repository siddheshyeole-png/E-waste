<?php
// php/logout.php
// Ends user session and redirects to login page

session_start();

// Unset all session variables
session_unset();

// Destroy the session data on the server
session_destroy();

// Redirect to login page
header("Location: login.php");
exit();
?>
