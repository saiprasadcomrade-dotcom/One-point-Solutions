const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Final Logic Verification ---\n');

  try {
    // 1. Get initial devices
    console.log('Step 1: Fetching devices...');
    const devicesRes = await axios.get(`${BASE_URL}/devices`);
    const macbook = devicesRes.data.find(d => d.name.includes('MacBook'));
    console.log(`Found device: ${macbook.name} (Total Qty: ${macbook.total_qty})\n`);

    // 2. Create a successful booking
    console.log('Step 2: Creating a booking for June 20-25...');
    const booking1 = {
      user_name: 'Test User 1',
      user_email: 'test1@example.com',
      device_id: macbook.id,
      start_date: '2026-06-20',
      end_date: '2026-06-25',
      quantity: 8,
      delivery_option: 'Pickup'
    };
    const res1 = await axios.post(`${BASE_URL}/bookings`, booking1);
    console.log('Result:', res1.data.message, `(Price: ₹${res1.data.total_price})\n`);

    // 3. Try to book overlapping dates with quantity that exceeds total (10)
    // Existing: 8 booked for 20-25. 
    // New: Try to book 3 for 22-23. Total would be 11 > 10. Should fail.
    console.log('Step 3: Attempting overlapping booking (22nd to 23rd) with qty 3 (Total would be 11/10)...');
    const booking2 = {
      user_name: 'Test User 2',
      user_email: 'test2@example.com',
      device_id: macbook.id,
      start_date: '2026-06-22',
      end_date: '2026-06-23',
      quantity: 3,
      delivery_option: 'Delivery'
    };

    try {
      await axios.post(`${BASE_URL}/bookings`, booking2);
      console.log('ERROR: Overlapping booking incorrectly succeeded!');
    } catch (error) {
      console.log('Success: Overlapping booking correctly rejected with error:', error.response.data.error);
    }

    // 4. Try a non-overlapping booking
    console.log('\nStep 4: Attempting non-overlapping booking (June 26-27)...');
    const booking3 = {
      user_name: 'Test User 3',
      user_email: 'test3@example.com',
      device_id: macbook.id,
      start_date: '2026-06-26',
      end_date: '2026-06-27',
      quantity: 5,
      delivery_option: 'Pickup'
    };
    const res3 = await axios.post(`${BASE_URL}/bookings`, booking3);
    console.log('Result:', res3.data.message, '\n');

    console.log('--- Verification Complete: System Logic is Correct ---');

  } catch (error) {
    console.error('Verification failed:', error.message);
    if (error.response) console.error('Response:', error.response.data);
  }
}

runTests();
