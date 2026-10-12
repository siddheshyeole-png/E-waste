<?php
// php/pickup.php
// E-Waste Pickup Request Form demonstrating PHP form handling, session binding, and MySQLi INSERT

session_start();

// 1. Session Protection Check: Ensure user is logged in
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

require_once __DIR__ . '/config/db.php';

// 2. Retrieve user's verified name and email from php_users table using session ID
$userStmt = $conn->prepare("SELECT name, email FROM php_users WHERE id = ?");
$userStmt->bind_param("i", $_SESSION["user_id"]);
$userStmt->execute();
$userData = $userStmt->get_result()->fetch_assoc();
$userStmt->close();

if (!$userData) {
    // Session invalidated if user no longer exists in database
    header("Location: logout.php");
    exit();
}

$user_name = $userData['name'];
$user_email = $userData['email'];

$error = '';
$success = '';

// 3. Process POST form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $category = trim($_POST['category'] ?? '');
    $item_name = trim($_POST['item_name'] ?? '');
    $quantity = intval($_POST['quantity'] ?? 0);
    $address = trim($_POST['address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $pickup_date = trim($_POST['pickup_date'] ?? '');
    $time_slot = trim($_POST['time_slot'] ?? '');

    // Server-side validation
    if (empty($category)) {
        $error = 'Please select an e-waste category.';
    } elseif (empty($item_name)) {
        $error = 'Item Name cannot be empty.';
    } elseif ($quantity < 1) {
        $error = 'Quantity must be at least 1.';
    } elseif (empty($address)) {
        $error = 'Pickup Address cannot be empty.';
    } elseif (empty($city)) {
        $error = 'City cannot be empty.';
    } elseif (empty($pickup_date)) {
        $error = 'Pickup Date cannot be empty.';
    } elseif (empty($time_slot)) {
        $error = 'Please select a preferred time slot.';
    } else {
        // 4. Insert into existing collection_requests table using MySQLi prepared statements
        // Auto-increment ID and CURRENT_TIMESTAMP created_at are generated automatically by MySQL
        $insertQuery = "INSERT INTO collection_requests 
                        (user_name, email, phone, category, item_name, quantity, address, city, pickup_date, time_slot, status) 
                        VALUES (?, ?, 'N/A (PHP)', ?, ?, ?, ?, ?, ?, ?, 'Pending')";

        $stmt = $conn->prepare($insertQuery);
        $stmt->bind_param(
            "ssssissss",
            $user_name,
            $user_email,
            $category,
            $item_name,
            $quantity,
            $address,
            $city,
            $pickup_date,
            $time_slot
        );

        if ($stmt->execute()) {
            // Redirect to dashboard with success query parameter
            header("Location: dashboard.php?created=1");
            exit();
        } else {
            $error = 'Failed to submit pickup request. Please try again.';
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
  <title>Schedule Pickup - EcoCycle PHP Module</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <!-- Top Navigation Header -->
    <header class="header-bar">
      <div class="brand-title">
        🌱 EcoCycle PHP Portal
      </div>
      <nav class="nav-links">
        <a href="dashboard.php">Dashboard</a>
        <a href="pickup.php" style="color: var(--primary);">Request Pickup</a>
        <a href="logout.php" class="btn-logout">Logout</a>
      </nav>
    </header>

    <div class="card" style="max-width: 650px; margin: 0 auto;">
      <h2 class="card-title">Schedule E-Waste Pickup</h2>
      <p class="card-subtitle">
        Submitting as: <strong><?php echo htmlspecialchars($user_name); ?></strong> (<?php echo htmlspecialchars($user_email); ?>)
      </p>

      <?php if (!empty($error)): ?>
        <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <form action="pickup.php" method="POST" autocomplete="off">
        <div class="form-grid-2">
          <div class="form-group">
            <label for="category">E-Waste Category</label>
            <select id="category" name="category" required>
              <option value="">-- Select Category --</option>
              <option value="Computers & Laptops" <?php if (($_POST['category'] ?? '') === 'Computers & Laptops') echo 'selected'; ?>>Computers & Laptops</option>
              <option value="Mobile Phones" <?php if (($_POST['category'] ?? '') === 'Mobile Phones') echo 'selected'; ?>>Mobile Phones & Tablets</option>
              <option value="Batteries & UPS" <?php if (($_POST['category'] ?? '') === 'Batteries & UPS') echo 'selected'; ?>>Batteries & UPS Units</option>
              <option value="TVs & Monitors" <?php if (($_POST['category'] ?? '') === 'TVs & Monitors') echo 'selected'; ?>>TVs & Monitors</option>
              <option value="Printers & Scanners" <?php if (($_POST['category'] ?? '') === 'Printers & Scanners') echo 'selected'; ?>>Printers & Scanners</option>
              <option value="Other Electronics" <?php if (($_POST['category'] ?? '') === 'Other Electronics') echo 'selected'; ?>>Other Electronic Equipment</option>
            </select>
          </div>

          <div class="form-group">
            <label for="item_name">Item Model / Description</label>
            <input type="text" id="item_name" name="item_name" value="<?php echo htmlspecialchars($_POST['item_name'] ?? ''); ?>" required placeholder="e.g. Dell Inspiron Laptop">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label for="quantity">Quantity (Units)</label>
            <input type="number" id="quantity" name="quantity" min="1" value="<?php echo htmlspecialchars($_POST['quantity'] ?? '1'); ?>" required>
          </div>

          <div class="form-group">
            <label for="city">City</label>
            <input type="text" id="city" name="city" value="<?php echo htmlspecialchars($_POST['city'] ?? ''); ?>" required placeholder="e.g. Pune">
          </div>
        </div>

        <div class="form-group">
          <label for="address">Detailed Pickup Address</label>
          <textarea id="address" name="address" rows="3" required placeholder="Building, Room/Flat number, Street..."><?php echo htmlspecialchars($_POST['address'] ?? ''); ?></textarea>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label for="pickup_date">Preferred Pickup Date</label>
            <input type="date" id="pickup_date" name="pickup_date" value="<?php echo htmlspecialchars($_POST['pickup_date'] ?? ''); ?>" required min="<?php echo date('Y-m-d'); ?>">
          </div>

          <div class="form-group">
            <label for="time_slot">Preferred Time Slot</label>
            <select id="time_slot" name="time_slot" required>
              <option value="">-- Select Time Slot --</option>
              <option value="Morning (9:00 AM - 12:00 PM)" <?php if (($_POST['time_slot'] ?? '') === 'Morning (9:00 AM - 12:00 PM)') echo 'selected'; ?>>Morning (9:00 AM - 12:00 PM)</option>
              <option value="Afternoon (12:00 PM - 3:00 PM)" <?php if (($_POST['time_slot'] ?? '') === 'Afternoon (12:00 PM - 3:00 PM)') echo 'selected'; ?>>Afternoon (12:00 PM - 3:00 PM)</option>
              <option value="Evening (3:00 PM - 6:00 PM)" <?php if (($_POST['time_slot'] ?? '') === 'Evening (3:00 PM - 6:00 PM)') echo 'selected'; ?>>Evening (3:00 PM - 6:00 PM)</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn" style="margin-top: 10px;">Submit Pickup Request</button>
      </form>
    </div>
  </div>
</body>
</html>
