<?php
// php/register.php
// User Registration Page demonstrating PHP form handling, validation, password hashing, and MySQLi

require_once __DIR__ . '/config/db.php';

$error = '';
$success = '';

// Check if form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Read and sanitize user input using $_POST
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // 2. Server-side validation
    if (empty($name)) {
        $error = 'Full Name cannot be empty.';
    } elseif (!preg_match("/^[a-zA-Z\s]+$/", $name)) {
        $error = 'Full Name should contain only letters and spaces.';
    } elseif (empty($email)) {
        $error = 'Email address cannot be empty.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (empty($password)) {
        $error = 'Password cannot be empty.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } elseif ($password !== $confirm_password) {
        $error = 'Password and Confirmation Password do not match.';
    } else {
        // 3. Check if email already exists using a MySQLi prepared statement
        $checkStmt = $conn->prepare("SELECT id FROM php_users WHERE email = ?");
        $checkStmt->bind_param("s", $email);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {
            $error = 'An account with this email address already exists.';
        } else {
            // 4. Hash the password securely using PHP's password_hash()
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // 5. Insert new user using parameterized query to prevent SQL Injection
            $insertStmt = $conn->prepare("INSERT INTO php_users (name, email, password) VALUES (?, ?, ?)");
            $insertStmt->bind_param("sss", $name, $email, $hashedPassword);

            if ($insertStmt->execute()) {
                // Redirect to login page on successful registration
                header("Location: login.php?registered=1");
                exit();
            } else {
                $error = 'Registration failed. Please try again.';
            }
            $insertStmt->close();
        }
        $checkStmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register - EcoCycle PHP Module</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="card auth-card">
      <h1 class="card-title">EcoCycle PHP Portal</h1>
      <p class="card-subtitle">Create a student/citizen account to manage e-waste pickups</p>

      <?php if (!empty($error)): ?>
        <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <form action="register.php" method="POST" autocomplete="off">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>" required placeholder="e.g. Rahul Patil">
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" required placeholder="e.g. rahul@example.com">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required placeholder="Minimum 6 characters">
        </div>

        <div class="form-group">
          <label for="confirm_password">Confirm Password</label>
          <input type="password" id="confirm_password" name="confirm_password" required placeholder="Re-enter password">
        </div>

        <button type="submit" class="btn">Register Account</button>
      </form>

      <div class="auth-footer">
        Already have an account? <a href="login.php">Sign In here</a>
      </div>
    </div>
  </div>
</body>
</html>
