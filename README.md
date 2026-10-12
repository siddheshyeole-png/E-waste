# E-Waste Collection & Recycling Management System (EcoCycle)

A Web Technologies academic project developed for Computer Engineering practicals and viva examinations.

EcoCycle provides a clean, responsive platform connecting citizens, pickup logistics agents, and recycling facilities to ensure verified, responsible disposal of electronic waste.

---

## 📁 Project Directory Structure

```text
E-Waste-Collection/
│
├── frontend/                     # React Frontend Application (Vite + React 19)
│   ├── public/                   # Static icons & hero graphics
│   ├── src/
│   │   ├── components/           # Navbar, Footer, Button, StatusBadge
│   │   ├── pages/                # Home, RequestPickup, MyRequests, Admin
│   │   ├── App.jsx               # Root component with shared state & state-lifting handlers
│   │   ├── main.jsx              # React DOM entry point
│   │   └── style.css             # Vanilla CSS design system
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express.js Backend Foundation
│   ├── config/
│   │   └── db.js                 # MySQL database connection pool (mysql2/promise)
│   ├── controllers/
│   │   └── requestController.js  # Controller: validates inputs & executes business logic
│   ├── models/
│   │   └── requestModel.js       # Model: parameterized SQL queries for collection_requests
│   ├── middleware/
│   │   └── logger.js             # Custom HTTP request logger middleware
│   ├── routes/
│   │   ├── pages.js              # Informational & category API routes
│   │   └── requestRoutes.js      # REST API endpoints for collection requests
│   ├── public/                   # Static file serving demonstration
│   │   ├── info.txt
│   │   └── test.html
│   ├── app.js                    # Express application entry point & middleware pipeline
│   ├── package.json              # Express, mysql2, dotenv, cors dependencies
│   ├── .env                      # Environment variables (DB credentials - gitignored)
│   └── .env.example              # Template environment configuration
│
├── php/                          # PHP + MySQL Integration Module (Academic Practical)
│   ├── config/
│   │   └── db.php                # MySQLi database connection object
│   ├── register.php              # Citizen registration with password_hash()
│   ├── login.php                 # User login with password_verify() & sessions
│   ├── dashboard.php             # Protected citizen dashboard (SELECT requests)
│   ├── pickup.php                # E-waste pickup booking form (INSERT request)
│   ├── logout.php                # Session termination & cleanup
│   ├── style.css                 # Clean CSS matching EcoCycle design tokens
│   └── README.md                 # PHP module documentation & viva guide
│
├── database/
│   ├── e_waste.sql               # MySQL core schema & collection_requests seed data
│   └── php_users.sql             # MySQL schema for php_users authentication table
│
├── php.bat                       # CLI wrapper for PHP built-in server
├── start_php.bat                 # One-click startup script for PHP server (Port 8000)
├── .gitignore                    # Git ignore file protecting .env and node_modules
└── README.md                     # Project overview and viva documentation
```

---

## 🏗️ Architectural Pattern

The backend strictly follows the **Modular MVC (Routes → Controllers → Models → Database)** design pattern:

```text
Frontend (Client Application)
       ↓  HTTP Requests (JSON)
REST API (/api/requests)
       ↓
Express Routes (requestRoutes.js)
       ↓
Controllers (requestController.js)   ← Input validation, status codes, business logic
       ↓
Models (requestModel.js)             ← Parameterized SQL queries with '?'
       ↓
MySQL Database (collection_requests) ← Persistent storage
```

---

## 🌐 REST API and CRUD Operations

The **REST API** allows client applications (such as React, mobile apps, or Postman) to communicate with the backend using standard HTTP verbs:
- **`GET`**: Retrieves existing records from the database.
- **`POST`**: Creates a new record in the database.
- **`PUT`**: Updates an existing record identified by its ID.
- **`DELETE`**: Removes an existing record from the database.

### API Endpoints Reference Table

| Method | Endpoint | Purpose | Request Body | Success Status |
| :--- | :--- | :--- | :--- | :---: |
| **`GET`** | `/api/requests` | Retrieve all collection requests | *None* | `200 OK` |
| **`GET`** | `/api/requests/:id` | Retrieve a single request by ID | *None* | `200 OK` |
| **`POST`** | `/api/requests` | Create a new collection request | JSON payload (all required fields) | `201 Created` |
| **`PUT`** | `/api/requests/:id` | Update an existing request by ID | JSON payload (fields to update) | `200 OK` |
| **`DELETE`**| `/api/requests/:id` | Delete a request by ID | *None* | `200 OK` |

### Architectural Roles:
1. **Express Router (`requestRoutes.js`):** Declares endpoint paths and maps HTTP verbs to corresponding controller functions.
2. **Controllers (`requestController.js`):** Extracts request parameters/body, performs validation, calls model functions, and sends HTTP responses (200, 201, 400, 404, 500).
3. **Models (`requestModel.js`):** Contains raw SQL queries using `mysql2/promise` and connection pooling.
4. **MySQL Database:** Provides persistent, relational ACID-compliant data storage.
5. **Parameterized Queries (`?`):** Values are escaped by the driver, protecting the application against SQL injection attacks.

---

## 🗄️ Database Setup (MySQL)

### Step 1: Import the SQL Script

You can import the database script via MySQL Command Line or MySQL Workbench:

**Using MySQL CLI:**
```bash
mysql -u root -p < database/e_waste.sql
```
*(Enter your MySQL root password when prompted)*

### Step 2: Database Schema (`collection_requests` Table)

| Column Name | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique request identifier |
| `user_name` | `VARCHAR(100)` | `NOT NULL` | Citizen's full name |
| `email` | `VARCHAR(100)` | `NOT NULL` | Citizen's email address |
| `phone` | `VARCHAR(15)` | `NOT NULL` | 10-digit mobile number |
| `category` | `VARCHAR(50)` | `NOT NULL` | E-waste category (Laptops, Phones, etc.) |
| `item_name` | `VARCHAR(100)` | `NOT NULL` | Device model / item name |
| `quantity` | `INT` | `NOT NULL DEFAULT 1` | Number of items |
| `address` | `TEXT` | `NOT NULL` | Detailed pickup address |
| `city` | `VARCHAR(50)` | `NOT NULL` | City name |
| `pickup_date` | `DATE` | `NOT NULL` | Scheduled date for pickup |
| `time_slot` | `VARCHAR(50)` | `NOT NULL` | Preferred time slot |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'Pending'` | Status (`Pending`, `Scheduled`, `Recycled`) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Automatic submission timestamp |

---

## 🚀 How to Run the Applications

### 1. Configure Backend Environment

In `backend/.env`, set your local MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=e_waste_db
PORT=5000
```

### 2. Running the Backend Server (Node.js + Express)

Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
npm start
```
The Express backend server will start on **`http://localhost:5000`**.
On startup, it will test and log:
```text
MySQL database connected successfully
E-Waste backend server running on port 5000
```

#### Available Backend Endpoints:
- `GET http://localhost:5000/api/requests` — All collection requests
- `GET http://localhost:5000/api/requests/:id` — Single request
- `POST http://localhost:5000/api/requests` — Create new request
- `PUT http://localhost:5000/api/requests/:id` — Update request
- `DELETE http://localhost:5000/api/requests/:id` — Delete request
- `GET http://localhost:5000/` — Welcome message JSON
- `GET http://localhost:5000/api/about` — Project information JSON
- `GET http://localhost:5000/api/categories` — E-Waste categories JSON
- `GET http://localhost:5000/info.txt` — Static text resource
- `GET http://localhost:5000/test.html` — Static HTML test page
- `GET http://localhost:5000/non-existent-url` — Triggers custom 404 JSON response

---

### 3. Running the Frontend Application (React + Vite)

Open a second terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The React frontend will start on **`http://127.0.0.1:5173`**.

---

## 🎓 Viva & Practical Examination Q&A Guide

| Question / Concept | Answer / Explanation |
| :--- | :--- |
| **What is `mysql2`?** | `mysql2` is a high-performance MySQL driver for Node.js. It supports modern JavaScript features such as Promises and async/await (`mysql2/promise`) as well as prepared statements. |
| **Why is `mysql2` used instead of an ORM?** | For academic practicals and fundamentals, direct SQL queries with `mysql2` are transparent, lightweight, and allow students to demonstrate a clear grasp of standard SQL rather than hiding behind ORMs like Sequelize or Prisma. |
| **What is a Connection Pool?** | Instead of creating a new database connection for every incoming user request (which causes high latency and memory overhead), a connection pool maintains a cache of reusable database connections. Requests borrow a connection, execute the query, and release it back to the pool. |
| **What does `DB_HOST` mean?** | The hostname or IP address where the MySQL database server is running (e.g., `localhost` or `127.0.0.1` for local development). |
| **What does `DB_USER` mean?** | The MySQL username authorized to access the database (commonly `root` for local environments). |
| **What does `DB_PASSWORD` mean?** | The secret password assigned to the MySQL user account. |
| **What does `DB_NAME` mean?** | The specific database catalog (`e_waste_db`) to store and query tables. |
| **Why store credentials in `.env`?** | Hardcoding database passwords in source code exposes credentials in version control (e.g., GitHub). Using `.env` keeps sensitive configuration local and separate from code. |
| **Why add `.env` to `.gitignore`?** | Adding `.env` to `.gitignore` ensures Git will ignore the file and prevent it from ever being committed or pushed to public or remote repositories. |
| **What is `PRIMARY KEY`?** | A column or set of columns that uniquely identifies each row in a database table. It must be unique and cannot contain NULL values. |
| **What is `AUTO_INCREMENT`?** | An attribute that automatically generates a unique sequential integer (1, 2, 3...) for new records when no value is provided during INSERT. |
| **What does `DEFAULT 'Pending'` mean?** | If an `INSERT` statement does not specify a `status` value, MySQL will automatically set it to `'Pending'`. |
| **What does `CURRENT_TIMESTAMP` mean?** | Automatically assigns the server's current date and time to the `created_at` column when a new record is inserted. |
| **How do Parameterized Queries protect against SQL Injection?** | Parameterized queries separate the SQL command code from user-supplied input data. Values passed in `?` placeholders are treated purely as literal values, never as executable SQL code. |
| **What is `fetch()`?** | The browser's native JavaScript API for making asynchronous network requests, returning a Promise that resolves with the `Response` object. |
| **Why use `JSON.stringify()` and `response.json()`?** | `JSON.stringify()` converts JavaScript objects into a JSON string to transmit across HTTP. `response.json()` parses an incoming JSON response string back into a JavaScript object. |
| **What is CORS and why is it needed?** | Cross-Origin Resource Sharing is a browser security mechanism that blocks web pages running on one origin (`http://localhost:5173`) from making requests to a different origin (`http://localhost:5000`) unless the backend explicitly grants permission using headers. |

---

## 🔄 React Frontend + REST API Integration

The React frontend communicates directly with the Express REST API using the browser's native `fetch()` API and JSON:

```text
React (Client Application)
       ↓  fetch() HTTP Requests with JSON
REST API (/api/requests)
       ↓
Express Routes (requestRoutes.js)
       ↓
Controllers (requestController.js)
       ↓
Models (requestModel.js)
       ↓
MySQL Database (collection_requests)
```

### Key Integration Concepts:
- **`fetch()` API:** The native browser method used to perform asynchronous HTTP network requests (`GET`, `POST`, `PUT`, `DELETE`).
- **JSON Formatting:** `JSON.stringify()` serializes JavaScript objects into JSON format for outgoing request bodies, while `response.json()` parses incoming JSON strings back into JavaScript objects.
- **Persistent State:** React state (`requests`) in `App.jsx` stores data retrieved from MySQL rather than volatile in-memory mock records.
- **`useEffect()` Lifecycle Hook:** Automatically triggers `loadRequests()` when the React application initially mounts in the browser.
- **`POST`:** Transmits newly submitted pickup requests to `/api/requests`, generating a persistent database record.
- **`PUT`:** Allows Admins to update request status (`Approved`, `Scheduled`, `Recycled`) in MySQL.
- **`DELETE`:** Removes a request from MySQL and synchronizes the React view immediately.
- **ACID Database Persistence:** Unlike local storage or state variables, MySQL provides persistent, relational storage across server restarts and page refreshes.

### Frontend Action to REST API Mapping

| User / Admin Action | HTTP Method | REST API Endpoint | Payload Data | State Update |
| :--- | :---: | :--- | :--- | :--- |
| **Load Requests on Startup** | `GET` | `/api/requests` | *None* | `setRequests(data)` |
| **Submit Pickup Request** | `POST` | `/api/requests` | Form Data (JSON) | `setRequests([newRequest, ...prev])` |
| **Approve / Schedule / Complete**| `PUT` | `/api/requests/:id` | `{ status: newStatus }` | `setRequests(prev.map(...))` |
| **Delete Request** | `DELETE`| `/api/requests/:id` | *None* | `setRequests(prev.filter(...))` |

---

## 🐘 PHP + MySQL Module (Academic Practical Demonstration)

A dedicated, lightweight PHP module demonstrating classic Web Technologies concepts: server-side form handling, stateful sessions, bcrypt password encryption, and MySQLi database transactions on the shared `e_waste_db` database.

### Architectural Flow:

```text
PHP Register (register.php)
       ↓  Stores password_hash() in php_users
PHP Login (login.php)
       ↓  Validates via password_verify()
PHP Session (session_start())
       ↓  Sets $_SESSION["user_id"] and $_SESSION["user_name"]
PHP Dashboard (dashboard.php)
       ↓  Queries logged-in user requests (SELECT WHERE email = ?)
PHP Pickup Form (pickup.php)
       ↓  Binds session info and inserts (INSERT INTO collection_requests)
MySQL Database (e_waste_db)
```

### Key Integration Points:
- **Shared Relational Storage:** Both the Node.js/Express backend and the PHP module connect to the exact same MySQL database catalog (`e_waste_db`). Requests booked through `php/pickup.php` immediately appear in both the PHP citizen dashboard and the React Admin portal.
- **MySQLi Driver:** Uses PHP's native `MySQLi` extension with prepared statements (`prepare()`, `bind_param()`, `execute()`).
- **Form Data Retrieval:** Uses the superglobal `$_POST` array for form submissions.
- **Session State:** Uses PHP sessions (`session_start()`, `$_SESSION`) to persist logged-in user identity across HTTP requests.
- **Password Security:** Uses PHP's `password_hash()` (Bcrypt) and `password_verify()`. No plain-text passwords are ever stored.

### Running the PHP Module:

Run the one-click startup script or use the PHP CLI:
```bash
# Option A: One-click script
start_php.bat

# Option B: Built-in PHP server command
php -S localhost:8000
```
Then visit:
- **Register:** `http://localhost:8000/php/register.php`
- **Login:** `http://localhost:8000/php/login.php`
- **Dashboard:** `http://localhost:8000/php/dashboard.php`
- **Pickup Form:** `http://localhost:8000/php/pickup.php`

---

## 🎓 Complete Web Technologies Viva Q&A Reference Guide

| Viva Question | Concise Academic Answer |
| :--- | :--- |
| **1. What is PHP?** | PHP (Hypertext Preprocessor) is an open-source, server-side scripting language designed for web development. It executes on the server, interacts with databases, and outputs dynamic HTML to the client browser. |
| **2. What is MySQLi?** | MySQLi ("MySQL Improved") is a relational database driver extension in PHP that supports both procedural and object-oriented interfaces, prepared statements, and enhanced security over the deprecated original MySQL extension. |
| **3. What is `$_POST`?** | A PHP superglobal associative array used to collect values submitted from an HTML `<form method="POST">`. Unlike `$_GET`, values sent via `$_POST` are included in the HTTP request body and not visible in the browser address bar. |
| **4. What is a PHP session?** | A server-side mechanism that preserves user state (like login identity) across multiple page requests. It issues a unique session cookie (`PHPSESSID`) to the client while storing associated data in `$_SESSION` on the server until destroyed. |
| **5. Why use `password_hash()`?** | It produces a secure, irreversible one-way cryptographic hash using strong modern algorithms (like Bcrypt) with automatically generated random salts, protecting passwords against dictionary and rainbow-table attacks. |
| **6. Why use `password_verify()`?** | It verifies whether a supplied plain-text password matches a stored cryptographic hash without decrypting or exposing the underlying password string. |
| **7. What is a prepared statement?** | A database feature where the SQL query template is compiled on the database server first with `?` placeholders, and actual parameter values are transmitted separately. |
| **8. What is SQL injection?** | A code-injection vulnerability where malicious SQL commands are inserted into user-input fields. Using prepared statements eliminates SQL injection by treating all placeholder inputs purely as literal data, never executable SQL code. |
| **9. Why use `AUTO_INCREMENT`?** | Automatically assigns a unique sequential primary key integer (1, 2, 3...) to newly inserted records without requiring application code to track or generate unique ID values manually. |
| **10. Why does PHP use the same database as Node.js?** | In real-world enterprise architectures, multiple backend microservices or administrative modules share a single relational database for data consistency, integrity, and unified reporting. |
| **11. Difference between Node.js and PHP in this project?** | Node.js + Express acts as a headless, asynchronous REST API serving JSON payloads to a modern Single Page Application (React). PHP renders complete, dynamic server-side HTML pages with traditional form redirects and sessions. |
| **12. Why was PHP not used for the entire application?** | Modern web systems benefit from a decoupled architecture: an interactive client-side Single Page Application (React) for fluid user experiences, complemented by specialized server-side modules (Node/PHP) where appropriate. |
| **13. What is server-side validation?** | Validation logic executed on the server before database processing. It verifies data types, formats, required fields, and business rules independently of the client. |
| **14. Why is browser validation alone insufficient?** | Client-side validation can easily be bypassed, disabled in developer tools, or circumvented using tools like Postman or curl. Server-side validation guarantees data integrity and security. |
