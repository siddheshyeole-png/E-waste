<?php
// php/dashboard.php
// Protected User Dashboard demonstrating PHP sessions, access control, and dynamic SQL query execution

session_start();

// 1. Session Protection Check: Ensure user is authenticated
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

require_once __DIR__ . '/config/db.php';

$user_id = $_SESSION["user_id"];
$user_name = $_SESSION["user_name"];
$user_email = $_SESSION["user_email"];

// 2. Fetch logged-in citizen's pickup requests using MySQLi prepared statement
$requests = [];
$error = '';

if ($db_error) {
    $error = $db_error_message;
} else {
    $query = "SELECT id, category, item_name, quantity, address, city, pickup_date, time_slot, status, created_at 
              FROM collection_requests 
              WHERE email = ? 
              ORDER BY id DESC";

    if ($stmt = $conn->prepare($query)) {
        $stmt->bind_param("s", $user_email);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
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
  <title>Dashboard - EcoCycle PHP Module</title>
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
        <a href="dashboard.php" style="color: var(--primary);">Dashboard</a>
        <a href="pickup.php">Request Pickup</a>
        <a href="logout.php" class="btn-logout">Logout</a>
      </nav>
    </header>
<?php if (isset($_GET['created']) && $_GET['created'] == '1'): ?>
    <script>
      alert("✅ Pickup Request Submitted Successfully!\n\nYour collection request has been recorded in the database.");
    </script>
    <div class="alert alert-success" style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
      ✅ <strong>Request Submitted!</strong> Your e-waste pickup request has been successfully recorded in the database.
    </div>
<?php endif; ?>

    <!-- Welcome Card -->
    <div class="card">
      <h2 class="card-title">Welcome, <?php echo htmlspecialchars($user_name); ?>!</h2>
      <p class="card-subtitle">
        Account Email: <strong><?php echo htmlspecialchars($user_email); ?></strong> • Session ID Active
      </p>

      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <a href="pickup.php" class="btn" style="width: auto;">+ New Pickup Request</a>
        <a href="dashboard.php" class="btn btn-secondary">Refresh Requests</a>
      </div>
    </div>

    <!-- My Requests Section (Dynamic PHP Data Table) -->
    <div class="card">
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 4px;">My E-Waste Pickup Requests</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">
        Records retrieved dynamically from <code>e_waste_db.collection_requests</code> matching your email.
      </p>

      <?php if (count($requests) === 0): ?>
        <div class="empty-state">
          <p>No collection requests found for your account.</p>
          <p style="margin-top: 8px;">
            <a href="pickup.php" style="color: var(--primary); font-weight: 600;">Click here to schedule your first e-waste pickup</a>.
          </p>
        </div>
      <?php else: ?>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Pickup Date</th>
                <th>City</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($requests as $req): ?>
                <?php
                  $badgeClass = 'badge-pending';
                  $st = strtolower($req['status']);
                  if ($st === 'scheduled') $badgeClass = 'badge-scheduled';
                  elseif ($st === 'recycled') $badgeClass = 'badge-recycled';
                  elseif ($st === 'approved') $badgeClass = 'badge-approved';
                ?>
                <tr>
                  <td><strong>#<?php echo htmlspecialchars($req['id']); ?></strong></td>
                  <td><?php echo htmlspecialchars($req['category']); ?></td>
                  <td><?php echo htmlspecialchars($req['item_name']); ?></td>
                  <td><?php echo htmlspecialchars($req['quantity']); ?></td>
                  <td><?php echo htmlspecialchars($req['pickup_date']); ?></td>
                  <td><?php echo htmlspecialchars($req['city']); ?></td>
                  <td>
                    <span class="badge <?php echo $badgeClass; ?>">
                      <?php echo htmlspecialchars($req['status']); ?>
                    </span>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>
