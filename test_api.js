/**
 * Automated Comprehensive Test Suite for winVest Advisory Backend (Phase 1)
 * Authentication: User Model (username/password) in "users" collection
 */
const http = require('http');

const BASE_HOST = '127.0.0.1';
const BASE_PORT = process.env.PORT || 5000;

// Helper to send HTTP requests
const request = ({ method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };

    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        host: BASE_HOST,
        port: BASE_PORT,
        method,
        path,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = rawData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

let passedCount = 0;
let failedCount = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? '- ' + JSON.stringify(details) : ''}`);
    failedCount++;
  }
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🚀 RUNNING AUTOMATED WINVEST BACKEND API TEST SUITE');
  console.log('   (User Model / "users" collection / username+password)');
  console.log('======================================================\n');

  let authToken = '';
  let createdRecId = '';
  let secondRecId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    console.log('--- 1. Health & Server Status ---');
    const healthRes = await request({ method: 'GET', path: '/api/health' });
    assert(healthRes.status === 200 && healthRes.body.success === true, 'Health check returns HTTP 200', healthRes.body);

    // ----------------------------------------------------
    // TEST 2: User Authentication Tests
    // ----------------------------------------------------
    console.log('\n--- 2. User Authentication (username / password) Tests ---');

    // 2.1 Missing username
    const missingUserRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { password: 'AdminPassword@123' }
    });
    assert(missingUserRes.status === 400 && missingUserRes.body.success === false, 'Login without username returns 400 Bad Request');

    // 2.2 Missing password
    const missingPassRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'admin' }
    });
    assert(missingPassRes.status === 400 && missingPassRes.body.success === false, 'Login without password returns 400 Bad Request');

    // 2.3 Wrong password
    const wrongPassRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'admin', password: 'WrongPassword999' }
    });
    assert(
      wrongPassRes.status === 401 &&
      wrongPassRes.body.message === 'Invalid username or password',
      'Login with wrong password returns 401 "Invalid username or password"'
    );

    // 2.4 Non-existent username
    const noUserRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'doesnotexist', password: 'Password123' }
    });
    assert(
      noUserRes.status === 401 &&
      noUserRes.body.message === 'Invalid username or password',
      'Login with non-existent username returns generic 401 message'
    );

    // 2.5 Correct credentials
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'admin', password: 'AdminPassword@123' }
    });
    assert(
      loginRes.status === 200 &&
      loginRes.body.success === true &&
      loginRes.body.data?.user?.username === 'admin' &&
      loginRes.body.data?.user?.role === 'admin' &&
      Boolean(loginRes.body.data?.token),
      'Login with correct username & password returns 200, user data and JWT token'
    );
    authToken = loginRes.body.data?.token;

    // 2.6 Profile fetch (GET /api/auth/me)
    const profileRes = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      profileRes.status === 200 &&
      profileRes.body.data?.user?.username === 'admin' &&
      profileRes.body.data?.user?.role === 'admin',
      'GET /api/auth/me with valid Bearer token returns authenticated User profile'
    );

    // ----------------------------------------------------
    // TEST 3: verifyLogin Middleware Security Tests
    // ----------------------------------------------------
    console.log('\n--- 3. verifyLogin Middleware Security Tests ---');

    // 3.1 Missing token
    const noTokenRes = await request({
      method: 'GET',
      path: '/api/recommendations'
    });
    assert(
      noTokenRes.status === 401 &&
      noTokenRes.body.message === 'Token not provided',
      'GET /api/recommendations without token returns 401 "Token not provided"'
    );

    // 3.2 Invalid token
    const invalidTokenRes = await request({
      method: 'GET',
      path: '/api/recommendations',
      headers: { Authorization: 'Bearer fake.invalid.token' }
    });
    assert(
      invalidTokenRes.status === 401 &&
      invalidTokenRes.body.message === 'Invalid token',
      'GET /api/recommendations with invalid token returns 401 "Invalid token"'
    );

    // ----------------------------------------------------
    // TEST 4: Recommendation Validation Tests
    // ----------------------------------------------------
    console.log('\n--- 4. Recommendation Validation Tests ---');

    // 4.1 Missing required fields
    const missingFieldsRes = await request({
      method: 'POST',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {}
    });
    assert(
      missingFieldsRes.status === 400 && missingFieldsRes.body.success === false,
      'POST /api/recommendations with empty body returns 400 Validation Error'
    );

    // 4.2 Invalid action enum
    const invalidActionRes = await request({
      method: 'POST',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        stockName: 'Tata Consultancy Services',
        symbol: 'TCS',
        action: 'SUPER_BUY',
        entryPrice: 3500,
        targetPrice: 3800,
        stopLoss: 3350
      }
    });
    assert(
      invalidActionRes.status === 400 &&
      invalidActionRes.body.message.includes('Action must be BUY, SELL, or HOLD'),
      'POST with invalid action enum returns 400 with clear message'
    );

    // 4.3 Negative price values
    const negativePriceRes = await request({
      method: 'POST',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        stockName: 'Infosys Ltd',
        symbol: 'INFY',
        action: 'BUY',
        entryPrice: -1500,
        targetPrice: 1600,
        stopLoss: 1400
      }
    });
    assert(
      negativePriceRes.status === 400,
      'POST with negative price returns 400 Bad Request'
    );

    // 4.4 Invalid ObjectId format
    const badIdRes = await request({
      method: 'GET',
      path: '/api/recommendations/123-invalid-id',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      badIdRes.status === 400 &&
      badIdRes.body.message.includes('Invalid recommendation ID format'),
      'GET /api/recommendations/invalid-id returns 400 Bad Request'
    );

    // ----------------------------------------------------
    // TEST 5: Recommendation CRUD Operations
    // ----------------------------------------------------
    console.log('\n--- 5. Recommendation CRUD Operations Tests ---');

    // 5.1 Create Recommendation 1 (TCS - BUY)
    const createRec1 = await request({
      method: 'POST',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        stockName: 'Tata Consultancy Services',
        symbol: 'TCS',
        action: 'BUY',
        exchange: 'NSE',
        entryPrice: 3500,
        targetPrice: 3800,
        stopLoss: 3350,
        currentPrice: 3520,
        recommendationDate: '2026-09-07T00:00:00.000Z',
        validTill: '2026-10-07T00:00:00.000Z',
        status: 'ACTIVE',
        researchReason: 'Strong deal pipeline, robust quarterly margin expansion and upbeat cloud demand outlook.'
      }
    });
    assert(
      createRec1.status === 201 &&
      createRec1.body.success === true &&
      createRec1.body.data?.recommendation?.symbol === 'TCS',
      'POST /api/recommendations creates recommendation successfully (TCS)'
    );
    createdRecId = createRec1.body.data?.recommendation?._id;

    // Verify createdBy is securely tied to logged-in user in users collection
    assert(
      createRec1.body.data?.recommendation?.createdBy?.username === 'admin' &&
      createRec1.body.data?.recommendation?.createdBy?.role === 'admin',
      'Recommendation createdBy is populated from "users" collection (username: admin, role: admin)'
    );

    // 5.2 Create Recommendation 2 (Reliance - HOLD)
    const createRec2 = await request({
      method: 'POST',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        stockName: 'Reliance Industries Ltd',
        symbol: 'RELIANCE',
        action: 'HOLD',
        exchange: 'NSE',
        entryPrice: 2950,
        targetPrice: 3100,
        stopLoss: 2850,
        currentPrice: 2960,
        status: 'ACTIVE',
        researchReason: 'Retail and telecom growth steady, awaiting energy expansion catalysts.'
      }
    });
    assert(
      createRec2.status === 201,
      'POST /api/recommendations creates second recommendation (RELIANCE)'
    );
    secondRecId = createRec2.body.data?.recommendation?._id;

    // 5.3 Create Recommendation 3 (HDFC Bank - SELL)
    await request({
      method: 'POST',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        stockName: 'HDFC Bank Limited',
        symbol: 'HDFCBANK',
        action: 'SELL',
        exchange: 'NSE',
        entryPrice: 1650,
        targetPrice: 1550,
        stopLoss: 1700,
        currentPrice: 1640,
        status: 'ACTIVE',
        researchReason: 'Short-term margin compression post merger integration.'
      }
    });

    // 5.4 GET All Recommendations
    const getAllRes = await request({
      method: 'GET',
      path: '/api/recommendations',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      getAllRes.status === 200 &&
      getAllRes.body.data?.recommendations?.length >= 3 &&
      getAllRes.body.meta?.total >= 3,
      'GET /api/recommendations returns list with pagination metadata'
    );

    // 5.5 Filter by Action: BUY
    const filterBuyRes = await request({
      method: 'GET',
      path: '/api/recommendations?action=BUY',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const allAreBuy = filterBuyRes.body.data?.recommendations?.every((r) => r.action === 'BUY');
    assert(
      filterBuyRes.status === 200 && allAreBuy,
      'GET /api/recommendations?action=BUY filters properly'
    );

    // 5.6 Search by Symbol/StockName
    const searchRes = await request({
      method: 'GET',
      path: '/api/recommendations?search=RELIANCE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const allMatchReliance = searchRes.body.data?.recommendations?.length >= 1 &&
      searchRes.body.data.recommendations.every((r) => r.symbol.toUpperCase().includes('RELIANCE') || r.stockName.toUpperCase().includes('RELIANCE'));
    assert(
      searchRes.status === 200 && allMatchReliance,
      'GET /api/recommendations?search=RELIANCE searches by symbol/name'
    );

    // 5.7 Get single recommendation by ID
    const getSingleRes = await request({
      method: 'GET',
      path: `/api/recommendations/${createdRecId}`,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      getSingleRes.status === 200 &&
      getSingleRes.body.data?.recommendation?.symbol === 'TCS',
      'GET /api/recommendations/:id returns single recommendation'
    );

    // 5.8 Get non-existent valid ObjectId
    const notFoundRes = await request({
      method: 'GET',
      path: '/api/recommendations/507f1f77bcf86cd799439011',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      notFoundRes.status === 404 && notFoundRes.body.message === 'Recommendation not found',
      'GET /api/recommendations/:id for non-existent ID returns 404'
    );

    // 5.9 Update Recommendation
    const updateRes = await request({
      method: 'PUT',
      path: `/api/recommendations/${createdRecId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        targetPrice: 3950,
        currentPrice: 3750,
        status: 'CLOSED',
        researchReason: 'Target achieved ahead of timeline. Booked profits.'
      }
    });
    assert(
      updateRes.status === 200 &&
      updateRes.body.data?.recommendation?.targetPrice === 3950 &&
      updateRes.body.data?.recommendation?.status === 'CLOSED',
      'PUT /api/recommendations/:id updates fields correctly'
    );

    // 5.10 Delete Recommendation
    const deleteRes = await request({
      method: 'DELETE',
      path: `/api/recommendations/${createdRecId}`,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      deleteRes.status === 200 &&
      deleteRes.body.message === 'Recommendation deleted successfully',
      'DELETE /api/recommendations/:id deletes recommendation successfully'
    );

    // 5.11 Confirm Deleted Recommendation is 404
    const getDeletedRes = await request({
      method: 'GET',
      path: `/api/recommendations/${createdRecId}`,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(
      getDeletedRes.status === 404,
      'GET /api/recommendations/:id after deletion returns 404'
    );

    // ----------------------------------------------------
    // TEST 6: 404 Handler for Unhandled Routes
    // ----------------------------------------------------
    console.log('\n--- 6. 404 Handler Tests ---');
    const unknownRouteRes = await request({
      method: 'GET',
      path: '/api/some-unknown-route'
    });
    assert(
      unknownRouteRes.status === 404 &&
      unknownRouteRes.body.success === false,
      'GET /api/some-unknown-route returns 404 Not Found'
    );

  } catch (error) {
    console.error('Fatal test error:', error);
    failedCount++;
  }

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
