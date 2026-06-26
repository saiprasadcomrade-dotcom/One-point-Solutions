-- Electronics Rental Booking System Schema

-- Settings Table (Company settings and WhatsApp/SMS gateway credentials)
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT DEFAULT 'One Point Solutions',
    company_logo TEXT DEFAULT '',
    company_email TEXT DEFAULT 'onepointsolutions16@gmail.com',
    company_phone TEXT DEFAULT '+91 98765 43210',
    company_address TEXT DEFAULT '123 Tech Park, Bangalore, India',
    company_website TEXT DEFAULT 'www.onepointsolutions.com',
    company_support_email TEXT DEFAULT 'support@onepointsolutions.com',
    company_whatsapp TEXT DEFAULT '+91 98765 43210',
    admin_password TEXT DEFAULT 'admin@123',
    
    -- WhatsApp/SMS Configurations
    whatsapp_provider TEXT DEFAULT 'Meta',
    whatsapp_access_token TEXT DEFAULT '',
    whatsapp_phone_number_id TEXT DEFAULT '',
    twilio_sid TEXT DEFAULT '',
    twilio_auth_token TEXT DEFAULT '',
    sms_api_key TEXT DEFAULT '',
    sender_id TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    googleId TEXT,
    avatarUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Devices Table (Individual device instances tracking serials, condition & quantities)
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    condition TEXT DEFAULT 'Excellent' CHECK(condition IN ('New', 'Excellent', 'Good', 'Fair')),
    status TEXT DEFAULT 'In Stock' CHECK(status IN ('In Stock', 'Out of Stock', 'Repair', 'Deleted', 'Available', 'Rented')),
    purchase_date DATE,
    rental_price REAL,
    deposit_amount REAL DEFAULT 0.0,
    image_url TEXT,
    description TEXT,
    notes TEXT,
    deleted_at DATETIME,
    deleted_by TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    totalQuantity INTEGER DEFAULT 1,
    availableQuantity INTEGER DEFAULT 1,
    bookedQuantity INTEGER DEFAULT 0
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT,
    id_proof TEXT, -- e.g., 'Aadhaar', 'PAN Card', 'Passport'
    gov_id_number TEXT,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Deleted')),
    notes TEXT,
    deleted_at DATETIME,
    deleted_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (Rentals)
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceId INTEGER NOT NULL,
    customerId INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    bookingStatus TEXT DEFAULT 'Active' CHECK(bookingStatus IN ('Active', 'Returned', 'Overdue', 'Cancelled', 'Deleted')),
    paymentStatus TEXT DEFAULT 'Pending' CHECK(paymentStatus IN ('Pending', 'Paid', 'Waived')),
    bookingDate DATE NOT NULL,
    returnDate DATE NOT NULL,
    actual_return_date DATE,
    rental_amount REAL NOT NULL,
    deposit_amount REAL NOT NULL,
    late_fee REAL DEFAULT 0.0,
    damage_fee REAL DEFAULT 0.0,
    payment_method TEXT DEFAULT 'UPI' CHECK(payment_method IN ('UPI', 'Cash', 'Card', 'Bank Transfer')),
    notes TEXT,
    damage_notes TEXT,
    deleted_at DATETIME,
    deleted_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Compatibility columns
    customer_id INTEGER,
    device_id INTEGER,
    start_date DATE,
    end_date DATE,
    status TEXT,
    payment_status TEXT,
    
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (deviceId) REFERENCES devices(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Payments Table (Tracks all transaction status)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    payment_type TEXT CHECK(payment_type IN ('Rental', 'Damage')) NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Paid', 'Waived')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Damage Reports Table
CREATE TABLE IF NOT EXISTS damage_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('Low', 'Medium', 'High', 'Critical')),
    repair_cost REAL DEFAULT 0.0,
    damage_date DATE NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Under Review', 'Resolved')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Notification History Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    type TEXT NOT NULL, -- e.g., 'Rental Confirmation', 'Return Confirmation', 'Reminder'
    channel TEXT NOT NULL CHECK(channel IN ('Email', 'WhatsApp', 'SMS')),
    status TEXT NOT NULL CHECK(status IN ('Sent', 'Failed', 'Pending', 'Not Configured')),
    message_preview TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table (Audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    admin_name TEXT NOT NULL DEFAULT 'Admin',
    module TEXT NOT NULL, -- e.g., 'Auth', 'Devices', 'Customers', 'Rentals', 'Reports'
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
