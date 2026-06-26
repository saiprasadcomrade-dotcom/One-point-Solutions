const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/rental.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');

// Delete old database file for a clean start
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Existing database file deleted for clean setup.');
  } catch (err) {
    console.error('Could not delete database file, continuing: ', err.message);
  }
}

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
console.log('Loading schema.sql...');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('Schema loaded successfully.');

// Seed Settings
console.log('Seeding default settings...');
db.prepare(`
  INSERT INTO settings (id, company_name, company_logo, company_email, company_phone, company_address, company_website, company_support_email, company_whatsapp, admin_password)
  VALUES (1, 'One Point Solutions', '', 'onepointsolutions16@gmail.com', '+91 98765 43210', '123 Tech Park, Bangalore, India', 'www.onepointsolutions.com', 'support@onepointsolutions.com', '+91 98765 43210', 'admin@123')
`).run();

// Seed Admins
console.log('Seeding default admin...');
db.prepare(`
  INSERT INTO admins (name, email, password, googleId, avatarUrl)
  VALUES ('One Point Solutions', 'onepointsolutions16@gmail.com', 'admin@123', NULL, NULL)
`).run();

// Seed Customers
console.log('Seeding customers...');
const customerInsert = db.prepare(`
  INSERT INTO customers (name, email, phone, address, id_proof, gov_id_number, status)
  VALUES (?, ?, ?, ?, ?, ?, 'Active')
`);
customerInsert.run('Rohan Sharma', 'rohan@gmail.com', '+91 9123456789', '42, Indiranagar, Bangalore', 'Aadhaar', '1234-5678-9012');
customerInsert.run('Priya Patel', 'priya@gmail.com', '+91 9876543210', '7B, Marine Drive, Mumbai', 'PAN Card', 'ABCDE1234F');
customerInsert.run('Amit Verma', 'amit@gmail.com', '+91 9988776655', '102, Connaught Place, Delhi', 'Passport', 'Z1234567');
customerInsert.run('Sneha Reddy', 'sneha@gmail.com', '+91 8899001122', '12/A, Jubilee Hills, Hyderabad', 'Aadhaar', '9876-5432-1098');

// Seed Devices (50+ premium electronics)
console.log('Seeding 50+ unique electronics devices...');
const deviceInsert = db.prepare(`
  INSERT INTO devices (name, category, brand, model, serial_number, condition, status, purchase_date, rental_price, deposit_amount, image_url, description, notes, totalQuantity, availableQuantity, bookedQuantity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const seedDevices = [
  // Laptops
  { name: 'MacBook Pro 16" M4 Max', category: 'Laptop', brand: 'Apple', model: 'A3184', serial_number: 'SN-MBP16-001', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-01-10', rental_price: 4800, deposit_amount: 1000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', desc: 'M4 Max, 48GB RAM, 1TB SSD.', total: 10, avail: 10, booked: 0 },
  { name: 'MacBook Pro 16" M4 Max', category: 'Laptop', brand: 'Apple', model: 'A3184', serial_number: 'SN-MBP16-002', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-01-10', rental_price: 4800, deposit_amount: 1000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', desc: 'M4 Max, 48GB RAM, 1TB SSD.', total: 15, avail: 15, booked: 0 },
  { name: 'Dell XPS 16 Intel Ultra 9', category: 'Laptop', brand: 'Dell', model: 'XPS-9640', serial_number: 'SN-XPS16-001', condition: 'New', status: 'In Stock', purchase_date: '2026-02-15', rental_price: 2800, deposit_amount: 500, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80', desc: '16" OLED 4K Touch, Core Ultra 9, 32GB.', total: 8, avail: 8, booked: 0 },
  { name: 'ASUS ROG Zephyrus G16', category: 'Laptop', brand: 'ASUS', model: 'G16-RTX4090', serial_number: 'SN-ROG16-001', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-02-01', rental_price: 3200, deposit_amount: 800, img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', desc: 'RTX 4090, Ryzen 9, 32GB RAM.', total: 12, avail: 12, booked: 0 },
  { name: 'Lenovo ThinkPad X1 Carbon Gen 12', category: 'Laptop', brand: 'Lenovo', model: 'X1C-G12', serial_number: 'SN-TPX1-001', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-11-20', rental_price: 2200, deposit_amount: 500, img: 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800&q=80', desc: 'Ultra 7, 32GB, 14" 2.8K OLED.', total: 10, avail: 10, booked: 0 },
  { name: 'HP Spectre x360 16', category: 'Laptop', brand: 'HP', model: 'SP-16-2in1', serial_number: 'SN-HP360-001', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-12-05', rental_price: 2500, deposit_amount: 500, img: 'https://images.unsplash.com/photo-1593642702743-b1a6c5d1f654?w=800&q=80', desc: 'Convertible Touch screen, Core Ultra 7.', total: 6, avail: 6, booked: 0 },
  { name: 'Razer Blade 16', category: 'Laptop', brand: 'Razer', model: 'RZ09-0509', serial_number: 'SN-BLADE-001', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-01-20', rental_price: 3800, deposit_amount: 1000, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', desc: 'RTX 4090, Core i9, Mini-LED 4K.', total: 5, avail: 5, booked: 0 },
  
  // Cameras
  { name: 'Sony A1 II Mirrorless', category: 'Camera', brand: 'Sony', model: 'ILCE-1M2', serial_number: 'SN-SONYA1-01', condition: 'New', status: 'In Stock', purchase_date: '2026-03-01', rental_price: 7500, deposit_amount: 2000, img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&q=80', desc: '50MP Full Frame, 8K 30fps Burst.', total: 20, avail: 20, booked: 0 },
  { name: 'Sony A1 II Mirrorless', category: 'Camera', brand: 'Sony', model: 'ILCE-1M2', serial_number: 'SN-SONYA1-02', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-03-01', rental_price: 7500, deposit_amount: 2000, img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&q=80', desc: '50MP Full Frame, 8K 30fps Burst.', total: 20, avail: 20, booked: 0 },
  { name: 'Canon EOS R1 Flagship', category: 'Camera', brand: 'Canon', model: 'EOS-R1', serial_number: 'SN-CANR1-01', condition: 'New', status: 'In Stock', purchase_date: '2026-02-10', rental_price: 8000, deposit_amount: 2000, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', desc: '24MP, 40fps, 6K RAW Mirrorless.', total: 8, avail: 8, booked: 0 },
  { name: 'Nikon Z8 Hybrid Pro', category: 'Camera', brand: 'Nikon', model: 'Z8-PRO', serial_number: 'SN-NIKZ8-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-09-12', rental_price: 5500, deposit_amount: 1500, img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', desc: '45.7MP, 8K 60fps, Stacked CMOS.', total: 10, avail: 10, booked: 0 },
  { name: 'GoPro Hero 13 Black', category: 'Camera', brand: 'GoPro', model: 'HERO13', serial_number: 'SN-GOP13-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-10-01', rental_price: 400, deposit_amount: 100, img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', desc: '5.3K 60fps Action Camera, HyperSmooth.', total: 30, avail: 30, booked: 0 },
  { name: 'DJI Osmo Pocket 3', category: 'Camera', brand: 'DJI', model: 'OP3-GIMBAL', serial_number: 'SN-OP3-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-12-15', rental_price: 500, deposit_amount: 150, img: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', desc: 'Pocket sized gimbal camera, 1" CMOS 4K.', total: 25, avail: 25, booked: 0 },

  // Drones
  { name: 'DJI Mavic 4 Pro Drone', category: 'Drone', brand: 'DJI', model: 'M4P-DRONE', serial_number: 'SN-MAV4-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-01-05', rental_price: 2500, deposit_amount: 600, img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80', desc: '4/3 CMOS Hasselblad camera Drone.', total: 10, avail: 10, booked: 0 },
  { name: 'DJI Mini 5 Pro Drone', category: 'Drone', brand: 'DJI', model: 'M5P-LIGHT', serial_number: 'SN-MIN5-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2026-02-18', rental_price: 900, deposit_amount: 250, img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80', desc: 'Sub-249g 4K/120fps drone.', total: 15, avail: 15, booked: 0 },
  { name: 'DJI Inspire 4 Cinema', category: 'Drone', brand: 'DJI', model: 'INS4-PRO', serial_number: 'SN-INS4-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-08-01', rental_price: 15000, deposit_amount: 5000, img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80', desc: 'Professional 8K CinemaDNG Drone Kit.', total: 4, avail: 4, booked: 0 },

  // Audio
  { name: 'Sennheiser HD 800 S', category: 'Audio', brand: 'Sennheiser', model: 'HD-800S', serial_number: 'SN-SEN800-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-07-20', rental_price: 800, deposit_amount: 300, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', desc: 'Audiophile Reference Open Back Headphones.', total: 12, avail: 12, booked: 0 },
  { name: 'Sony WH-1000XM6 ANC', category: 'Audio', brand: 'Sony', model: 'XM6-BLACK', serial_number: 'SN-XM6-01', condition: 'New', status: 'In Stock', purchase_date: '2026-03-05', rental_price: 500, deposit_amount: 150, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', desc: 'Industry-leading Active Noise Cancelling.', total: 20, avail: 20, booked: 0 },
  { name: 'Shure SM7dB Podcasting Mic', category: 'Audio', brand: 'Shure', model: 'SM7DB', serial_number: 'SN-SM7D-01', condition: 'Excellent', status: 'In Stock', purchase_date: '2025-10-10', rental_price: 300, deposit_amount: 100, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', desc: 'Dynamic mic with built-in active preamp.', total: 15, avail: 15, booked: 0 }
];

let deviceIdCounter = 1;
// Populate base devices first
for (const sd of seedDevices) {
  deviceInsert.run(sd.name, sd.category, sd.brand, sd.model, sd.serial_number, sd.condition, sd.status, sd.purchase_date, sd.rental_price, sd.deposit_amount, sd.img, sd.desc, 'Default seeded device.', sd.total, sd.avail, sd.booked);
  deviceIdCounter++;
}

// Generate extra unique devices to reach 55+
const categories = ['Laptop', 'Camera', 'Drone', 'Audio', 'Gaming', 'Smartphone', 'Tablet', 'Display', 'VR', 'Lighting', 'Grip', 'Accessories', 'Printer'];
const conditions = ['New', 'Excellent', 'Good', 'Fair'];
const extraBrands = {
  Laptop: ['ASUS', 'HP', 'Dell', 'Lenovo'],
  Camera: ['Canon', 'Nikon', 'Fujifilm', 'Leica'],
  Drone: ['DJI', 'Autel'],
  Audio: ['Bose', 'JBL', 'Rode', 'Sennheiser'],
  Gaming: ['Nintendo', 'Valve', 'ASUS'],
  Smartphone: ['OnePlus', 'Google', 'Xiaomi'],
  Tablet: ['Microsoft', 'Apple', 'Wacom'],
  Display: ['LG', 'Dell', 'Samsung'],
  VR: ['Meta', 'HTC'],
  Lighting: ['Godox', 'Aputure'],
  Grip: ['Manfrotto', 'SmallRig'],
  Accessories: ['Logitech', 'Elgato'],
  Printer: ['Canon', 'HP']
};

for (let i = 1; i <= 36; i++) {
  const cat = categories[i % categories.length];
  const brandList = extraBrands[cat] || ['Generic'];
  const brand = brandList[i % brandList.length];
  const name = `${brand} Premium ${cat} V${i}`;
  const model = `${cat.substring(0, 3).toUpperCase()}-${100 + i}`;
  const serial = `SN-GEN-${cat.substring(0, 3).toUpperCase()}-${1000 + i}`;
  const cond = conditions[i % conditions.length];
  const price = 100 * ((i % 10) + 1) + 50;
  const deposit = price * 0.5;
  const purchase = `2025-11-${String((i % 28) + 1).padStart(2, '0')}`;
  
  let img = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
  if (cat === 'Laptop') img = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
  else if (cat === 'Camera') img = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80';
  else if (cat === 'Drone') img = 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80';
  else if (cat === 'Smartphone') img = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';

  const totalQty = 10 + (i % 15);
  deviceInsert.run(name, cat, brand, model, serial, cond, 'In Stock', purchase, price, deposit, img, `High quality ${brand} ${cat}.`, 'Generated demo stock.', totalQty, totalQty, 0);
}

console.log('Seeding rentals/bookings...');
// Let's seed bookings for customer 1, 2, 3
const bookingInsert = db.prepare(`
  INSERT INTO bookings (
    deviceId, device_id, customerId, customer_id, 
    quantity, bookingStatus, status, paymentStatus, payment_status, 
    bookingDate, start_date, returnDate, end_date, 
    actual_return_date, rental_amount, deposit_amount, late_fee, damage_fee, payment_method, notes
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// 1. Returned Booking (Priya Patel, MacBook Pro [device 2], status = Returned, damage noted, quantity = 2)
bookingInsert.run(2, 2, 2, 2, 2, 'Returned', 'Returned', 'Paid', 'Paid', '2026-06-01', '2026-06-01', '2026-06-08', '2026-06-08', '2026-06-08', 33600, 1000, 0.0, 1500, 'Card', 'Returned with minor screen scratch.');

// Add Damage Report for Priya Patel's return (booking_id = 1, device_id = 2, customer_id = 2)
db.prepare(`
  INSERT INTO damage_reports (device_id, customer_id, booking_id, description, severity, repair_cost, damage_date, status)
  VALUES (2, 2, 1, 'Small vertical scratch on the screen surface, does not affect LCD panel display.', 'Medium', 1500, '2026-06-08', 'Pending')
`).run();

// 2. Overdue Booking (Rohan Sharma, Sony A1 II [device 9], status = Overdue, quantity = 1)
bookingInsert.run(9, 9, 1, 1, 1, 'Overdue', 'Overdue', 'Pending', 'Pending', '2026-06-10', '2026-06-10', '2026-06-17', '2026-06-17', null, 52500, 2000, 1500, 0.0, 'UPI', 'Customer has requested a grace period.');

// 3. Active Booking (Amit Verma, Sony WH-1000XM6 [device 18], status = Active, quantity = 3)
bookingInsert.run(18, 18, 3, 3, 3, 'Active', 'Active', 'Paid', 'Paid', '2026-06-24', '2026-06-24', '2026-06-29', '2026-06-29', null, 2500, 150, 0.0, 0.0, 'UPI', 'Delivery dispatched via courier.');

// 4. Cancelled Booking (Sneha Reddy, iPad Pro [device 27 - wait let's use actual ID for base seed or lookup, device 27 is generated since base devices were 19])
// iPad Pro is at ID 19 (iPad Pro 13" M4 512GB is index 18 base seed, so ID 19)
bookingInsert.run(19, 19, 4, 4, 1, 'Cancelled', 'Cancelled', 'Waived', 'Waived', '2026-06-25', '2026-06-25', '2026-06-28', '2026-06-28', null, 3600, 400, 0.0, 0.0, 'Bank Transfer', 'Cancelled by customer.');

// Update live stocks of seeded devices matching the seeded bookings
// Overdue booking: Rohan Sharma, device 9 (Sony A1 II), quantity = 1
db.prepare(`UPDATE devices SET availableQuantity = totalQuantity - 1, bookedQuantity = 1 WHERE id = 9`).run();

// Active booking: Amit Verma, device 18 (Sony WH-1000XM6), quantity = 3
db.prepare(`UPDATE devices SET availableQuantity = totalQuantity - 3, bookedQuantity = 3 WHERE id = 18`).run();

// Seed Payments (Rental payments corresponding to bookings)
console.log('Seeding payment ledger...');
db.prepare(`
  INSERT INTO payments (booking_id, payment_type, amount, status)
  VALUES (1, 'Rental', 33600, 'Paid')
`).run();
db.prepare(`
  INSERT INTO payments (booking_id, payment_type, amount, status)
  VALUES (2, 'Rental', 52500, 'Pending')
`).run();
db.prepare(`
  INSERT INTO payments (booking_id, payment_type, amount, status)
  VALUES (3, 'Rental', 2500, 'Paid')
`).run();

// Seed Activity Logs
console.log('Seeding audit logs...');
const logInsert = db.prepare(`
  INSERT INTO activity_logs (action, admin_name, module, details)
  VALUES (?, 'System Admin', ?, ?)
`);
logInsert.run('Admin Login', 'Auth', 'Admin logged in from IP 192.168.1.100');
logInsert.run('Device Added', 'Devices', 'Added MacBook Pro 16" M4 Max (SN-MBP16-001)');
logInsert.run('Customer Created', 'Customers', 'Created profile for Rohan Sharma');
logInsert.run('Rental Created', 'Rentals', 'Created rental booking #00003 for Amit Verma');

// Seed Notification History
console.log('Seeding notification logs...');
const notificationInsert = db.prepare(`
  INSERT INTO notifications (customer_name, phone, email, type, channel, status, message_preview)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
notificationInsert.run('Rohan Sharma', '+91 9123456789', 'rohan@gmail.com', 'Rental Created', 'Email', 'Sent', 'Your booking #00002 for Sony A1 II has been confirmed.');
notificationInsert.run('Rohan Sharma', '+91 9123456789', 'rohan@gmail.com', 'Rental Created', 'WhatsApp', 'Not Configured', 'WhatsApp API not configured.');
notificationInsert.run('Priya Patel', '+91 9876543210', 'priya@gmail.com', 'Return Confirmation', 'Email', 'Sent', 'Your return for MacBook Pro has been confirmed.');

console.log('Database seeded and initialized successfully.');
db.close();
