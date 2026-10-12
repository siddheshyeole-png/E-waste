# EcoCycle — PHP + MySQL Integration Module

A specialized academic module built for the **Web Technologies Laboratory Practical and Viva Examination** to demonstrate server-side PHP scripting, session management, secure password hashing, and MySQLi database connectivity.

---

## 📁 Module Directory Structure

```text
php/
├── config/
│   └── db.php          # MySQLi database connection object & error handling
├── register.php        # Citizen registration form with password_hash()
├── login.php           # User login with password_verify() and session creation
├── dashboard.php       # Protected user dashboard displaying personal pickup requests
├── pickup.php          # E-waste pickup booking form (INSERT via MySQLi)
├── logout.php          # Session termination & cleanup
├── style.css           # Clean, responsive CSS matching EcoCycle design tokens
└── README.md           # Module documentation & viva questions
```

---

## 🏗️ Architecture & Control Flow

```text
User / Citizen
      ↓
[register.php]  ──(password_hash)──>  INSERT INTO php_users
      ↓
 [login.php]    ──(password_verify)─> SELECT FROM php_users
      ↓
 [Session]      ──($_SESSION["user_id"], $_SESSION["user_name"])
      ↓
[dashboard.php] ──(Session Protected)─> SELECT FROM collection_requests WHERE email = ?
      ↓
 [pickup.php]   ──(Prepared Statement)─> INSERT INTO collection_requests
      ↓
MySQL Database (e_waste_db)
```

---

## 🔐 Security Features

1. **Prepared Statements with MySQLi:**
   All queries use `$stmt = $conn->prepare(...)` and `$stmt->bind_param(...)`. User inputs are never concatenated directly into SQL strings, completely neutralizing SQL Injection attacks.
2. **One-Way Password Hashing:**
   User passwords are encrypted using PHP's native `password_hash($password, PASSWORD_DEFAULT)` (Bcrypt) and verified using `password_verify()`. No plain-text passwords exist in the database.
3. **Protected Session State:**
   Pages like `dashboard.php` and `pickup.php` verify `isset($_SESSION['user_id'])`. Unauthenticated requests are immediately redirected to `login.php`.
4. **Server-Side Validation:**
   Form fields are validated on the server using `filter_var(..., FILTER_VALIDATE_EMAIL)` and boundary checks before any database interaction.

---

## 🚀 How to Run the PHP Module

### Option 1: Using PHP's Built-in Development Server (Recommended)
1. Open a terminal in the root project folder:
   ```bash
   cd D:\E-waste
   ```
2. Start the built-in PHP web server:
   ```bash
   php -S localhost:8000
   ```
3. Open your browser and navigate to:
   - **Register:** `http://localhost:8000/php/register.php`
   - **Login:** `http://localhost:8000/php/login.php`
   - **Dashboard:** `http://localhost:8000/php/dashboard.php`

### Option 2: Using XAMPP / WampServer
1. Copy or symlink `D:\E-waste` into your web root (e.g., `C:\xampp\htdocs\E-waste`).
2. Start Apache and MySQL from XAMPP Control Panel.
3. Open `http://localhost/E-waste/php/register.php` in your browser.
