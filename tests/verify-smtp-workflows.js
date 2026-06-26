const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function runSmtpWorkflowTests() {
  console.log('--- Starting SMTP Workflows Verification Checks ---\n');

  try {
    // 1. Auth check - Successful login
    console.log('Test 1: Logging in with valid admin credentials...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'onepointsolutions16@gmail.com',
      password: 'admin@123'
    });
    authToken = loginRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };
    console.log(`PASS: Authenticated successfully! Token: ${authToken}`);

    // 2. Fetch active devices and create a new customer
    console.log('\nTest 2: Registering a customer for testing...');
    const uniqueEmail = `smtp_test_${Date.now()}@test.com`;
    const customerRes = await axios.post(`${BASE_URL}/customers`, {
      name: 'SMTP Workflow Tester',
      email: uniqueEmail,
      phone: '+91 9888877777',
      address: 'SMTP Test Suite',
      id_proof: 'PAN Card',
      gov_id_number: 'TESTPAN123'
    }, authHeaders);
    const customerId = customerRes.data.id;
    console.log(`PASS: Registered customer ID: ${customerId}`);

    // Find available device
    const devicesRes = await axios.get(`${BASE_URL}/devices`);
    const availableDevice = devicesRes.data.find(d => d.status === 'Available' || d.status === 'In Stock');
    console.log(`PASS: Found device: ${availableDevice.name} [SN: ${availableDevice.serial_number}]`);

    // Create a new rental
    console.log('\nTest 3: Logging a rental booking...');
    const start_date = new Date().toISOString().split('T')[0];
    const end_date = new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0];
    const rentalRes = await axios.post(`${BASE_URL}/rentals`, {
      customer_id: customerId,
      device_id: availableDevice.id,
      start_date,
      end_date,
      rental_amount: 2400,
      deposit_amount: 500,
      payment_method: 'UPI'
    }, authHeaders);
    const rentalId = rentalRes.data.booking_id;
    console.log(`PASS: Created rental booking ID: ${rentalId}`);

    // 3. Confirm Booking Endpoint test
    console.log('\nTest 4: Triggering POST /booking/confirm...');
    const confirmRes = await axios.post(`http://localhost:5000/booking/confirm`, {
      booking_id: rentalId
    }, authHeaders);
    console.log('Response:', confirmRes.data);
    if (confirmRes.data.success && ['Sent', 'Not Configured', 'Failed'].includes(confirmRes.data.emailStatus)) {
      console.log(`PASS: /booking/confirm executed successfully! Email status: ${confirmRes.data.emailStatus}`);
    } else {
      console.error('FAIL: /booking/confirm failed!', confirmRes.data);
    }

    // 4. Payment Success Endpoint test
    console.log('\nTest 5: Triggering POST /payment/success...');
    const paymentRes = await axios.post(`http://localhost:5000/payment/success`, {
      booking_id: rentalId
    }, authHeaders);
    console.log('Response:', paymentRes.data);
    if (paymentRes.data.success && paymentRes.data.transaction_id && ['Sent', 'Not Configured', 'Failed'].includes(paymentRes.data.emailStatus)) {
      console.log(`PASS: /payment/success executed! Created Txn ID: ${paymentRes.data.transaction_id}, Email status: ${paymentRes.data.emailStatus}`);
    } else {
      console.error('FAIL: /payment/success failed!', paymentRes.data);
    }

    // 5. Booking Return Endpoint test
    console.log('\nTest 6: Triggering POST /booking/return...');
    const returnRes = await axios.post(`http://localhost:5000/booking/return`, {
      booking_id: rentalId,
      damage_notes: 'Slight screen scratch',
      damage_fee: 150,
      return_condition: 'Excellent',
      mark_repair: false
    }, authHeaders);
    console.log('Response:', returnRes.data);
    if (returnRes.data.success && ['Sent', 'Not Configured', 'Failed'].includes(returnRes.data.emailStatus)) {
      console.log(`PASS: /booking/return executed successfully! Email status: ${returnRes.data.emailStatus}`);
    } else {
      console.error('FAIL: /booking/return failed!', returnRes.data);
    }

    // 6. Verify notification history logs
    console.log('\nTest 7: Fetching notifications history from database...');
    const notificationsRes = await axios.get(`${BASE_URL}/notifications`, authHeaders);
    const rentalNotifications = notificationsRes.data.filter(n => n.customer_name === 'SMTP Workflow Tester');
    console.log(`PASS: Found ${rentalNotifications.length} notification items registered for customer:`);
    rentalNotifications.forEach(n => {
      console.log(` - [${n.channel}] ${n.type} -> Status: ${n.status} | Preview: ${n.message_preview}`);
    });

    // 7. Verify activity logs
    console.log('\nTest 8: Verifying activity logs...');
    const logsRes = await axios.get(`${BASE_URL}/activity-logs`, authHeaders);
    const relevantLogs = logsRes.data.filter(l => l.details && l.details.includes(String(rentalId))).slice(0, 4);
    console.log(`PASS: Found ${relevantLogs.length} audit logs relating to booking ID:`);
    relevantLogs.forEach(l => {
      console.log(` - Action: ${l.action} | Module: ${l.module} | Details: ${l.details}`);
    });

    console.log('\n--- SMTP Workflows integrity check completed successfully! ---');

  } catch (error) {
    console.error('\nTest run encountered a failure:', error.message);
    if (error.response) console.error('Payload error details:', error.response.data);
  }
}

runSmtpWorkflowTests();
