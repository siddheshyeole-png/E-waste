<?php
// php/login.php
// User Authentication Page demonstrating PHP sessions and password_verify()

session_start();

// If user is already logged in, redirect straight to dashboard
if (isset($_SESSION["user_id"])) {
    header("Location: dashboard.php");
    exit();
}

require_once __DIR__ . '/config/db.php';

$error = '';
$success = '';

// Display success banner if redirected from successful registration
if (isset($_GET['registered']) && $_GET['registered'] == 1) {
    $success = 'Account created successfully! Please sign in with your credentials.';
}

// Handle login POST submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Please enter both email and password.';
    } else {
        // Query user by email using MySQLi prepared statement
        $stmt = $conn->prepare("SELECT id, name, email, password FROM php_users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            // Securely verify hashed password using PHP's password_verify()
            if (password_verify($password, $user['password'])) {
                // Initialize session variables
                $_SESSION["user_id"] = $user["id"];
                $_SESSION["user_name"] = $user["name"];
                $_SESSION["user_email"] = $user["email"];

                // Redirect to protected dashboard
                header("Location: dashboard.php");
                exit();
            } else {
                // Generic error: Do not disclose whether email or password was wrong
                $error = 'Invalid email or password.';
            }
        } else {
            // Generic error for security
            $error = 'Invalid email or password.';
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - EcoCycle PHP Module</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="card auth-card">
      <h1 class="card-title">Welcome to EcoCycle</h1>
      <p class="card-subtitle">Sign in to your PHP portal account</p>

      <?php if (!empty($success)): ?>
        <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
      <?php endif; ?>

      <?php if (!empty($error)): ?>
        <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <form action="login.php" method="POST" autocomplete="off">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" required placeholder="e.g. rohan@example.com">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required placeholder="Enter your password">
        </div>

        <button type="submit" class="btn">Sign In</button>
      </form>

      <div class="auth-footer">
        Don't have an account? <a href="register.php">Create one here</a>
      </div>
    </div>
  </div>
</body>
</html>
