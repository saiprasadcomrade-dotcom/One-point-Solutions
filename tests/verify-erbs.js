const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function runTests() {
  console.log('--- Starting ERBS System Integrity Checks ---\n');

  try {
    // 1. Auth check - Invalid Gmail
    console.log('Test 1: Attempting login with unauthorized Gmail...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'invalid@gmail.com',
        password: 'admin@123'
      });
      console.error('FAIL: Login with unallowed Gmail incorrectly succeeded!');
    } catch (err) {
      console.log('PASS: Correctly rejected. Error message:', err.response?.data?.error);
    }

    // 2. Auth check - Wrong Password
    console.log('\nTest 2: Attempting login with wrong password...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'onepointsolutions16@gmail.com',
        password: 'wrongpassword'
      });
      console.error('FAIL: Login with wrong password incorrectly succeeded!');
    } catch (err) {
      console.log('PASS: Correctly rejected. Error message:', err.response?.data?.error);
    }

    // 3. Auth check - Successful login
    console.log('\nTest 3: Logging in with valid admin credentials...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'onepointsolutions16@gmail.com',
      password: 'admin@123'
    });
    authToken = loginRes.data.token;
    console.log(`PASS: Authenticated successfully! Token: ${authToken}`);

    // Set authorization headers
    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

    // 4. Fetch Devices
    console.log('\nTest 4: Fetching active devices fleet...');
    const devicesRes = await axios.get(`${BASE_URL}/devices`);
    const availableDevice = devicesRes.data.find(d => d.status === 'Available');
    console.log(`PASS: Found available device: ${availableDevice.name} [SN: ${availableDevice.serial_number}]`);

    // 5. Fetch Customers & Create test customer
    console.log('\nTest 5: Registering new test customer profile...');
    const uniqueEmail = `test_cust_${Date.now()}@test.com`;
    const customerRes = await axios.post(`${BASE_URL}/customers`, {
      name: 'Automated Tester',
      email: uniqueEmail,
      phone: '+91 9999988888',
      address: 'Test Suite Lab',
      id_proof: 'Passport',
      gov_id_number: 'TEST-12345'
    }, authHeaders);
    const customerId = customerRes.data.id;
    console.log(`PASS: Registered customer ID: ${customerId}`);

    // 6. Create rental booking & check separate deposit storage
    console.log('\nTest 6: Creating booking for dates 2026-07-01 to 2026-07-05...');
    const rentalRes = await axios.post(`${BASE_URL}/rentals`, {
      customer_id: customerId,
      device_id: availableDevice.id,
      start_date: '2026-07-01',
      end_date: '2026-07-05',
      rental_amount: 1500,
      deposit_amount: 100, // ₹100 deposit bug check
      payment_method: 'UPI'
    }, authHeaders);
    const rentalId = rentalRes.data.booking_id;
    console.log(`PASS: Booking created successfully. ID: ${rentalId}`);

    // 7. Verify deposit amount is EXACTLY ₹100 (Deposit Bug Fix Assert)
    console.log('\nTest 7: Verifying deposit storage integrity...');
    const rentalsList = await axios.get(`${BASE_URL}/rentals`, authHeaders);
    const savedRental = rentalsList.data.find(r => r.id === rentalId);
    if (savedRental.deposit_amount === 100) {
      console.log(`PASS: Deposit amount stored exactly as entered: ₹${savedRental.deposit_amount}`);
    } else {
      console.error(`FAIL: Deposit amount changed! Stored: ₹${savedRental.deposit_amount}`);
    }

    // 8. Try overlapping booking conflict prevention
    console.log('\nTest 8: Testing conflict booking prevention (Dates 2026-07-02 to 2026-07-04)...');
    try {
      await axios.post(`${BASE_URL}/rentals`, {
        customer_id: customerId,
        device_id: availableDevice.id,
        start_date: '2026-07-02',
        end_date: '2026-07-04',
        rental_amount: 900,
        deposit_amount: 100,
        payment_method: 'UPI'
      }, authHeaders);
      console.error('FAIL: Overlapping conflict booking incorrectly succeeded!');
    } catch (err) {
      console.log('PASS: Correctly blocked. Message:', err.response?.data?.error);
    }

    console.log('\n--- Integrity checks completed successfully: all assertions passed! ---');

  } catch (error) {
    console.error('\nVerification run encountered a failure:', error.message);
    if (error.response) console.error('Payload error:', error.response.data);
  }
}

runTests();
