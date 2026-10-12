// Test script for Citizen & Admin Authentication & Role Enforcement
const http = require('http');

function apiCall(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        ...(postData ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw), raw });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  const pool = require('../backend/config/db');

  console.log('--- Starting Authentication & Authorization Security Tests ---');

  // Clean up any test users from prior runs
  await pool.query("DELETE FROM users WHERE email IN ('citizena@campus.edu', 'citizenb@campus.edu')");
  await pool.query("DELETE FROM collection_requests WHERE email IN ('citizena@campus.edu', 'citizenb@campus.edu')");

  const results = [];

  // 1. Unauthenticated access to /api/requests must be rejected with 401
  const rUnauth = await apiCall('GET', '/api/requests');
  results.push({
    test: 'Unauthenticated GET /api/requests rejected with 401',
    pass: rUnauth.status === 401,
    details: { status: rUnauth.status, error: rUnauth.body.error }
  });

  // 2. Citizen Registration with invalid input
  const rBadReg = await apiCall('POST', '/api/auth/register', { name: '', email: 'notanemail', password: '123' });
  results.push({
    test: 'Citizen registration rejects invalid input (400)',
    pass: rBadReg.status === 400,
    details: { status: rBadReg.status, error: rBadReg.body.error }
  });

  // 3. Public registration cannot create an admin
  const rAdminReg = await apiCall('POST', '/api/auth/register', {
    name: 'Hacker Admin',
    email: 'hacker@campus.edu',
    password: 'password123',
    role: 'admin'
  });
  results.push({
    test: 'Public registration cannot create admin role (403)',
    pass: rAdminReg.status === 403,
    details: { status: rAdminReg.status, error: rAdminReg.body.error }
  });

  // 4. Valid Citizen A Registration
  const rRegA = await apiCall('POST', '/api/auth/register', {
    name: 'Citizen Alpha',
    email: 'citizena@campus.edu',
    password: 'Password@123'
  });
  const tokenA = rRegA.body.token;
  results.push({
    test: 'Valid Citizen A registration succeeds (201) and returns token',
    pass: rRegA.status === 201 && !!tokenA && rRegA.body.user.role === 'citizen',
    details: { status: rRegA.status, user: rRegA.body.user }
  });

  // 5. Verify password in MySQL is hashed using bcrypt
  const [dbUserA] = await pool.query("SELECT * FROM users WHERE email = 'citizena@campus.edu'");
  const isBcrypt = dbUserA.length > 0 && dbUserA[0].password.startsWith('$2a$') || dbUserA[0].password.startsWith('$2b$');
  results.push({
    test: 'Citizen password is encrypted with bcrypt in MySQL',
    pass: isBcrypt,
    details: { isHashed: isBcrypt }
  });

  // 6. Duplicate email registration rejected
  const rDupReg = await apiCall('POST', '/api/auth/register', {
    name: 'Citizen Duplicate',
    email: 'citizena@campus.edu',
    password: 'Password@123'
  });
  results.push({
    test: 'Duplicate email registration rejected (400)',
    pass: rDupReg.status === 400,
    details: { status: rDupReg.status, error: rDupReg.body.error }
  });

  // 7. Citizen A login with incorrect password
  const rBadLogin = await apiCall('POST', '/api/auth/login', {
    email: 'citizena@campus.edu',
    password: 'WrongPassword'
  });
  results.push({
    test: 'Citizen login with wrong password rejected (401 generic error)',
    pass: rBadLogin.status === 401 && rBadLogin.body.error === 'Invalid email or password.',
    details: { status: rBadLogin.status, error: rBadLogin.body.error }
  });

  // 8. Citizen A login with correct password
  const rLoginA = await apiCall('POST', '/api/auth/login', {
    email: 'citizena@campus.edu',
    password: 'Password@123'
  });
  results.push({
    test: 'Citizen A login succeeds (200) with JWT',
    pass: rLoginA.status === 200 && !!rLoginA.body.token,
    details: { status: rLoginA.status }
  });

  // 9. Register Citizen B
  const rRegB = await apiCall('POST', '/api/auth/register', {
    name: 'Citizen Beta',
    email: 'citizenb@campus.edu',
    password: 'Password@456'
  });
  const tokenB = rRegB.body.token;

  // 10. Citizen A submits a pickup request
  const rCreateA = await apiCall('POST', '/api/requests', {
    phone: '9876543210',
    category: 'Computers & Laptops',
    item_name: 'Dell XPS 13 Alpha',
    quantity: 1,
    address: 'Room 101, Science Hall',
    city: 'Pune',
    pickup_date: '2026-10-30',
    time_slot: 'Morning (09:00 AM – 12:00 PM)'
  }, tokenA);
  const reqIdA = rCreateA.body.id;
  results.push({
    test: 'Citizen A creates pickup request bound to user_id (201)',
    pass: rCreateA.status === 201 && !!reqIdA && rCreateA.body.user_name === 'Citizen Alpha',
    details: { id: reqIdA, owner: rCreateA.body.user_name }
  });

  // 11. Citizen B submits a pickup request
  const rCreateB = await apiCall('POST', '/api/requests', {
    phone: '9822001122',
    category: 'Mobile Phones & Tablets',
    item_name: 'OnePlus 9 Beta',
    quantity: 1,
    address: 'Room 202, Arts Hall',
    city: 'Pune',
    pickup_date: '2026-10-31',
    time_slot: 'Afternoon (12:00 PM – 04:00 PM)'
  }, tokenB);
  const reqIdB = rCreateB.body.id;

  // 12. Citizen A gets requests: MUST only see their own request (reqIdA), NOT Citizen B's (reqIdB)
  const rListA = await apiCall('GET', '/api/requests', null, tokenA);
  const aContainsA = rListA.body.some(r => r.id === reqIdA);
  const aContainsB = rListA.body.some(r => r.id === reqIdB);
  results.push({
    test: 'Citizen A sees ONLY their own requests (cannot see Citizen B)',
    pass: rListA.status === 200 && aContainsA && !aContainsB,
    details: { sawOwn: aContainsA, sawOther: aContainsB, totalSeen: rListA.body.length }
  });

  // 13. Citizen A tries to read Citizen B's request by ID (GET /api/requests/:idB) -> MUST be 403
  const rAreadsB = await apiCall('GET', `/api/requests/${reqIdB}`, null, tokenA);
  results.push({
    test: "Citizen A cannot read Citizen B's request by ID (403 Forbidden)",
    pass: rAreadsB.status === 403,
    details: { status: rAreadsB.status, error: rAreadsB.body.error }
  });

  // 14. Citizen A tries to cancel Citizen B's request -> MUST be 403
  const rAcancelsB = await apiCall('PUT', `/api/requests/${reqIdB}`, { status: 'Cancelled' }, tokenA);
  results.push({
    test: "Citizen A cannot cancel Citizen B's request (403 Forbidden)",
    pass: rAcancelsB.status === 403,
    details: { status: rAcancelsB.status, error: rAcancelsB.body.error }
  });

  // 15. Citizen A tries to call admin status transition (Approved) -> MUST be 403
  const rAapproves = await apiCall('PUT', `/api/requests/${reqIdA}`, { status: 'Approved' }, tokenA);
  results.push({
    test: 'Citizen cannot transition operational status to Approved (403)',
    pass: rAapproves.status === 403,
    details: { status: rAapproves.status, error: rAapproves.body.error }
  });

  // 16. Citizen A tries to DELETE a request -> MUST be 403
  const rAdelete = await apiCall('DELETE', `/api/requests/${reqIdA}`, null, tokenA);
  results.push({
    test: 'Citizen cannot delete requests (403 Forbidden)',
    pass: rAdelete.status === 403,
    details: { status: rAdelete.status, error: rAdelete.body.error }
  });

  // 17. Citizen A cancels their own Pending request -> MUST be 200
  const rAcancelsOwn = await apiCall('PUT', `/api/requests/${reqIdA}`, { status: 'Cancelled' }, tokenA);
  results.push({
    test: 'Citizen A can cancel their own Pending request (200)',
    pass: rAcancelsOwn.status === 200 && rAcancelsOwn.body.status === 'Cancelled',
    details: { status: rAcancelsOwn.status, newStatus: rAcancelsOwn.body.status }
  });

  // 18. Admin login with invalid password
  const rBadAdmin = await apiCall('POST', '/api/auth/login', {
    email: 'admin@ecocycle.org',
    password: 'WrongPassword'
  });
  results.push({
    test: 'Administrator login with invalid password rejected (401)',
    pass: rBadAdmin.status === 401,
    details: { status: rBadAdmin.status }
  });

  // 19. Admin login with configured credentials
  const rAdminLogin = await apiCall('POST', '/api/auth/login', {
    email: 'admin@ecocycle.org',
    password: 'AdminSecure@2026'
  });
  const adminToken = rAdminLogin.body.token;
  results.push({
    test: 'Administrator login succeeds with configured credentials (200)',
    pass: rAdminLogin.status === 200 && !!adminToken && rAdminLogin.body.user.role === 'admin',
    details: { status: rAdminLogin.status, user: rAdminLogin.body.user }
  });

  // 20. Admin views all requests (sees Citizen A, Citizen B, and legacy unassigned requests)
  const rAdminList = await apiCall('GET', '/api/requests', null, adminToken);
  const adminHasA = rAdminList.body.some(r => r.id === reqIdA);
  const adminHasB = rAdminList.body.some(r => r.id === reqIdB);
  results.push({
    test: 'Administrator sees ALL requests across citizens and legacy records',
    pass: rAdminList.status === 200 && adminHasA && adminHasB && rAdminList.body.length >= 2,
    details: { sawA: adminHasA, sawB: adminHasB, totalSeen: rAdminList.body.length }
  });

  // 21. Admin updates status of Citizen B request to Scheduled
  const rAdminSchedule = await apiCall('PUT', `/api/requests/${reqIdB}`, { status: 'Scheduled' }, adminToken);
  results.push({
    test: 'Administrator updates status to Scheduled (200)',
    pass: rAdminSchedule.status === 200 && rAdminSchedule.body.status === 'Scheduled',
    details: { status: rAdminSchedule.status, newStatus: rAdminSchedule.body.status }
  });

  // 22. Business Rule: Citizen B attempts to cancel request that is now Scheduled -> MUST be 400
  const rBcancelScheduled = await apiCall('PUT', `/api/requests/${reqIdB}`, { status: 'Cancelled' }, tokenB);
  results.push({
    test: 'Citizen cannot cancel a request once Scheduled (400 Business Rule)',
    pass: rBcancelScheduled.status === 400,
    details: { status: rBcancelScheduled.status, error: rBcancelScheduled.body.error }
  });

  // 23. Admin deletes test request
  const rAdminDelete = await apiCall('DELETE', `/api/requests/${reqIdA}`, null, adminToken);
  const rAdminDeleteB = await apiCall('DELETE', `/api/requests/${reqIdB}`, null, adminToken);
  results.push({
    test: 'Administrator can delete requests (200)',
    pass: rAdminDelete.status === 200 && rAdminDeleteB.status === 200,
    details: { deleteA: rAdminDelete.status, deleteB: rAdminDeleteB.status }
  });

  // Clean up test users
  await pool.query("DELETE FROM users WHERE email IN ('citizena@campus.edu', 'citizenb@campus.edu')");

  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})();
