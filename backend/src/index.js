require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const {
  triggerRentalCreatedNotifications,
  triggerRentalReturnedNotifications,
  triggerRentalExtendedNotifications,
  triggerReminderNotification,
  sendBookingConfirmEmail,
  sendPaymentSuccessEmail,
  sendDeviceReturnedEmail
} = require('./notifications');


const app = express();
const PORT = process.env.PORT || 5000;
const dbPath = path.join(__dirname, '../../database/rental.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');

// Check if database needs initialization (if file size is 0 or doesn't exist)
let needsInit = false;
if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
  needsInit = true;
}

const db = new Database(dbPath);

if (needsInit) {
  console.log("Empty database detected. Initializing schema...");
  db.pragma('foreign_keys = ON');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  
  try {
    db.prepare(`
      INSERT INTO settings (id, company_name, company_logo, company_email, company_phone, company_address, company_website, company_support_email, company_whatsapp, admin_password)
      VALUES (1, 'One Point Solutions', '', 'onepointsolutions16@gmail.com', '+91 98765 43210', '123 Tech Park, Bangalore, India', 'www.onepointsolutions.com', 'support@onepointsolutions.com', '+91 98765 43210', 'admin@123')
    `).run();

    db.prepare(`
      INSERT INTO admins (name, email, password, googleId, avatarUrl)
      VALUES ('One Point Solutions', 'onepointsolutions16@gmail.com', 'admin@123', NULL, NULL)
    `).run();
    console.log("Database schema and default admin initialized successfully!");
  } catch (err) {
    console.error("Error seeding default data:", err.message);
  }
}

app.use(cors());
app.use(express.json());

// Serve the frontend static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Helper: Log activity
function logActivity(action, module, details) {
  try {
    db.prepare('INSERT INTO activity_logs (action, module, details) VALUES (?, ?, ?)')
      .run(action, module, details);
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

// Helper: Dynamically recalculate and update device quantities
function updateDeviceQuantities(deviceId) {
  try {
    const activeSum = db.prepare(`
      SELECT SUM(quantity) as sum FROM bookings
      WHERE device_id = ?
      AND status IN ('Active', 'Overdue')
    `).get(deviceId).sum || 0;

    const device = db.prepare('SELECT totalQuantity, status FROM devices WHERE id = ?').get(deviceId);
    if (device) {
      const total = device.totalQuantity;
      const booked = activeSum;
      const available = Math.max(0, total - booked);
      
      let nextStatus = device.status;
      if (device.status !== 'Repair' && device.status !== 'Deleted') {
        nextStatus = available === 0 ? 'Out of Stock' : 'In Stock';
      }

      db.prepare(`
        UPDATE devices
        SET availableQuantity = ?, bookedQuantity = ?, status = ?
        WHERE id = ?
      `).run(available, booked, nextStatus, deviceId);
    }
  } catch (err) {
    console.error('Error updating device quantities:', err.message);
  }
}

// Sync all device stocks on startup
try {
  const devices = db.prepare("SELECT id FROM devices").all();
  for (const d of devices) {
    updateDeviceQuantities(d.id);
  }
  console.log('Successfully synchronized all device stock quantities on startup.');
} catch (err) {
  console.error('Failed to sync device stocks on startup:', err.message);
}

// ─── SMTP DIAGNOSTICS & HEALTH ENDPOINTS ───────────────────────────────────────────────
app.get('/api/email/health', async (req, res) => {
  const dns = require('dns').promises;
  let dnsStatus = false;
  try {
    await dns.resolve('smtp.gmail.com');
    dnsStatus = true;
  } catch (err) {}

  res.json({
    status: 'Operational',
    smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtp_port: process.env.SMTP_PORT || '587',
    dns_status: dnsStatus ? 'Resolved' : 'Failed',
    authentication_status: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? 'Configured' : 'Missing',
    resend_api_status: process.env.RESEND_API_KEY ? 'Configured' : 'Missing',
    email_provider: process.env.RESEND_API_KEY ? 'Resend (Fallback)' : 'Gmail SMTP',
    timestamp: new Date().toISOString()
  });
});

app.post(['/api/email/test', '/api/test-email'], async (req, res) => {
  const { email } = req.body;

  // Build full diagnostic report regardless of success/failure
  const emailUser  = process.env.EMAIL_USER  || '';
  const emailPass  = process.env.EMAIL_PASS  || '';
  const smtpHost   = process.env.SMTP_HOST   || 'smtp.gmail.com';
  const smtpPort   = process.env.SMTP_PORT   || '587';
  const smtpSecure = process.env.SMTP_SECURE || 'false';

  const isPlaceholder = emailPass === 'YOUR_16_CHAR_APP_PASSWORD_HERE' || emailPass === 'admin@123' || emailPass === '';
  const isAppPasswordFormat = /^[a-z]{16}$/.test(emailPass.replace(/\s/g, ''));

  const diagnostics = {
    env_loaded:          true,
    email_user_defined:  !!emailUser,
    email_user_value:    emailUser || '(not set)',
    email_pass_defined:  !!emailPass && !isPlaceholder,
    email_pass_is_placeholder: isPlaceholder,
    email_pass_format_ok: isAppPasswordFormat,
    smtp_host:           smtpHost,
    smtp_port:           smtpPort,
    smtp_secure:         smtpSecure,
    dotenv_path:         require('path').join(__dirname, '../.env'),
    timestamp:           new Date().toISOString()
  };

  const dns = require('dns').promises;
  try {
    const records = await dns.resolve(smtpHost);
    diagnostics.dns_resolved = true;
    diagnostics.dns_ips = records;
    console.log(`[SMTP Diagnostics] DNS resolved ${smtpHost} to ${records.join(', ')}`);
  } catch (err) {
    diagnostics.dns_resolved = false;
    diagnostics.dns_ips = [];
    console.warn(`[SMTP Diagnostics] DNS resolution failed for ${smtpHost}:`, err.message);
  }

  console.log('\n[SMTP Diagnostics] ─────────────────────────────────');
  console.log('[SMTP Diagnostics] EMAIL_USER:', emailUser || '(not set)');
  console.log('[SMTP Diagnostics] EMAIL_PASS set:', !!emailPass && !isPlaceholder);
  console.log('[SMTP Diagnostics] EMAIL_PASS placeholder:', isPlaceholder);
  console.log('[SMTP Diagnostics] App Password format:', isAppPasswordFormat);
  console.log('[SMTP Diagnostics] SMTP_HOST:', smtpHost);
  console.log('[SMTP Diagnostics] SMTP_PORT:', smtpPort);

  // Reject if no target email given
  if (!email) {
    return res.status(400).json({
      success: false,
      step_failed: 'Validation',
      error: 'A recipient email address is required to send the test email.',
      diagnostics
    });
  }

  // Block if credentials are placeholders
  if (isPlaceholder) {
    const fixMessage = `
EMAIL_PASS is still set to a placeholder value ("${emailPass}").

HOW TO FIX — Generate a Google App Password:
  1. Go to: https://myaccount.google.com/security
  2. Enable 2-Step Verification under "How you sign in to Google"
  3. Go to: https://myaccount.google.com/apppasswords
  4. Type app name: "ERBS Mailer" → Click Create
  5. Copy the 16-character password shown (e.g. "abcdefghijklmnop")
  6. Open backend/.env and set: EMAIL_PASS=abcdefghijklmnop  (no spaces)
  7. Save the file and restart the backend server (npm start)
    `.trim();

    return res.status(400).json({
      success: false,
      step_failed: 'Credential Validation',
      error: 'EMAIL_PASS is a placeholder. Replace it with a real Google App Password.',
      fix: fixMessage,
      diagnostics
    });
  }

  // Attempt SMTP connection with Port 465 first
  const { getTransporter } = require('./notifications');
  let transporter;
  try {
    transporter = getTransporter(465, true);
  } catch (err) {
    return res.status(400).json({
      success: false,
      step_failed: 'Transporter Creation',
      error: err.message,
      diagnostics
    });
  }

  try {
    // Step 1: Verify SMTP connection on Port 465
    console.log('[SMTP Diagnostics] Verifying SMTP connection on Port 465...');
    try {
      await transporter.verify();
      diagnostics.smtp_port = '465';
    } catch (verifyErr) {
      console.warn(`[SMTP Diagnostics] Port 465 failed: ${verifyErr.message}. Falling back to Port 587...`);
      transporter = getTransporter(587, false, true);
      await transporter.verify();
      diagnostics.smtp_port = '587';
    }
    console.log(`[SMTP Diagnostics] ✅ SMTP connection verified successfully on Port ${diagnostics.smtp_port}!`);
    diagnostics.smtp_connected = true;

    // Step 2: Send test email
    console.log(`[SMTP Diagnostics] Sending test email to: ${email}`);
    await transporter.sendMail({
      from: `"One Point Solutions ERBS" <${emailUser}>`,
      to: email,
      subject: '✅ ERBS SMTP Test — Email Working Correctly',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0fdf4; padding: 20px; }
          .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #bbf7d0; padding: 32px; }
          h2 { color: #16a34a; margin: 0 0 12px 0; }
          p { color: #374151; font-size: 14px; line-height: 1.6; }
          .badge { display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
          td:first-child { color: #6b7280; font-weight: 600; width: 40%; }
          td:last-child { color: #111827; font-weight: 700; }
        </style></head>
        <body>
          <div class="card">
            <span class="badge">✅ SMTP TEST SUCCESSFUL</span>
            <h2>Email Delivery Confirmed!</h2>
            <p>Your ERBS (Electronic Rental Booking System) email notifications are now <strong>fully working</strong>.</p>
            <table>
              <tr><td>Sender</td><td>${emailUser}</td></tr>
              <tr><td>Recipient</td><td>${email}</td></tr>
              <tr><td>SMTP Host</td><td>${smtpHost}:${smtpPort}</td></tr>
              <tr><td>Timestamp</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
              <tr><td>Status</td><td style="color:#16a34a">Connected & Sent ✓</td></tr>
            </table>
            <p style="margin-top:20px; font-size:12px; color:#9ca3af;">
              This is an automated test from One Point Solutions ERBS Admin Panel.
            </p>
          </div>
        </body>
        </html>
      `
    });

    console.log('[SMTP Diagnostics] ✅ Test email sent successfully!');
    logActivity('SMTP Test Passed', 'Settings', `Test email sent to ${email} — SMTP authenticated successfully`);

    res.json({
      success: true,
      message: `✅ SMTP connection verified and test email sent to ${email}`,
      smtp_authenticated: true,
      diagnostics
    });

  } catch (error) {
    diagnostics.smtp_connected = false;
    diagnostics.smtp_error = error.message;

    // Provide a helpful fix message based on the error type
    let fixHint = '';
    if (error.message.includes('535') || error.message.includes('BadCredentials') || error.message.includes('Username and Password')) {
      fixHint = 'Gmail rejected the password. You are likely using the normal Gmail password. You MUST use a Google App Password. Go to: https://myaccount.google.com/apppasswords';
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      fixHint = 'Cannot reach Gmail SMTP. Check your internet connection and firewall.';
    } else if (error.message.includes('ETIMEDOUT')) {
      fixHint = 'Connection timed out on both ports 465 and 587. Check that SMTP outbound traffic is not blocked by your firewall, antivirus, or ISP.';
    } else {
      fixHint = 'Unknown SMTP error. Check the full error stack below.';
    }

    console.error('[SMTP Diagnostics] ❌ SMTP Error:', error.message);
    
    // Step 3: Resend API Fallback
    if (process.env.RESEND_API_KEY) {
      console.log('[SMTP Diagnostics] 🔄 Attempting Resend API Fallback...');
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: `"One Point Solutions" <onboarding@resend.dev>`,
          to: email,
          subject: '✅ ERBS SMTP Test — Email Working Correctly (via Resend)',
          html: `<p>Your email was sent successfully using the Resend REST API Fallback!</p>`
        });
        
        diagnostics.resend_fallback_used = true;
        diagnostics.resend_status = 'Success';
        
        return res.json({
          success: true,
          message: `✅ Test email sent to ${email} via Resend Fallback`,
          smtp_authenticated: false,
          diagnostics
        });
      } catch (resendErr) {
        console.error('[SMTP Diagnostics] ❌ Resend Error:', resendErr.message);
        diagnostics.resend_fallback_used = true;
        diagnostics.resend_status = 'Failed';
        fixHint = 'Both SMTP and Resend API failed. Check your RESEND_API_KEY.';
      }
    } else {
      fixHint += ' 💡 SUGGESTION: Set RESEND_API_KEY in .env to bypass SMTP firewall blocks.';
    }

    logActivity('SMTP Test Failed', 'Settings', `SMTP test failed: ${error.message}`);

    res.status(500).json({
      success: false,
      step_failed: 'SMTP Authentication / Send',
      error: error.message,
      fix: fixHint,
      stack: error.stack,
      diagnostics
    });
  }
});


// Ensure database foreign keys are enabled
db.pragma('foreign_keys = ON');

// --- AUTHENTICATION ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An administrator with this email already exists.' });
    }

    const result = db.prepare('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)')
      .run(name, email, password);

    logActivity('Admin Registered', 'Auth', `Registered new admin: ${email}`);
    
    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        role: 'admin'
      },
      token: 'admin-session-token-' + admin.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Admin registration failed.' });
  }
});

app.post('/api/auth/google', (req, res) => {
  const { email, name, googleId, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google authentication payload missing email.' });
  }
  try {
    let admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    if (!admin) {
      // If admin doesn't exist, we register them on first signin
      const result = db.prepare('INSERT INTO admins (name, email, googleId, avatarUrl) VALUES (?, ?, ?, ?)')
        .run(name || 'Admin', email, googleId || null, avatarUrl || null);
      admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(result.lastInsertRowid);
      logActivity('Admin Registered via Google', 'Auth', `Registered admin ${email} via Google`);
    } else {
      // Update link/avatar details
      db.prepare('UPDATE admins SET googleId = ?, avatarUrl = ? WHERE id = ?')
        .run(googleId || admin.googleId, avatarUrl || admin.avatarUrl, admin.id);
      admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(admin.id);
      logActivity('Admin Login via Google', 'Auth', `Admin ${email} logged in via Google`);
    }
    res.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        role: 'admin',
        avatarUrl: admin.avatarUrl
      },
      token: 'admin-session-token-' + admin.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  try {
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    if (!admin) {
      logActivity('Unauthorized Login Attempt', 'Auth', `Failed login attempt with email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (admin.password !== password) {
      logActivity('Failed Login Attempt', 'Auth', `Incorrect password entered for ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    logActivity('Admin Login', 'Auth', `Successful admin authentication for ${email}`);
    
    res.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        role: 'admin',
        avatarUrl: admin.avatarUrl
      },
      token: 'admin-session-token-' + admin.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer admin-session-token-')) {
    const adminId = authHeader.replace('Bearer admin-session-token-', '');
    try {
      const admin = db.prepare('SELECT id, name, email, avatarUrl FROM admins WHERE id = ?').get(adminId);
      if (admin) {
        return res.json({
          email: admin.email,
          name: admin.name,
          role: 'admin',
          avatarUrl: admin.avatarUrl
        });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check session' });
    }
  }
  res.status(401).json({ error: 'Unauthorized access' });
});

app.post('/api/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing current or new password.' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer admin-session-token-')) {
    const adminId = authHeader.replace('Bearer admin-session-token-', '');
    try {
      const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin user not found.' });
      }

      if (admin.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }

      db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(newPassword, admin.id);
      logActivity('Password Changed', 'Auth', `Admin ${admin.email} changed password successfully`);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized access' });
  }
});


// --- COMPANY SETTINGS ---

app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', (req, res) => {
  const {
    company_name, company_logo, company_email, company_phone, company_address,
    company_website, company_support_email, company_whatsapp,
    whatsapp_provider, whatsapp_access_token, whatsapp_phone_number_id,
    twilio_sid, twilio_auth_token, sms_api_key, sender_id
  } = req.body;

  try {
    db.prepare(`
      UPDATE settings SET
        company_name = ?, company_logo = ?, company_email = ?, company_phone = ?, company_address = ?,
        company_website = ?, company_support_email = ?, company_whatsapp = ?,
        whatsapp_provider = ?, whatsapp_access_token = ?, whatsapp_phone_number_id = ?,
        twilio_sid = ?, twilio_auth_token = ?, sms_api_key = ?, sender_id = ?
      WHERE id = 1
    `).run(
      company_name, company_logo, company_email, company_phone, company_address,
      company_website, company_support_email, company_whatsapp,
      whatsapp_provider, whatsapp_access_token, whatsapp_phone_number_id,
      twilio_sid, twilio_auth_token, sms_api_key, sender_id
    );

    logActivity('Settings Updated', 'Settings', 'Admin updated company/API settings');
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});


// --- DEVICES MANAGEMENT ---

app.get('/api/devices', (req, res) => {
  try {
    const devices = db.prepare("SELECT * FROM devices WHERE status != 'Deleted' ORDER BY name ASC").all();
    res.json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.get('/api/devices/deleted', (req, res) => {
  try {
    const devices = db.prepare("SELECT * FROM devices WHERE status = 'Deleted' ORDER BY deleted_at DESC").all();
    res.json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deleted devices' });
  }
});

app.post('/api/devices', (req, res) => {
  const { name, category, brand, model, serial_number, condition, purchase_date, rental_price, deposit_amount, image_url, description, notes } = req.body;

  if (!name || !category || !brand || !model || !serial_number || !purchase_date || rental_price == null) {
    return res.status(400).json({ error: 'Required fields missing: Name, Category, Brand, Model, Serial, Purchase Date, Price' });
  }

  try {
    // Check unique serial number
    const existing = db.prepare('SELECT id FROM devices WHERE serial_number = ?').get(serial_number);
    if (existing) {
      return res.status(409).json({ error: 'A device with this Serial Number already exists.' });
    }

    const result = db.prepare(`
      INSERT INTO devices (name, category, brand, model, serial_number, condition, status, purchase_date, rental_price, deposit_amount, image_url, description, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'Available', ?, ?, ?, ?, ?, ?)
    `).run(name, category, brand, model, serial_number, condition || 'Excellent', purchase_date, rental_price, deposit_amount || 0.0, image_url || '', description || '', notes || '');

    logActivity('Device Added', 'Devices', `Added device: ${name} (SN: ${serial_number})`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Device created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create device.' });
  }
});

app.put('/api/devices/:id', (req, res) => {
  const { name, category, brand, model, serial_number, condition, status, purchase_date, rental_price, deposit_amount, image_url, description, notes } = req.body;

  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Verify serial uniqueness if changed
    if (serial_number && serial_number !== device.serial_number) {
      const existing = db.prepare('SELECT id FROM devices WHERE serial_number = ?').get(serial_number);
      if (existing) {
        return res.status(409).json({ error: 'A device with this Serial Number already exists.' });
      }
    }

    db.prepare(`
      UPDATE devices SET
        name = ?, category = ?, brand = ?, model = ?, serial_number = ?, condition = ?,
        status = ?, purchase_date = ?, rental_price = ?, deposit_amount = ?, image_url = ?, description = ?, notes = ?
      WHERE id = ?
    `).run(
      name || device.name,
      category || device.category,
      brand || device.brand,
      model || device.model,
      serial_number || device.serial_number,
      condition || device.condition,
      status || device.status,
      purchase_date || device.purchase_date,
      rental_price != null ? rental_price : device.rental_price,
      deposit_amount != null ? deposit_amount : device.deposit_amount,
      image_url !== undefined ? image_url : device.image_url,
      description !== undefined ? description : device.description,
      notes !== undefined ? notes : device.notes,
      req.params.id
    );

    logActivity('Device Edited', 'Devices', `Modified device: ${name || device.name}`);
    res.json({ message: 'Device updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

app.delete('/api/devices/:id', (req, res) => {
  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Check if device is currently rented
    const activeBooking = db.prepare(`
      SELECT id FROM bookings WHERE device_id = ? AND status = 'Active'
    `).get(req.params.id);

    if (activeBooking) {
      return res.status(400).json({ error: 'Cannot delete device currently in active rental.' });
    }

    db.prepare("UPDATE devices SET status = 'Deleted', deleted_at = CURRENT_TIMESTAMP, deleted_by = 'Admin' WHERE id = ?")
      .run(req.params.id);

    logActivity('Device Soft Deleted', 'Devices', `Soft deleted device: ${device.name}`);
    res.json({ message: 'Device moved to Deleted History.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

app.post('/api/devices/:id/restore', (req, res) => {
  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    db.prepare("UPDATE devices SET status = 'Available', deleted_at = NULL, deleted_by = NULL WHERE id = ?")
      .run(req.params.id);

    logActivity('Device Restored', 'Devices', `Restored device: ${device.name}`);
    res.json({ message: 'Device restored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore device.' });
  }
});

app.delete('/api/devices/:id/permanent', (req, res) => {
  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Warning validation: check if has ANY booking history
    const historyCount = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE device_id = ?').get(req.params.id);
    
    // Perform delete anyway but log warning. Clear references safely if cascading is needed
    // In our schema, we block delete if active rentals exist (done in soft-delete stage)
    db.prepare('DELETE FROM devices WHERE id = ?').run(req.params.id);

    logActivity('Device Permanently Deleted', 'Devices', `Permanently deleted device: ${device.name} (had ${historyCount.count} previous bookings)`);
    res.json({ message: 'Device deleted permanently from database.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to permanently delete device' });
  }
});


// --- CUSTOMERS MANAGEMENT ---

app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare("SELECT * FROM customers WHERE status = 'Active' ORDER BY name ASC").all();
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/deleted', (req, res) => {
  try {
    const customers = db.prepare("SELECT * FROM customers WHERE status = 'Deleted' ORDER BY deleted_at DESC").all();
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deleted customers' });
  }
});

app.post('/api/customers', (req, res) => {
  const { name, email, phone, address, id_proof, gov_id_number, notes } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, Email, and Phone are required' });
  }

  try {
    // Check if email already active
    const existing = db.prepare("SELECT id FROM customers WHERE email = ? AND status = 'Active'").get(email);
    if (existing) {
      return res.status(409).json({ error: 'A customer with this email already exists.' });
    }

    const result = db.prepare(`
      INSERT INTO customers (name, email, phone, address, id_proof, gov_id_number, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'Active', ?)
    `).run(name, email, phone, address || '', id_proof || '', gov_id_number || '', notes || '');

    logActivity('Customer Created', 'Customers', `Created customer: ${name} (${email})`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Customer created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', (req, res) => {
  const { name, email, phone, address, id_proof, gov_id_number, notes } = req.body;

  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    if (email && email !== customer.email) {
      const existing = db.prepare("SELECT id FROM customers WHERE email = ? AND status = 'Active'").get(email);
      if (existing) return res.status(409).json({ error: 'Email already in use.' });
    }

    db.prepare(`
      UPDATE customers SET
        name = ?, email = ?, phone = ?, address = ?, id_proof = ?, gov_id_number = ?, notes = ?
      WHERE id = ?
    `).run(
      name || customer.name,
      email || customer.email,
      phone || customer.phone,
      address !== undefined ? address : customer.address,
      id_proof !== undefined ? id_proof : customer.id_proof,
      gov_id_number !== undefined ? gov_id_number : customer.gov_id_number,
      notes !== undefined ? notes : customer.notes,
      req.params.id
    );

    logActivity('Customer Edited', 'Customers', `Edited customer: ${name || customer.name}`);
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Check if customer has active rentals
    const activeBooking = db.prepare(`
      SELECT id FROM bookings WHERE customer_id = ? AND status = 'Active'
    `).get(req.params.id);

    if (activeBooking) {
      return res.status(400).json({ error: 'Cannot delete customer with active rentals.' });
    }

    db.prepare("UPDATE customers SET status = 'Deleted', deleted_at = CURRENT_TIMESTAMP, deleted_by = 'Admin' WHERE id = ?")
      .run(req.params.id);

    logActivity('Customer Deleted', 'Customers', `Soft deleted customer: ${customer.name}`);
    res.json({ message: 'Customer moved to Deleted History.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

app.post('/api/customers/:id/restore', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    db.prepare("UPDATE customers SET status = 'Active', deleted_at = NULL, deleted_by = NULL WHERE id = ?")
      .run(req.params.id);

    logActivity('Customer Restored', 'Customers', `Restored customer: ${customer.name}`);
    res.json({ message: 'Customer restored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore customer' });
  }
});

app.delete('/api/customers/:id/permanent', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const historyCount = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?').get(req.params.id);

    // Delete customer
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);

    logActivity('Customer Permanently Deleted', 'Customers', `Permanently deleted customer: ${customer.name} (had ${historyCount.count} previous bookings)`);
    res.json({
      message: 'Customer permanently deleted.',
      hadHistory: historyCount.count > 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to permanently delete customer' });
  }
});


// --- RENTALS (BOOKINGS) MANAGEMENT ---

app.get('/api/rentals', (req, res) => {
  try {
    const rentals = db.prepare(`
      SELECT b.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, d.name as device_name, d.serial_number as device_serial, d.image_url as device_image
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN devices d ON b.device_id = d.id
      WHERE b.status != 'Deleted'
      ORDER BY b.created_at DESC
    `).all();
    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

app.get('/api/rentals/deleted', (req, res) => {
  try {
    const rentals = db.prepare(`
      SELECT b.*, c.name as customer_name, d.name as device_name, d.serial_number as device_serial
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN devices d ON b.device_id = d.id
      WHERE b.status = 'Deleted'
      ORDER BY b.deleted_at DESC
    `).all();
    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch deleted rentals' });
  }
});

app.post('/api/rentals', async (req, res) => {
  const { customer_id, device_id, start_date, end_date, rental_amount, deposit_amount, payment_method, notes } = req.body;
  const quantity_requested = parseInt(req.body.quantity || req.body.quantity_requested || 1, 10);

  if (!customer_id || !device_id || !start_date || !end_date || rental_amount == null || deposit_amount == null) {
    return res.status(400).json({ error: 'Required fields missing: Customer ID, Device ID, Dates, Amount, Deposit' });
  }

  try {
    // 1. Check if device exists in DB
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(device_id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.status === 'Deleted' || device.status === 'Repair') {
      return res.status(400).json({ error: 'This device is currently under repair or deleted and cannot be rented.' });
    }

    // 2. Conflict Prevention: Check aggregate capacity of overlapping bookings
    const overlaps = db.prepare(`
      SELECT start_date, end_date, quantity FROM bookings
      WHERE device_id = ?
      AND status NOT IN ('Cancelled', 'Returned', 'Deleted')
      AND NOT (end_date < ? OR start_date > ?)
    `).all(device_id, start_date, end_date);

    const getDatesInRange = (startStr, endStr) => {
      const dates = [];
      const start = new Date(startStr);
      const end = new Date(endStr);
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const dates = getDatesInRange(start_date, end_date);
    const maxConcurrentBooked = Math.max(0, ...dates.map(date => {
      return overlaps
        .filter(b => b.start_date <= date && b.end_date >= date)
        .reduce((sum, b) => sum + (b.quantity || 1), 0);
    }));

    if (maxConcurrentBooked + quantity_requested > device.totalQuantity) {
      return res.status(400).json({
        error: `Insufficient stock for the selected dates. Maximum available: ${Math.max(0, device.totalQuantity - maxConcurrentBooked)}, Requested: ${quantity_requested}.`
      });
    }

    // 3. Insert rental booking (both regular and compatibility fields)
    const result = db.prepare(`
      INSERT INTO bookings (
        deviceId, device_id, customerId, customer_id, 
        quantity, bookingStatus, status, paymentStatus, payment_status,
        bookingDate, start_date, returnDate, end_date,
        rental_amount, deposit_amount, payment_method, notes
      )
      VALUES (?, ?, ?, ?, ?, 'Active', 'Active', 'Pending', 'Pending', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      device_id, device_id, customer_id, customer_id,
      quantity_requested,
      start_date, start_date, end_date, end_date,
      rental_amount, deposit_amount, payment_method || 'UPI', notes || ''
    );

    const bookingId = result.lastInsertRowid;

    // 4. Recalculate and update device quantities
    updateDeviceQuantities(device_id);

    // Fetch customer and company name to send notifications
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
    const settings = db.prepare('SELECT company_name FROM settings WHERE id = 1').get();
    const companyName = settings ? settings.company_name : 'One Point Solutions';

    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    // Auto-create Payments record
    db.prepare(`
      INSERT INTO payments (booking_id, payment_type, amount, status)
      VALUES (?, 'Rental', ?, 'Pending')
    `).run(bookingId, rental_amount);

    // 5. Trigger notifications (SMTP / WhatsApp)
    triggerRentalCreatedNotifications(newBooking, customer, device, companyName).catch(err => {
      console.error('Notification failed:', err.message);
    });

    logActivity('Rental Created', 'Rentals', `Created rental #${bookingId} (qty: ${quantity_requested}) for customer ${customer.name} (Device: ${device.name})`);
    
    res.status(201).json({
      message: 'Rental created successfully.',
      booking_id: bookingId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create rental booking' });
  }
});

app.put('/api/rentals/:id', (req, res) => {
  const { rental_amount, deposit_amount, payment_status, payment_method, notes, start_date, end_date } = req.body;

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Rental not found' });

    db.prepare(`
      UPDATE bookings SET
        rental_amount = ?, deposit_amount = ?, payment_status = ?, payment_status = ?, paymentStatus = ?,
        payment_method = ?, notes = ?, start_date = ?, start_date = ?, bookingDate = ?,
        end_date = ?, end_date = ?, returnDate = ?
      WHERE id = ?
    `).run(
      rental_amount != null ? rental_amount : booking.rental_amount,
      deposit_amount != null ? deposit_amount : booking.deposit_amount,
      payment_status || booking.payment_status,
      payment_status || booking.payment_status,
      payment_status || booking.payment_status,
      payment_method || booking.payment_method,
      notes !== undefined ? notes : booking.notes,
      start_date || booking.start_date,
      start_date || booking.start_date,
      start_date || booking.start_date,
      end_date || booking.end_date,
      end_date || booking.end_date,
      end_date || booking.end_date,
      req.params.id
    );

    // Sync payments row
    db.prepare("UPDATE payments SET amount = ? WHERE booking_id = ? AND payment_type = 'Rental'")
      .run(rental_amount != null ? rental_amount : booking.rental_amount, req.params.id);

    // Recalculate quantity tracking
    updateDeviceQuantities(booking.device_id);

    logActivity('Rental Edited', 'Rentals', `Edited rental details for Booking #${req.params.id}`);
    res.json({ message: 'Rental details updated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update rental details.' });
  }
});

// Finalize return with damage checks
app.post('/api/rentals/:id/return', async (req, res) => {
  const { damage_notes, damage_fee, return_condition, mark_repair } = req.body;

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Rental not found' });
    if (booking.status === 'Returned') return res.status(400).json({ error: 'Rental already returned.' });

    // Update rental status
    db.prepare(`
      UPDATE bookings SET
        status = 'Returned', actual_return_date = CURRENT_DATE, damage_notes = ?, damage_fee = ?
      WHERE id = ?
    `).run(damage_notes || '', damage_fee || 0.0, req.params.id);

    // Set device status back to Available or Repair
    const newDeviceStatus = mark_repair ? 'Repair' : 'In Stock';
    db.prepare("UPDATE devices SET status = ?, condition = ? WHERE id = ?")
      .run(newDeviceStatus, return_condition || 'Excellent', booking.device_id);

    // Recalculate quantity tracking
    updateDeviceQuantities(booking.device_id);

    // Log Damage report if any damage fee is logged
    const fee = parseFloat(damage_fee) || 0;
    if (fee > 0 || damage_notes) {
      db.prepare(`
        INSERT INTO damage_reports (device_id, customer_id, booking_id, description, severity, repair_cost, damage_date, status)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Pending')
      `).run(booking.device_id, booking.customer_id, req.params.id, damage_notes || 'Device damaged during rental.', fee > 1000 ? 'High' : 'Medium', fee);

      // Create Payment entry for damage
      db.prepare(`
        INSERT INTO payments (booking_id, payment_type, amount, status, notes)
        VALUES (?, 'Damage', ?, 'Pending', ?)
      `).run(req.params.id, fee, damage_notes);
    }

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(booking.customer_id);
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(booking.device_id);
    const settings = db.prepare('SELECT company_name FROM settings WHERE id = 1').get();
    const companyName = settings ? settings.company_name : 'One Point Solutions';

    // Trigger Notification
    triggerRentalReturnedNotifications(booking, customer, device, companyName).catch(err => {
      console.log('Return notification failed:', err.message);
    });

    logActivity('Rental Returned', 'Rentals', `Rental return finalized for Booking #${req.params.id}. Device marked as ${newDeviceStatus}`);
    res.json({ message: 'Device return processed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process device return.' });
  }
});

// Extend rental dates
app.post('/api/rentals/:id/extend', async (req, res) => {
  const { new_end_date, additional_amount } = req.body;
  if (!new_end_date || additional_amount == null) {
    return res.status(400).json({ error: 'Missing new end date or extension fee amount.' });
  }

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Rental booking not found.' });

    // Get device total quantity capacity
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(booking.device_id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Conflict Prevention: check aggregate capacity for the whole period (excluding current booking)
    const overlaps = db.prepare(`
      SELECT start_date, end_date, quantity FROM bookings
      WHERE device_id = ?
      AND id != ?
      AND status NOT IN ('Cancelled', 'Returned', 'Deleted')
      AND NOT (end_date < ? OR start_date > ?)
    `).all(booking.device_id, req.params.id, booking.start_date, new_end_date);

    const getDatesInRange = (startStr, endStr) => {
      const dates = [];
      const start = new Date(startStr);
      const end = new Date(endStr);
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const dates = getDatesInRange(booking.start_date, new_end_date);
    const bookingQty = booking.quantity || 1;
    const maxConcurrentBooked = Math.max(0, ...dates.map(date => {
      return overlaps
        .filter(b => b.start_date <= date && b.end_date >= date)
        .reduce((sum, b) => sum + (b.quantity || 1), 0);
    }));

    if (maxConcurrentBooked + bookingQty > device.totalQuantity) {
      return res.status(400).json({ error: 'Cannot extend rental: insufficient stock for the extended period.' });
    }

    const newTotalAmount = booking.rental_amount + parseFloat(additional_amount);

    db.prepare(`
      UPDATE bookings SET
        end_date = ?, returnDate = ?, rental_amount = ?
      WHERE id = ?
    `).run(new_end_date, new_end_date, newTotalAmount, req.params.id);

    // Sync payments row
    db.prepare("UPDATE payments SET amount = ? WHERE booking_id = ? AND payment_type = 'Rental'")
      .run(newTotalAmount, req.params.id);

    // Recalculate quantity tracking
    updateDeviceQuantities(booking.device_id);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(booking.customer_id);
    const settings = db.prepare('SELECT company_name FROM settings WHERE id = 1').get();
    const companyName = settings ? settings.company_name : 'One Point Solutions';

    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);

    // Trigger Notification
    triggerRentalExtendedNotifications(updatedBooking, customer, device, companyName).catch(err => {
      console.log('Extension notification failed:', err.message);
    });

    logActivity('Rental Extended', 'Rentals', `Extended booking #${req.params.id} to ${new_end_date} (Fee: +₹${additional_amount})`);
    res.json({ message: 'Rental extended successfully.', new_total: newTotalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extend rental.' });
  }
});

app.delete('/api/rentals/:id', (req, res) => {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Rental not found.' });

    db.prepare("UPDATE bookings SET status = 'Deleted', bookingStatus = 'Deleted', deleted_at = CURRENT_TIMESTAMP, deleted_by = 'Admin' WHERE id = ?")
      .run(req.params.id);

    // Recalculate quantity tracking
    updateDeviceQuantities(booking.device_id);

    logActivity('Rental Soft Deleted', 'Rentals', `Soft deleted rental booking #${req.params.id}`);
    res.json({ message: 'Rental moved to Deleted History.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete rental.' });
  }
});

app.post('/api/rentals/:id/restore', (req, res) => {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Rental not found.' });

    // Determine status: check if overdue or active
    const today = new Date().toISOString().split('T')[0];
    const newStatus = booking.end_date < today ? 'Overdue' : 'Active';

    db.prepare("UPDATE bookings SET status = ?, bookingStatus = ?, deleted_at = NULL, deleted_by = NULL WHERE id = ?")
      .run(newStatus, newStatus, req.params.id);

    // Recalculate quantity tracking
    updateDeviceQuantities(booking.device_id);

    logActivity('Rental Restored', 'Rentals', `Restored rental booking #${req.params.id}`);
    res.json({ message: 'Rental restored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore rental.' });
  }
});

app.delete('/api/rentals/:id/permanent', (req, res) => {
  try {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    logActivity('Rental Permanently Deleted', 'Rentals', `Permanently deleted rental booking #${req.params.id}`);
    res.json({ message: 'Rental permanently removed from database.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to permanently delete rental' });
  }
});


// --- DAMAGE REPORTS ---

app.get('/api/damage-reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT dr.*, d.name as device_name, d.serial_number as device_serial, c.name as customer_name, c.phone as customer_phone
      FROM damage_reports dr
      JOIN devices d ON dr.device_id = d.id
      JOIN customers c ON dr.customer_id = c.id
      ORDER BY dr.created_at DESC
    `).all();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch damage reports' });
  }
});

app.put('/api/damage-reports/:id', (req, res) => {
  const { status, repair_cost, description } = req.body;

  try {
    const report = db.prepare('SELECT * FROM damage_reports WHERE id = ?').get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    db.prepare(`
      UPDATE damage_reports SET
        status = ?, repair_cost = ?, description = ?
      WHERE id = ?
    `).run(
      status || report.status,
      repair_cost != null ? repair_cost : report.repair_cost,
      description !== undefined ? description : report.description,
      req.params.id
    );

    // If resolved, sync device status to Available if currently Repair
    if (status === 'Resolved') {
      const device = db.prepare('SELECT status FROM devices WHERE id = ?').get(report.device_id);
      if (device && device.status === 'Repair') {
        db.prepare("UPDATE devices SET status = 'Available' WHERE id = ?").run(report.device_id);
      }
    }

    logActivity('Damage Case Updated', 'Damages', `Updated damage report #${req.params.id} (Status: ${status || report.status})`);
    res.json({ message: 'Damage report updated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update damage report.' });
  }
});


// --- NOTIFICATIONS & AUDIT LOGS ---

app.get('/api/notifications', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.get('/api/system-events', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC').all();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});


// --- PAYMENTS ---

app.get('/api/payments', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT p.*, b.status as booking_status, 
             c.name as customer_name, c.name as user_name,
             c.email as customer_email, c.email as user_email, 
             d.name as device_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      JOIN devices d ON b.device_id = d.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.patch('/api/payments/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Paid', 'Waived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    let txnId = '';
    let updatedNotes = payment.notes || '';
    if (status === 'Paid') {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randNum = Math.floor(1000 + Math.random() * 9000);
      txnId = `TXN-${todayStr}-${randNum}`;
      updatedNotes = payment.notes ? `${payment.notes} | Transaction ID: ${txnId}` : `Transaction ID: ${txnId}`;
      db.prepare('UPDATE payments SET status = ?, notes = ? WHERE id = ?').run(status, updatedNotes, req.params.id);
    } else {
      db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, req.params.id);
    }

    // Sync booking payment status if it is a Rental payment
    if (payment.payment_type === 'Rental') {
      db.prepare('UPDATE bookings SET payment_status = ? WHERE id = ?').run(status, payment.booking_id);
    }

    let emailStatus = 'Not Sent';
    let emailError = null;

    if (status === 'Paid') {
      try {
        const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(payment.booking_id);
        if (booking) {
          const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(booking.customer_id);
          const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(booking.device_id);
          const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {};
          
          const updatedPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
          const emailResult = await sendPaymentSuccessEmail(booking, customer, device, updatedPayment, settings);
          emailStatus = emailResult.status;
          emailError = emailResult.error;
        }
      } catch (err) {
        console.error('Failed to send payment success email during status patch:', err.message);
        emailStatus = 'Failed';
        emailError = err.message;
      }
    }

    logActivity('Payment Updated', 'Payments', `Marked Payment #${req.params.id} (${payment.payment_type}) as ${status} (Txn: ${txnId || 'N/A'}, Email: ${emailStatus})`);
    res.json({ 
      message: `Payment status marked as ${status}`,
      emailStatus,
      emailError,
      transaction_id: txnId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment.' });
  }
});


// --- BACKUP & RESTORE UTILITY ---

app.post('/api/backup', (req, res) => {
  try {
    const backupPath = dbPath + '.bak';
    fs.copyFileSync(dbPath, backupPath);
    logActivity('Database Backup Created', 'Settings', 'Admin created backup of rental.db');
    res.json({ message: 'Backup created successfully.', filename: 'rental.db.bak' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database backup failed.' });
  }
});

app.post('/api/restore-backup', (req, res) => {
  try {
    const backupPath = dbPath + '.bak';
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'No backup file found to restore.' });
    }
    // Close connection temporarily to replace the file
    db.close();
    fs.copyFileSync(backupPath, dbPath);
    // Reopen DB connection
    new Database(dbPath);
    logActivity('Database Restored', 'Settings', 'Admin restored rental.db from backup file');
    res.json({ message: 'Database restored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database restore failed.' });
  }
});


// --- REPORTS & AGGREGATES ---

app.get('/api/reports/summary', (req, res) => {
  try {
    // 1. Inventory Report Summary
    const totalDevices = db.prepare("SELECT SUM(totalQuantity) as count FROM devices WHERE status != 'Deleted'").get().count || 0;
    const availableDevices = db.prepare("SELECT SUM(availableQuantity) as count FROM devices WHERE status != 'Deleted' AND status != 'Repair'").get().count || 0;
    const rentedDevices = db.prepare("SELECT SUM(bookedQuantity) as count FROM devices WHERE status != 'Deleted'").get().count || 0;
    const repairDevices = db.prepare("SELECT SUM(totalQuantity) as count FROM devices WHERE status = 'Repair'").get().count || 0;
    const deletedDevices = db.prepare("SELECT SUM(totalQuantity) as count FROM devices WHERE status = 'Deleted'").get().count || 0;

    // 2. Customer Report Summary
    const activeCustomers = db.prepare("SELECT COUNT(*) as count FROM customers WHERE status = 'Active'").get().count;
    const deletedCustomers = db.prepare("SELECT COUNT(*) as count FROM customers WHERE status = 'Deleted'").get().count;

    // 3. Rental Report Summary
    const totalRentals = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status != 'Deleted'").get().count;
    const activeRentals = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'Active'").get().count;
    const returnedRentals = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'Returned'").get().count;
    const overdueRentals = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'Overdue'").get().count;
    const cancelledRentals = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'Cancelled'").get().count;
    const deletedRentals = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'Deleted'").get().count;

    // 4. Revenue summary
    const revenuePaid = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'Paid' AND payment_type = 'Rental'").get().sum || 0;
    const revenuePending = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'Pending' AND payment_type = 'Rental'").get().sum || 0;
    
    // Damage collections
    const damagePaid = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'Paid' AND payment_type = 'Damage'").get().sum || 0;
    const damagePending = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'Pending' AND payment_type = 'Damage'").get().sum || 0;

    res.json({
      inventory: { total: totalDevices, available: availableDevices, rented: rentedDevices, repair: repairDevices, deleted: deletedDevices },
      customers: { active: activeCustomers, deleted: deletedCustomers },
      rentals: { total: totalRentals, active: activeRentals, returned: returnedRentals, overdue: overdueRentals, cancelled: cancelledRentals, deleted: deletedRentals },
      revenue: { paid: revenuePaid, pending: revenuePending, damagePaid, damagePending }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to compile report summaries.' });
  }
});

// --- WORKFLOW ENHANCEMENT ENDPOINTS (SMTP EMAILS) ---

app.post(['/booking/confirm', '/api/booking/confirm'], async (req, res) => {
  const bookingId = req.body.booking_id || req.body.id;
  if (!bookingId) {
    return res.status(400).json({ error: 'Missing booking_id.' });
  }

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Update status to Active (Confirmed)
    db.prepare("UPDATE bookings SET status = 'Active', bookingStatus = 'Active' WHERE id = ?").run(bookingId);

    // Sync device quantities (this updates availableQuantity/bookedQuantity/status)
    updateDeviceQuantities(booking.device_id);

    // Fetch related records
    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(booking.customer_id);
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(booking.device_id);
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {};

    // Send confirmation email
    const emailResult = await sendBookingConfirmEmail(updatedBooking, customer, device, settings);

    logActivity('Booking Confirmed', 'Rentals', `Confirmed booking #${bookingId} (Customer: ${customer.name}, Email Status: ${emailResult.status})`);

    res.json({
      success: true,
      message: 'Booking confirmed successfully.',
      emailStatus: emailResult.status,
      emailError: emailResult.error,
      emailStack: emailResult.stack
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking: ' + error.message });
  }
});

app.post(['/booking/return', '/api/booking/return'], async (req, res) => {
  const bookingId = req.body.booking_id || req.body.id;
  const { damage_notes, damage_fee, return_condition, mark_repair } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing booking_id.' });
  }

  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) return res.status(404).json({ error: 'Rental booking not found.' });
    if (booking.status === 'Returned') return res.status(400).json({ error: 'Rental already returned.' });

    const fee = parseFloat(damage_fee) || 0;

    // Update rental status
    db.prepare(`
      UPDATE bookings SET
        status = 'Returned', actual_return_date = CURRENT_DATE, damage_notes = ?, damage_fee = ?
      WHERE id = ?
    `).run(damage_notes || '', fee, bookingId);

    // Set device status back to Available or Repair
    const newDeviceStatus = mark_repair ? 'Repair' : 'In Stock';
    db.prepare("UPDATE devices SET status = ?, condition = ? WHERE id = ?")
      .run(newDeviceStatus, return_condition || 'Excellent', booking.device_id);
    updateDeviceQuantities(booking.device_id);

    // Log Damage report if any damage fee is logged or damage notes
    if (fee > 0 || damage_notes) {
      db.prepare(`
        INSERT INTO damage_reports (device_id, customer_id, booking_id, description, severity, repair_cost, damage_date, status)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Pending')
      `).run(booking.device_id, booking.customer_id, bookingId, damage_notes || 'Device damaged during rental.', fee > 1000 ? 'High' : 'Medium', fee);

      // Create Payment entry for damage
      db.prepare(`
        INSERT INTO payments (booking_id, payment_type, amount, status, notes)
        VALUES (?, 'Damage', ?, 'Pending', ?)
      `).run(bookingId, fee, damage_notes);
    }

    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(booking.customer_id);
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(booking.device_id);
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {};

    // Trigger Notification
    const emailResult = await sendDeviceReturnedEmail(updatedBooking, customer, device, settings);

    logActivity('Rental Returned', 'Rentals', `Rental return finalized for Booking #${bookingId}. Email Status: ${emailResult.status}`);

    res.json({
      success: true,
      message: 'Device return processed successfully.',
      emailStatus: emailResult.status,
      emailError: emailResult.error,
      emailStack: emailResult.stack
    });
  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({ error: 'Failed to process return: ' + error.message });
  }
});

app.post(['/payment/success', '/api/payment/success'], async (req, res) => {
  const bookingId = req.body.booking_id || req.body.id;
  const paymentId = req.body.payment_id;

  if (!bookingId && !paymentId) {
    return res.status(400).json({ error: 'Missing booking_id or payment_id.' });
  }

  try {
    let payment = null;
    if (paymentId) {
      payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    } else {
      // Find the rental payment for this booking
      payment = db.prepare("SELECT * FROM payments WHERE booking_id = ? AND payment_type = 'Rental'").get(bookingId);
    }

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    const currentBookingId = payment.booking_id;
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(currentBookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Generate Transaction ID
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const txnId = `TXN-${todayStr}-${randNum}`;

    // Update payment status and transaction notes
    const newNotes = payment.notes ? `${payment.notes} | Transaction ID: ${txnId}` : `Transaction ID: ${txnId}`;
    db.prepare("UPDATE payments SET status = 'Paid', notes = ? WHERE id = ?").run(newNotes, payment.id);

    // Sync booking payment status if it is a Rental payment
    if (payment.payment_type === 'Rental') {
      db.prepare("UPDATE bookings SET payment_status = 'Paid' WHERE id = ?").run(currentBookingId);
    }

    // Fetch updated payment
    const updatedPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.id);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(booking.customer_id);
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(booking.device_id);
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {};

    // Send email
    const emailResult = await sendPaymentSuccessEmail(booking, customer, device, updatedPayment, settings);

    logActivity('Payment Successful', 'Payments', `Marked Payment #${payment.id} as Paid (Txn: ${txnId}, Email Status: ${emailResult.status})`);

    res.json({
      success: true,
      message: 'Payment completed successfully.',
      transaction_id: txnId,
      emailStatus: emailResult.status,
      emailError: emailResult.error,
      emailStack: emailResult.stack
    });
  } catch (error) {
    console.error('Error updating payment success:', error);
    res.status(500).json({ error: 'Failed to record payment: ' + error.message });
  }
});

// SPA Fallback Route (Must be last)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
