const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/rental.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = OFF');
db.prepare('DELETE FROM kyc_records').run();
db.prepare('DELETE FROM bookings').run();
db.prepare('DELETE FROM payments').run();
db.prepare('DELETE FROM devices').run();
db.prepare('DELETE FROM customers').run();
db.pragma('foreign_keys = ON');

const devices = [
  { name: 'Apple MacBook Pro 16" M4 Max', category: 'Laptop', daily_rate: 4800, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', description: 'M4 Max chip, 48GB RAM, 1TB SSD — ultimate pro laptop.' },
  { name: 'Dell XPS 16 Intel Ultra 9', category: 'Laptop', daily_rate: 2800, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80', description: '16-inch OLED 4K, Intel Core Ultra 9, 32GB RAM.' },
  { name: 'ASUS ROG Zephyrus G16', category: 'Laptop', daily_rate: 3200, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', description: 'RTX 4090, Ryzen 9, 32GB — ultimate gaming laptop.' },
  { name: 'Lenovo ThinkPad X1 Carbon Gen 12', category: 'Laptop', daily_rate: 2200, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800&q=80', description: 'Intel Core Ultra 7, 32GB, 14" 2.8K OLED.' },
  { name: 'HP Spectre x360 16', category: 'Laptop', daily_rate: 2500, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1593642702743-b1a6c5d1f654?w=800&q=80', description: '2-in-1 convertible, Intel Core Ultra 7, 16GB RAM.' },
  { name: 'Microsoft Surface Laptop 7', category: 'Laptop', daily_rate: 1800, total_qty: 7, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', description: 'Snapdragon X Elite, 16GB, 15" PixelSense.' },
  { name: 'Razer Blade 16', category: 'Laptop', daily_rate: 3800, total_qty: 3, image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', description: 'RTX 4090, Intel Core i9, Mini-LED 4K 120Hz.' },
  { name: 'Samsung Galaxy Book4 Ultra', category: 'Laptop', daily_rate: 3000, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800&q=80', description: 'Intel Core Ultra 9, RTX 4070, 16" 3K AMOLED.' },
  { name: 'Sony A1 II', category: 'Camera', daily_rate: 7500, total_qty: 3, image_url: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&q=80', description: '50MP full-frame, 8K 30fps, 30fps burst.' },
  { name: 'Canon EOS R1', category: 'Camera', daily_rate: 8000, total_qty: 2, image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', description: 'Flagship mirrorless, 24MP, 40fps, 6K RAW.' },
  { name: 'Nikon Z8', category: 'Camera', daily_rate: 5500, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', description: '45MP, 8K 60fps, pro-level hybrid mirrorless.' },
  { name: 'Fujifilm GFX 100S II', category: 'Camera', daily_rate: 6500, total_qty: 3, image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', description: '102MP medium format, 8K video, IBIS.' },
  { name: 'Leica M11-P', category: 'Camera', daily_rate: 9000, total_qty: 2, image_url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&q=80', description: '60MP rangefinder, timeless design, content credentials.' },
  { name: 'GoPro Hero 13 Black', category: 'Camera', daily_rate: 400, total_qty: 10, image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', description: '5.3K 60fps, HyperSmooth 6.0, waterproof to 33ft.' },
  { name: 'DJI Osmo Pocket 3', category: 'Camera', daily_rate: 500, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', description: '4K 120fps, 1" CMOS, 2-axis gimbal.' },
  { name: 'DJI Mavic 4 Pro', category: 'Drone', daily_rate: 2500, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80', description: '4/3 CMOS Hasselblad, omnidirectional obstacle avoidance.' },
  { name: 'DJI Mini 5 Pro', category: 'Drone', daily_rate: 900, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80', description: 'Sub-249g, 4K/120fps, 360° obstacle sensing.' },
  { name: 'DJI Air 4', category: 'Drone', daily_rate: 1500, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=80', description: 'Dual-camera, 48MP, 4K 120fps, 46-min flight.' },
  { name: 'Autel Robotics EVO Lite+', category: 'Drone', daily_rate: 1200, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1508614589041-895f88991d1c?w=800&q=80', description: '1" CMOS 20MP, 6K HDR, 40-min flight.' },
  { name: 'DJI Inspire 4', category: 'Drone', daily_rate: 15000, total_qty: 1, image_url: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80', description: '8K CinemaDNG, dual operator, full-frame gimbal.' },
  { name: 'Sennheiser HD 800 S', category: 'Audio', daily_rate: 800, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', description: 'Reference open-back headphones, exceptional soundstage.' },
  { name: 'Sony WH-1000XM6', category: 'Audio', daily_rate: 500, total_qty: 15, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', description: 'Industry-leading ANC, 40hr battery, Hi-Res Audio.' },
  { name: 'Apple AirPods Max 2', category: 'Audio', daily_rate: 600, total_qty: 10, image_url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80', description: 'USB-C, H2 chip, adaptive audio, 20hr battery.' },
  { name: 'Shure SM7dB', category: 'Audio', daily_rate: 300, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', description: 'Broadcast dynamic mic with built-in preamp.' },
  { name: 'JBL PartyBox 320', category: 'Audio', daily_rate: 700, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80', description: '240W output, bass boost, party light show.' },
  { name: 'Rode NT1 5th Gen', category: 'Audio', daily_rate: 250, total_qty: 10, image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80', description: 'Studio condenser mic, 32-bit float, USB-C/XLR.' },
  { name: 'Bose Ultra Open Earbuds', category: 'Audio', daily_rate: 350, total_qty: 12, image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80', description: 'Open-ear design, Immersive Audio, 7.5hr battery.' },
  { name: 'PlayStation 5 Pro', category: 'Gaming', daily_rate: 700, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80', description: 'PS5 Pro enhanced, 4K 60fps, 2TB SSD.' },
  { name: 'Xbox Series X 2TB', category: 'Gaming', daily_rate: 600, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80', description: '12 TFLOPS, 4K 120fps, 2TB SSD, Game Pass.' },
  { name: 'Nintendo Switch 2', category: 'Gaming', daily_rate: 500, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80', description: 'Next-gen hybrid, backward compatible, 8" LCD.' },
  { name: 'Meta Quest 3S', category: 'Gaming', daily_rate: 550, total_qty: 10, image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80', description: 'Mixed reality, Snapdragon XR2 Gen 3, 512GB.' },
  { name: 'Steam Deck OLED', category: 'Gaming', daily_rate: 400, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80', description: '7.4" OLED, 90Hz, AMD APU, 1TB NVMe.' },
  { name: 'ASUS ROG Ally X', category: 'Gaming', daily_rate: 450, total_qty: 7, image_url: 'https://images.unsplash.com/photo-1605901309584-2c3c1b3e1c3b?w=800&q=80', description: 'Ryzen Z1 Extreme, 80Wh battery, 1TB SSD.' },
  { name: 'Samsung Galaxy S25 Ultra', category: 'Smartphone', daily_rate: 800, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80', description: '200MP camera, Snapdragon 8 Gen 4, S Pen, 6.9" AMOLED.' },
  { name: 'iPhone 17 Pro Max', category: 'Smartphone', daily_rate: 900, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1591337676887-a217a3b3a0b0?w=800&q=80', description: 'A19 Pro, titanium, 48MP pro camera, 6.9" OLED.' },
  { name: 'Google Pixel 10 Pro', category: 'Smartphone', daily_rate: 700, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80', description: 'Tensor G5, 50MP, AI magic editor, 7-day battery.' },
  { name: 'OnePlus 13 Pro', category: 'Smartphone', daily_rate: 650, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80', description: 'Snapdragon 8 Gen 4, 120W charging, Hasselblad camera.' },
  { name: 'Xiaomi 15 Ultra', category: 'Smartphone', daily_rate: 750, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1585060544812-183dd0661370?w=800&q=80', description: 'Leica quad-camera, 1" sensor, 6000mAh battery.' },
  { name: 'Apple iPad Pro 13" M4', category: 'Tablet', daily_rate: 1200, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', description: 'Tandem OLED, M4 chip, Apple Pencil Pro, 1TB.' },
  { name: 'Samsung Galaxy Tab S10 Ultra', category: 'Tablet', daily_rate: 1100, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80', description: '14.6" Dynamic AMOLED, S Pen, MediaTek Dimensity.' },
  { name: 'Microsoft Surface Pro 11', category: 'Tablet', daily_rate: 1500, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', description: 'Snapdragon X Elite, 13" OLED, Copilot+ PC.' },
  { name: 'Wacom MobileStudio Pro 16', category: 'Tablet', daily_rate: 4000, total_qty: 3, image_url: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80', description: '4K UHD creative pen display, Intel Core i7, 16GB.' },
  { name: 'Amazon Kindle Scribe 2', category: 'Tablet', daily_rate: 300, total_qty: 12, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', description: '10.2" e-ink, pen support, AI note summarization.' },
  { name: 'Samsung Odyssey Ark 2', category: 'Display', daily_rate: 5000, total_qty: 2, image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', description: '55" 4K 165Hz curved gaming screen, Cockpit Mode.' },
  { name: 'LG C4 77" OLED TV', category: 'Display', daily_rate: 4500, total_qty: 3, image_url: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80', description: '77" OLED evo, 120Hz, Dolby Vision, WebOS.' },
  { name: 'Apple Studio Display', category: 'Display', daily_rate: 1800, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', description: '27" 5K Retina, 12MP Ultra Wide cam, six speakers.' },
  { name: 'Dell UltraSharp U4323QE', category: 'Display', daily_rate: 800, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', description: '42.5" 4K IPS, USB-C hub, dual-PBP.' },
  { name: 'Samsung The Freestyle 2', category: 'Display', daily_rate: 600, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80', description: 'Portable projector, 1080p, auto keystone, 3hr battery.' },
  { name: 'Apple Vision Pro 2', category: 'VR', daily_rate: 10000, total_qty: 2, image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80', description: 'M4 Ultra, dual 4K micro-OLED, spatial computing.' },
  { name: 'Meta Quest Pro 2', category: 'VR', daily_rate: 2000, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80', description: 'Mixed reality, eye/face tracking, 512GB.' },
  { name: 'PlayStation VR2 PC', category: 'VR', daily_rate: 600, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80', description: 'OLED HDR 4K, 110° FOV, PC compatibility.' },
  { name: 'Godox SL150W III LED', category: 'Lighting', daily_rate: 350, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&q=80', description: '150W COB LED, bowens mount, silent mode.' },
  { name: 'Aputure Amaran 300C', category: 'Lighting', daily_rate: 500, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&q=80', description: '300W full-color RGBWW LED, Sidus Link app.' },
  { name: 'DJI RS 4 Pro Gimbal', category: 'Grip', daily_rate: 600, total_qty: 5, image_url: 'https://images.unsplash.com/photo-1588591795084-1770cb3be374?w=800&q=80', description: '4.5kg payload, carbon fiber, LiDAR autofocus.' },
  { name: 'Manfrotto 290 Xtra Tripod', category: 'Grip', daily_rate: 180, total_qty: 12, image_url: 'https://images.unsplash.com/photo-1588591795084-1770cb3be374?w=800&q=80', description: 'Aluminum tripod, 5.5kg load, fluid head.' },
  { name: 'SmallRig Pro Cage Kit', category: 'Grip', daily_rate: 120, total_qty: 15, image_url: 'https://images.unsplash.com/photo-1588591795084-1770cb3be374?w=800&q=80', description: 'Universal camera cage, NATO rail, ARRI rosette.' },
  { name: 'Anker 737 Power Bank', category: 'Accessories', daily_rate: 100, total_qty: 20, image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80', description: '140W USB-C, 24,000mAh, 2x USB-C + USB-A.' },
  { name: 'Samsung T9 4TB SSD', category: 'Accessories', daily_rate: 150, total_qty: 10, image_url: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80', description: 'Portable SSD, 2000MB/s, IP65, USB 3.2 Gen 2x2.' },
  { name: 'Elgato Stream Deck XL', category: 'Accessories', daily_rate: 200, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80', description: '32 LCD keys, customizable profiles, USB-C.' },
  { name: 'Logitech MX Master 3S', category: 'Accessories', daily_rate: 80, total_qty: 20, image_url: 'https://images.unsplash.com/photo-1629429408209-1f912961db70?w=800&q=80', description: '8K DPI, quiet clicks, MagSpeed scroll, USB-C.' },
  { name: 'HP LaserJet Pro MFP M428fdw', category: 'Printer', daily_rate: 300, total_qty: 6, image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80', description: 'Wireless monochrome laser printer, print, scan, copy, fax, duplex printing.' },
  { name: 'Epson EcoTank L8180 A3 Photo', category: 'Printer', daily_rate: 600, total_qty: 4, image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80', description: '6-color multifunction ink tank printer for high-quality photos up to A3+.' },
  { name: 'Canon imageCLASS MF275dw', category: 'Printer', daily_rate: 250, total_qty: 8, image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80', description: 'All-in-one monochrome laser printer, 30 ppm print speed, auto-duplex.' },
];

const insert = db.prepare('INSERT INTO devices (name, category, daily_rate, total_qty, available_qty, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
for (const d of devices) {
  insert.run(d.name, d.category, d.daily_rate, d.total_qty, d.total_qty, d.image_url, d.description);
}

console.log(`Seeded ${devices.length} devices successfully.`);
db.close();
