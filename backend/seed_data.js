const Database = require('better-sqlite3');
const path = require('path');

// Determine database path relative to this script
const dbPath = path.join(__dirname, '../database/rental.db');
const db = new Database(dbPath);

console.log('Connected to the database.');

const devices = [
  { name: 'Sony Alpha a7 III', category: 'Camera', brand: 'Sony', model: 'a7 III', serial: 'SN1001', condition: 'Excellent', status: 'In Stock', price: 150, deposit: 500, total: 2 },
  { name: 'Canon EOS R5', category: 'Camera', brand: 'Canon', model: 'EOS R5', serial: 'SN1002', condition: 'New', status: 'In Stock', price: 200, deposit: 800, total: 1 },
  { name: 'DJI Mavic 3 Pro', category: 'Drone', brand: 'DJI', model: 'Mavic 3 Pro', serial: 'SN1003', condition: 'Excellent', status: 'In Stock', price: 250, deposit: 1000, total: 3 },
  { name: 'Sony FE 24-70mm f/2.8 GM', category: 'Lens', brand: 'Sony', model: 'FE 24-70mm', serial: 'SN1004', condition: 'Good', status: 'In Stock', price: 80, deposit: 300, total: 4 },
  { name: 'Canon RF 70-200mm f/2.8L', category: 'Lens', brand: 'Canon', model: 'RF 70-200mm', serial: 'SN1005', condition: 'Excellent', status: 'In Stock', price: 90, deposit: 400, total: 2 },
  { name: 'GoPro HERO12 Black', category: 'Action Camera', brand: 'GoPro', model: 'HERO12', serial: 'SN1006', condition: 'New', status: 'In Stock', price: 40, deposit: 100, total: 5 },
  { name: 'Ronin-S Gimbal', category: 'Accessory', brand: 'DJI', model: 'Ronin-S', serial: 'SN1007', condition: 'Fair', status: 'In Stock', price: 50, deposit: 150, total: 3 },
  { name: 'Aputure 120d II LED', category: 'Lighting', brand: 'Aputure', model: '120d II', serial: 'SN1008', condition: 'Good', status: 'In Stock', price: 70, deposit: 250, total: 2 },
  { name: 'Rode Wireless GO II', category: 'Audio', brand: 'Rode', model: 'Wireless GO II', serial: 'SN1009', condition: 'Excellent', status: 'In Stock', price: 30, deposit: 100, total: 4 },
  { name: 'Blackmagic Pocket Cinema 4K', category: 'Camera', brand: 'Blackmagic', model: 'BMPCC 4K', serial: 'SN1010', condition: 'Good', status: 'In Stock', price: 120, deposit: 600, total: 2 }
];

const insertDevice = db.prepare(`
  INSERT INTO devices (name, category, brand, model, serial_number, condition, status, rental_price, deposit_amount, totalQuantity, availableQuantity, image_url, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let devicesAdded = 0;
for (const d of devices) {
  // Check if device already exists to avoid duplicates
  const exists = db.prepare('SELECT id FROM devices WHERE name = ?').get(d.name);
  if (!exists) {
    insertDevice.run(
      d.name, d.category, d.brand, d.model, d.serial, d.condition, d.status, d.price, d.deposit, d.total, d.total, '', 'A high-quality ' + d.name + ' ready for rental.'
    );
    devicesAdded++;
  }
}
console.log(`Added ${devicesAdded} devices.`);

const customers = [
  { name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '9876543210', address: 'Bangalore, India', id_proof: 'Aadhaar', gov_id_number: '123456789012' },
  { name: 'Priya Patel', email: 'priya.p@example.com', phone: '9876543211', address: 'Mumbai, India', id_proof: 'PAN Card', gov_id_number: 'ABCDE1234F' },
  { name: 'Amit Kumar', email: 'amit.k@example.com', phone: '9876543212', address: 'Delhi, India', id_proof: 'Passport', gov_id_number: 'Z1234567' },
  { name: 'Sneha Reddy', email: 'sneha.r@example.com', phone: '9876543213', address: 'Hyderabad, India', id_proof: 'Aadhaar', gov_id_number: '987654321098' },
  { name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '9876543214', address: 'Pune, India', id_proof: 'Driving License', gov_id_number: 'MH123456789' }
];

const insertCustomer = db.prepare(`
  INSERT INTO customers (name, email, phone, address, id_proof, gov_id_number, status)
  VALUES (?, ?, ?, ?, ?, ?, 'Active')
`);

let customersAdded = 0;
for (const c of customers) {
  const exists = db.prepare('SELECT id FROM customers WHERE email = ?').get(c.email);
  if (!exists) {
    insertCustomer.run(c.name, c.email, c.phone, c.address, c.id_proof, c.gov_id_number);
    customersAdded++;
  }
}
console.log(`Added ${customersAdded} customers.`);

db.close();
