const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:5000';
const PHP_URL = 'http://localhost:8000';

async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('ECOCYCLE STEP 2: COMPREHENSIVE AUTH & SECURITY TEST SUITE');
  console.log('================================================================\n');

  const results = [];
  function assert(title, condition, detail = '') {
    const status = condition ? 'PASS' : 'FAIL';
    results.push({ title, status, detail });
    console.log(`[${status}] ${title} ${detail ? `(${detail})` : ''}`);
  }

  // Connect to DB for direct verification
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e_waste'
  });

  try {
    // Unique test run tag
    const runId = Date.now().toString().slice(-4);
    const aliceEmail = `alice_${runId}@campus.edu`;
    const bobEmail = `bob_${runId}@campus.edu`;
    const password = 'Password@123';

    // -------------------------------------------------------------
    // TEST GROUP 1: CITIZEN REGISTRATION & PASSWORD HASHING
    // -------------------------------------------------------------
    console.log('\n--- 1. CITIZEN REGISTRATION & PASSWORD HASHING ---');

    // 1.1 Valid Registration
    const regAlice = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice Walker', email: aliceEmail, password })
    });
    assert('Citizen registration with valid data', regAlice.status === 201 && regAlice.data.token && regAlice.data.user?.role === 'citizen');
    const aliceToken = regAlice.data.token;
    const aliceUserId = regAlice.data.user.id;

    // 1.2 Duplicate Email Rejection
    const regDuplicate = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice Clone', email: aliceEmail, password })
    });
    assert('Duplicate email registration rejected', regDuplicate.status === 400, `Got HTTP ${regDuplicate.status}`);

    // 1.3 Invalid Registration Input (missing password / short password)
    const regShortPass = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Bad Pass', email: `bad_${runId}@campus.edu`, password: '123' })
    });
    assert('Short password rejected', regShortPass.status === 400, `Got HTTP ${regShortPass.status}`);

    // 1.4 Public Registration cannot create admin role
    const regFakeAdmin = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Fake Admin', email: `fakeadmin_${runId}@campus.edu`, password, role: 'admin' })
    });
    assert('Public registration rejects role=admin injection', regFakeAdmin.status === 400 || (regFakeAdmin.status === 201 && regFakeAdmin.data.user.role === 'citizen'), `Role received: ${regFakeAdmin.data?.user?.role || 'rejected'}`);

    // 1.5 Verify Password Hashing in MySQL Database
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [aliceEmail]);
    const storedHash = userRows[0]?.password;
    const isHashed = storedHash && storedHash.startsWith('$2') && storedHash !== password;
    const bcryptMatches = isHashed ? await bcrypt.compare(password, storedHash) : false;
    assert('Password stored as bcrypt hash in MySQL, never plaintext', isHashed && bcryptMatches, `Hash: ${storedHash ? storedHash.substring(0, 15) + '...' : 'none'}`);

    // -------------------------------------------------------------
    // TEST GROUP 2: CITIZEN LOGIN
    // -------------------------------------------------------------
    console.log('\n--- 2. CITIZEN LOGIN & ERROR HANDLING ---');

    // 2.1 Citizen Login with Correct Credentials
    const loginAlice = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: aliceEmail, password })
    });
    assert('Citizen login with correct credentials', loginAlice.status === 200 && loginAlice.data.token && loginAlice.data.user?.email === aliceEmail);

    // 2.2 Citizen Login with Incorrect Password
    const loginWrongPass = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: aliceEmail, password: 'WrongPassword' })
    });
    assert('Citizen login with incorrect password returns generic error', loginWrongPass.status === 401 && loginWrongPass.data.error, `HTTP ${loginWrongPass.status}: ${loginWrongPass.data.error}`);

    // 2.3 Citizen Login with Non-Existent Email
    const loginNoUser = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ghost@campus.edu', password })
    });
    assert('Citizen login with non-existent email returns generic error', loginNoUser.status === 401 && loginNoUser.data.error, `HTTP ${loginNoUser.status}: ${loginNoUser.data.error}`);

    // -------------------------------------------------------------
    // TEST GROUP 3: ADMINISTRATOR ACCOUNT AUTHENTICATION
    // -------------------------------------------------------------
    console.log('\n--- 3. ADMINISTRATOR AUTHENTICATION ---');

    // 3.1 Admin Login with correct env credentials
    const adminLogin = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@ecocycle.org', password: 'AdminSecure@2026' })
    });
    assert('Administrator login succeeds with .env credentials', adminLogin.status === 200 && adminLogin.data.user?.role === 'admin');
    const adminToken = adminLogin.data.token;

    // 3.2 Admin Login with incorrect password
    const adminWrongPass = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@ecocycle.org', password: 'BadAdminPassword' })
    });
    assert('Administrator login rejected with invalid password', adminWrongPass.status === 401, `HTTP ${adminWrongPass.status}`);

    // -------------------------------------------------------------
    // TEST GROUP 4: UNAUTHENTICATED ACCESS GUARDS
    // -------------------------------------------------------------
    console.log('\n--- 4. UNAUTHENTICATED ACCESS GUARDS ---');

    const unauthGet = await fetchJson('/api/requests');
    assert('Unauthenticated GET /api/requests rejected', unauthGet.status === 401, `HTTP ${unauthGet.status}`);

    const unauthPost = await fetchJson('/api/requests', {
      method: 'POST',
      body: JSON.stringify({ item_name: 'Stolen laptop' })
    });
    assert('Unauthenticated POST /api/requests rejected', unauthPost.status === 401, `HTTP ${unauthPost.status}`);

    const unauthPut = await fetchJson('/api/requests/1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert('Unauthenticated PUT /api/requests/1 rejected', unauthPut.status === 401, `HTTP ${unauthPut.status}`);

    const unauthDel = await fetchJson('/api/requests/1', {
      method: 'DELETE'
    });
    assert('Unauthenticated DELETE /api/requests/1 rejected', unauthDel.status === 401, `HTTP ${unauthDel.status}`);

    // Tampered Token
    const tampered = await fetchJson('/api/requests', {
      headers: { Authorization: 'Bearer this.is.a.forged.jwt.token' }
    });
    assert('Tampered/invalid JWT rejected', tampered.status === 401, `HTTP ${tampered.status}`);

    // -------------------------------------------------------------
    // TEST GROUP 5: PICKUP WORKFLOW & CITIZEN ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- 5. CITIZEN ISOLATION & BUSINESS RULES ---');

    // Register Bob
    const regBob = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Bob Dylan', email: bobEmail, password })
    });
    const bobToken = regBob.data.token;
    const bobUserId = regBob.data.user.id;

    // Alice creates a pickup
    const createAliceReq = await fetchJson('/api/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        item_name: 'Alice MacBook Pro 2021',
        category: 'Computers & Laptops',
        quantity: 1,
        address: 'Hostel 4, Room 201',
        city: 'Mumbai',
        pickup_date: '2026-10-25',
        time_slot: '10:00 AM - 12:00 PM'
      })
    });
    assert('Alice creates pickup request', createAliceReq.status === 201 && createAliceReq.data.id);
    const aliceReqId = createAliceReq.data.id;

    // Verify ownership in DB: user_id must match aliceUserId
    const [aliceDbRow] = await db.query('SELECT * FROM collection_requests WHERE id = ?', [aliceReqId]);
    assert('Alice request stored in MySQL with verified user_id', aliceDbRow[0]?.user_id === aliceUserId, `user_id in DB: ${aliceDbRow[0]?.user_id}`);

    // Bob creates a pickup
    const createBobReq = await fetchJson('/api/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({
        item_name: 'Bob Galaxy Tab S8',
        category: 'Mobile Phones & Tablets',
        quantity: 2,
        address: 'Library Hall B',
        city: 'Pune',
        pickup_date: '2026-10-26',
        time_slot: '02:00 PM - 04:00 PM'
      })
    });
    assert('Bob creates pickup request', createBobReq.status === 201 && createBobReq.data.id);
    const bobReqId = createBobReq.data.id;

    // Alice fetches /api/requests: MUST only see her own requests
    const aliceList = await fetchJson('/api/requests', {
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    const aliceHasAliceReq = aliceList.data.some((r) => r.id === aliceReqId);
    const aliceHasBobReq = aliceList.data.some((r) => r.id === bobReqId);
    assert("Alice sees her own request in GET /api/requests", aliceHasAliceReq);
    assert("Alice CANNOT see Bob's request in GET /api/requests", !aliceHasBobReq);

    // Bob fetches /api/requests: MUST only see his own requests
    const bobList = await fetchJson('/api/requests', {
      headers: { Authorization: `Bearer ${bobToken}` }
    });
    const bobHasBobReq = bobList.data.some((r) => r.id === bobReqId);
    const bobHasAliceReq = bobList.data.some((r) => r.id === aliceReqId);
    assert("Bob sees his own request in GET /api/requests", bobHasBobReq);
    assert("Bob CANNOT see Alice's request in GET /api/requests", !bobHasAliceReq);

    // Alice attempts to GET Bob's request by ID
    const aliceGetBob = await fetchJson(`/api/requests/${bobReqId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    assert("Alice CANNOT read Bob's request by ID (403 Forbidden)", aliceGetBob.status === 403, `HTTP ${aliceGetBob.status}`);

    // Alice attempts to update Bob's request
    const alicePutBob = await fetchJson(`/api/requests/${bobReqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert("Alice CANNOT update or cancel Bob's request (403 Forbidden)", alicePutBob.status === 403, `HTTP ${alicePutBob.status}`);

    // Citizen attempts to call admin-only DELETE endpoint
    const aliceDelete = await fetchJson(`/api/requests/${aliceReqId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    assert("Citizen CANNOT delete requests (strictly Admin, 403 Forbidden)", aliceDelete.status === 403, `HTTP ${aliceDelete.status}`);

    // Citizen attempts to change status to 'Approved'
    const aliceSelfApprove = await fetchJson(`/api/requests/${aliceReqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ status: 'Approved' })
    });
    assert("Citizen CANNOT self-approve or elevate status (403 Forbidden)", aliceSelfApprove.status === 403, `HTTP ${aliceSelfApprove.status}`);

    // -------------------------------------------------------------
    // TEST GROUP 6: ADMIN PRIVILEGES & BUSINESS RULES
    // -------------------------------------------------------------
    console.log('\n--- 6. ADMIN PRIVILEGES & CANCELLATION RULES ---');

    // Admin lists all requests
    const adminList = await fetchJson('/api/requests', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminSeesAlice = adminList.data.some((r) => r.id === aliceReqId);
    const adminSeesBob = adminList.data.some((r) => r.id === bobReqId);
    const adminSeesLegacy = adminList.data.some((r) => r.id === 1);
    assert('Admin sees Alice request', adminSeesAlice);
    assert('Admin sees Bob request', adminSeesBob);
    assert('Admin sees historical/legacy request with user_id=NULL', adminSeesLegacy);

    // Admin updates Alice request to 'Scheduled'
    const adminSchedule = await fetchJson(`/api/requests/${aliceReqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'Scheduled' })
    });
    assert('Admin updates request status to Scheduled', adminSchedule.status === 200 && adminSchedule.data.status === 'Scheduled');

    // Business Rule Check: Alice attempts to cancel her request now that it is Scheduled
    const aliceCancelScheduled = await fetchJson(`/api/requests/${aliceReqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert('Citizen CANNOT cancel request once Scheduled (Business rule: HTTP 400)', aliceCancelScheduled.status === 400, `HTTP ${aliceCancelScheduled.status}: ${aliceCancelScheduled.data.error}`);

    // Bob cancels his Pending request (allowed)
    const bobCancelPending = await fetchJson(`/api/requests/${bobReqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${bobToken}` },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    assert('Citizen CAN cancel own request while status is Pending', bobCancelPending.status === 200 && bobCancelPending.data.status === 'Cancelled');

    // -------------------------------------------------------------
    // TEST GROUP 7: PRESERVE PHP & DOM ASSIGNMENTS
    // -------------------------------------------------------------
    console.log('\n--- 7. ASSIGNMENT PRESERVATION (PHP & DOM) ---');

    // DOM Demo
    const domRes = await fetch(`${BASE_URL}/dom-demo.html`);
    const domText = await domRes.text();
    const domOk = domRes.status === 200 && domText.includes('DOM Manipulation Assignment Demonstration');
    assert('DOM demonstration page accessible at http://localhost:5000/dom-demo.html', domOk, `HTTP ${domRes.status}`);

    // PHP Login
    const phpRes = await fetch(`${PHP_URL}/php/login.php`);
    const phpText = await phpRes.text();
    const phpOk = phpRes.status === 200 && phpText.includes('EcoCycle');
    assert('PHP demonstration accessible at http://localhost:8000/php/login.php', phpOk, `HTTP ${phpRes.status}`);

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`TEST SUITE SUMMARY: ${results.filter((r) => r.status === 'PASS').length}/${results.length} PASSED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test Suite encountered uncaught error:', err);
  } finally {
    await db.end();
  }
}

runTests();
