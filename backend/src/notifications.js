const Database = require('better-sqlite3');
const path = require('path');
const nodemailer = require('nodemailer');

const dbPath = path.join(__dirname, '../../database/rental.db');

let _db = null;
function getDb() {
  if (!_db) {
    _db = new Database(dbPath);
  }
  return _db;
}

// Log notification details into database
function logNotification({ customer_name, phone, email, type, channel, status, message_preview }) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO notifications (customer_name, phone, email, type, channel, status, message_preview)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(customer_name, phone || '', email || '', type, channel, status, message_preview);
  } catch (err) {
    console.error('Error logging notification history:', err.message);
  }
}

// Log activity details into database
function logActivity({ action, module, details }) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO activity_logs (action, admin_name, module, details)
      VALUES (?, 'Admin', ?, ?)
    `).run(action, module, details);
  } catch (err) {
    console.error('Error logging activity:', err.message);
  }
}

/**
 * Get nodemailer transporter configured with environment variables.
 * Uses Gmail-specific TLS settings for compatibility.
 */
function getTransporter(portOverride, secureOverride, requireTLSOverride) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = portOverride !== undefined ? portOverride : parseInt(process.env.SMTP_PORT || '587');
  const isSecure = secureOverride !== undefined ? secureOverride : (process.env.SMTP_SECURE === 'true' || port === 465);

  if (!user || !pass) {
    throw new Error('SMTP credentials missing. Process.env.EMAIL_USER or EMAIL_PASS is not defined.');
  }

  if (pass === 'YOUR_16_CHAR_APP_PASSWORD_HERE' || pass === 'onepoint123') {
    throw new Error('EMAIL_PASS is set to a placeholder value. Please set a valid Google App Password.');
  }

  console.log(`[SMTP] Configuring transporter: ${user} via ${host}:${port} (secure=${isSecure})`);
  
  const config = {
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  };

  if (requireTLSOverride !== undefined) {
    config.requireTLS = requireTLSOverride;
  }

  return nodemailer.createTransport(config);
}

/**
 * General helper to send email via SMTP with a single retry on failure
 */
async function sendEmailWithRetry({ to, subject, htmlContent, customerName, type }) {
  const timestamp = new Date().toISOString();
  console.log(`\n[SMTP Log] ─── Email Dispatch: ${type} ───`);
  console.log(`[SMTP Log] Timestamp:       ${timestamp}`);
  console.log(`[SMTP Log] Sender:          ${process.env.EMAIL_USER}`);
  console.log(`[SMTP Log] Recipient:       ${to}`);
  console.log(`[SMTP Log] Subject:         ${subject}`);

  // Validate recipient email
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    const errMsg = `Invalid or missing customer email address: "${to}"`;
    console.error(`[SMTP Log] Validation Failed: ${errMsg}`);
    logNotification({
      customer_name: customerName,
      phone: '',
      email: to || '',
      type,
      channel: 'Email',
      status: 'Failed',
      message_preview: `Validation Failed: ${errMsg}`
    });
    return { success: false, status: 'Failed', error: errMsg };
  }

  let transporter;
  let transporterError = null;
  try {
    transporter = getTransporter();
  } catch (err) {
    transporterError = err;
    console.warn(`[SMTP Warning] ${err.message}`);
  }

  // --- Implement 1-Time Retry Logic (Step 10) ---
  const MAX_RETRIES = 1;
  let attempt = 0;
  let lastVerifyErr = transporterError;

  if (transporter) {
    while (attempt <= MAX_RETRIES) {
      try {
        console.log(`[SMTP Log] Attempt ${attempt + 1}: Verifying SMTP Connection...`);
        await transporter.verify();
        console.log('[SMTP Log] SMTP Connected successfully!');
        lastVerifyErr = null;
        break; // Success, exit retry loop
      } catch (verifyErr) {
        lastVerifyErr = verifyErr;
        console.error(`[SMTP Log] Verification Attempt ${attempt + 1} Failed:`, verifyErr.message);
        
        if (attempt < MAX_RETRIES) {
          console.log(`[SMTP Log] Falling back to Port 587 with STARTTLS in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          transporter = getTransporter(587, false, true);
        }
        attempt++;
      }
    }
  }

  // If all verify retries failed, attempt REST API Fallback
  if (lastVerifyErr) {
    console.warn('[SMTP Log] Gmail SMTP Failed completely. Attempting HTTP REST API Fallback (Resend)...');
    
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('[SMTP Log] Sending via Resend REST API...');
        await resend.emails.send({
          from: `"One Point Solutions" <onboarding@resend.dev>`, // Standard Resend testing domain
          to,
          subject,
          html: htmlContent
        });
        
        console.log('[SMTP Log] Email Sent Successfully via Resend API');
        logNotification({
          customer_name: customerName,
          phone: '',
          email: to,
          type,
          channel: 'Email',
          status: 'Sent',
          message_preview: `[REST Fallback] ${subject}`
        });
        logActivity({
          action: 'Email Sent',
          module: 'Notifications',
          details: `Successfully sent ${type} email to ${to} via Resend REST API`
        });
        return { success: true, status: 'Sent via Resend' };
      } catch (resendErr) {
        console.error('[SMTP Log] Resend API Failed:', resendErr.message);
        // Continue to regular failure handling
        lastVerifyErr = new Error(`Both SMTP and Resend API failed. SMTP: ${lastVerifyErr.message} | Resend: ${resendErr.message}`);
      }
    } else {
      console.warn('[SMTP Log] Resend API Key not found. Cannot perform fallback.');
    }

    console.error('[SMTP Log] Email Failed - Exhausted Retries and Fallbacks');
    console.error('[SMTP Log] SMTP Error:', lastVerifyErr.message);
    console.error('[SMTP Log] Stack Trace:', lastVerifyErr.stack);
    logNotification({
      customer_name: customerName,
      phone: '',
      email: to,
      type,
      channel: 'Email',
      status: 'Failed',
      message_preview: `Verify Failed: ${lastVerifyErr.message}`
    });
    return { success: false, status: 'Failed', error: lastVerifyErr.message, stack: lastVerifyErr.stack };
  }

  const mailOptions = {
    from: `"One Point Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  };

  let sendAttempt = 1;
  const maxAttempts = 2; // initial send + 1 retry

  while (sendAttempt <= maxAttempts) {
    try {
      await transporter.sendMail(mailOptions);
      console.log('[SMTP Log] Email Sent Successfully');
      logNotification({
        customer_name: customerName,
        phone: '',
        email: to,
        type,
        channel: 'Email',
        status: 'Sent',
        message_preview: subject
      });
      logActivity({
        action: 'Email Sent',
        module: 'Notifications',
        details: `Successfully sent ${type} email to ${to}`
      });
      return { success: true, status: 'Sent' };
    } catch (err) {
      console.error(`[SMTP Log] Attempt ${sendAttempt} failed to send email to ${to}:`, err.message);
      if (sendAttempt === maxAttempts) {
        console.error('[SMTP Log] Email Failed');
        console.error('[SMTP Log] SMTP Error:', err.message);
        console.error('[SMTP Log] Stack Trace:', err.stack);
        logNotification({
          customer_name: customerName,
          phone: '',
          email: to,
          type,
          channel: 'Email',
          status: 'Failed',
          message_preview: `Failed: ${err.message}`
        });
        logActivity({
          action: 'Email Failed',
          module: 'Notifications',
          details: `Failed to send ${type} email to ${to}: ${err.message}`
        });
        return { success: false, status: 'Failed', error: err.message, stack: err.stack };
      }
      sendAttempt++;
      console.log(`[SMTP Log] Retrying sending email to ${to} (Attempt ${sendAttempt})...`);
    }
  }
}

/**
 * ─── HTML EMAIL TEMPLATE GENERATORS ───
 */

function getBookingConfirmationTemplate({ customerName, bookingId, deviceName, quantity, startDate, endDate, location, totalAmount, status, companyName, logoUrl, supportEmail, supportPhone }) {
  const logo = logoUrl || 'https://via.placeholder.com/150x40?text=One+Point+Solutions';
  const company = companyName || 'One Point Solutions';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 30px; text-align: center; }
        .header img { max-height: 40px; margin-bottom: 12px; }
        .header h1 { color: #38bdf8; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .content { padding: 30px; }
        .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0; }
        .intro { font-size: 13px; color: #64748b; line-height: 1.6; }
        .grid-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .grid-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .grid-table tr:last-child td { border-bottom: none; }
        .label { font-weight: 700; color: #475569; width: 40%; text-transform: uppercase; font-size: 10px; }
        .value { color: #0f172a; font-weight: 600; }
        .price-badge { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 4px 8px; border-radius: 6px; font-weight: 700; }
        .status-badge { background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; padding: 4px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase; font-size: 11px; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 4px 0; font-size: 11px; color: #64748b; }
        .support-link { color: #0284c7; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <img src="${logo}" alt="${company}">
          <h1>Booking Confirmed ✓</h1>
        </div>
        <div class="content">
          <p class="greeting">Hello ${customerName},</p>
          <p class="intro">Great news! Your electronics rental booking has been confirmed by <strong>${company}</strong>. Below are your booking details:</p>
          <table class="grid-table">
            <tr>
              <td class="label">Booking ID</td>
              <td class="value">#${String(bookingId).padStart(5, '0')}</td>
            </tr>
            <tr>
              <td class="label">Device Name</td>
              <td class="value">${deviceName}</td>
            </tr>
            <tr>
              <td class="label">Quantity</td>
              <td class="value">${quantity || 1} unit(s)</td>
            </tr>
            <tr>
              <td class="label">Pickup Date</td>
              <td class="value">${startDate}</td>
            </tr>
            <tr>
              <td class="label">Return Date</td>
              <td class="value">${endDate}</td>
            </tr>
            <tr>
              <td class="label">Pickup Location</td>
              <td class="value">${location}</td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value"><span class="price-badge">₹${totalAmount}</span></td>
            </tr>
            <tr>
              <td class="label">Booking Status</td>
              <td class="value"><span class="status-badge">${status}</span></td>
            </tr>
          </table>
          <p class="intro">Please bring a valid ID at the time of pickup. For any queries, contact our support team.</p>
        </div>
        <div class="footer">
          <p>Company: <strong>${company}</strong></p>
          <p>Support Email: <a href="mailto:${supportEmail}" class="support-link">${supportEmail}</a> | Phone: ${supportPhone}</p>
          <p style="margin-top: 12px; font-size: 10px;">&copy; ${new Date().getFullYear()} ${company}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPaymentSuccessTemplate({ customerName, transactionId, bookingId, deviceName, amountPaid, paymentDate, paymentMethod, logoUrl, supportEmail }) {
  const logo = logoUrl || 'https://via.placeholder.com/150x40?text=One+Point+Solutions';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 30px; text-align: center; }
        .header img { max-height: 40px; margin-bottom: 12px; }
        .header h1 { color: #34d399; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .content { padding: 30px; }
        .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0; }
        .intro { font-size: 13px; color: #64748b; line-height: 1.6; }
        .grid-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .grid-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .grid-table tr:last-child td { border-bottom: none; }
        .label { font-weight: 700; color: #475569; width: 40%; text-transform: uppercase; font-size: 10px; tracking-wider; }
        .value { color: #0f172a; font-weight: 600; }
        .amount-highlight { color: #059669; font-size: 18px; font-weight: 850; }
        .btn-wrapper { text-align: center; margin: 24px 0 10px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; tracking-wider; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2); }
        .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 4px 0; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <img src="${logo}" alt="One Point Solutions">
          <h1>Payment Successful</h1>
        </div>
        <div class="content">
          <p class="greeting">Hello ${customerName},</p>
          <p class="intro">We have received your payment. Here is your transaction ledger and invoice summary:</p>
          <table class="grid-table">
            <tr>
              <td class="label">Transaction ID</td>
              <td class="value">${transactionId}</td>
            </tr>
            <tr>
              <td class="label">Booking ID</td>
              <td class="value">#${String(bookingId).padStart(5, '0')}</td>
            </tr>
            <tr>
              <td class="label">Device Name</td>
              <td class="value">${deviceName}</td>
            </tr>
            <tr>
              <td class="label">Amount Paid</td>
              <td class="value"><span class="amount-highlight">₹${amountPaid}</span></td>
            </tr>
            <tr>
              <td class="label">Payment Date</td>
              <td class="value">${paymentDate}</td>
            </tr>
            <tr>
              <td class="label">Payment Method</td>
              <td class="value" style="text-transform: uppercase;">${paymentMethod}</td>
            </tr>
          </table>
          <div class="btn-wrapper">
            <a href="http://localhost:5174/admin/reports" class="btn" target="_blank">Download Invoice</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for doing business with us!</p>
          <p>Support: <a href="mailto:${supportEmail}" style="color: #059669; text-decoration: none; font-weight: 600;">${supportEmail}</a></p>
          <p style="margin-top: 12px; font-size: 10px;">&copy; ${new Date().getFullYear()} One Point Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getDeviceReturnedTemplate({ customerName, bookingId, deviceName, returnDate, rentalAmount, damageFee, securityDepositStatus, logoUrl, supportEmail }) {
  const logo = logoUrl || 'https://via.placeholder.com/150x40?text=One+Point+Solutions';
  const totalCharges = rentalAmount + damageFee;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Device Return Confirmed</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4c1d95 0%, #2e1065 100%); padding: 30px; text-align: center; }
        .header img { max-height: 40px; margin-bottom: 12px; }
        .header h1 { color: #ddd6fe; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .content { padding: 30px; }
        .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0; }
        .intro { font-size: 13px; color: #64748b; line-height: 1.6; }
        .grid-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .grid-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .grid-table tr:last-child td { border-bottom: none; }
        .label { font-weight: 700; color: #475569; width: 40%; text-transform: uppercase; font-size: 10px; tracking-wider; }
        .value { color: #0f172a; font-weight: 600; }
        .highlight { color: #6d28d9; font-weight: 700; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 4px 0; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <img src="${logo}" alt="One Point Solutions">
          <h1>Return Confirmation</h1>
        </div>
        <div class="content">
          <p class="greeting">Hello ${customerName},</p>
          <p class="intro">We confirm that the rented device has been successfully returned. Here is the return summary:</p>
          <table class="grid-table">
            <tr>
              <td class="label">Booking ID</td>
              <td class="value">#${String(bookingId).padStart(5, '0')}</td>
            </tr>
            <tr>
              <td class="label">Device Name</td>
              <td class="value">${deviceName}</td>
            </tr>
            <tr>
              <td class="label">Return Date</td>
              <td class="value">${returnDate}</td>
            </tr>
            <tr>
              <td class="label">Final Charges</td>
              <td class="value"><span class="highlight">₹${totalCharges}</span> ${damageFee > 0 ? `(includes ₹${damageFee} Damage Fee)` : ''}</td>
            </tr>
            <tr>
              <td class="label">Deposit Status</td>
              <td class="value" style="color: #6d28d9;">${securityDepositStatus}</td>
            </tr>
          </table>
          <p class="intro" style="margin-top: 20px; text-align: center; font-style: italic; font-weight: 600;">Thank you for renting with One Point Solutions! We hope to see you again soon.</p>
        </div>
        <div class="footer">
          <p>Support Contact: <a href="mailto:${supportEmail}" style="color: #6d28d9; text-decoration: none; font-weight: 600;">${supportEmail}</a></p>
          <p style="margin-top: 12px; font-size: 10px;">&copy; ${new Date().getFullYear()} One Point Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}


/**
 * ─── NOTIFICATION DISPATCH METHODS ───
 */

async function sendBookingConfirmEmail(booking, customer, device, settings) {
  const email = customer.email;
  const companyName = settings.company_name || 'One Point Solutions';
  const companyLogo = settings.company_logo;
  const supportEmail = settings.company_support_email || 'onepointsolutions16@gmail.com';
  const supportPhone = settings.company_phone || '+91 98765 43210';
  const location = settings.company_address || 'Please contact us for pickup location';

  console.log(`[SMTP Log] Booking Confirm → Customer: ${customer.name} | Email: ${email} | Device: ${device.name} | Qty: ${booking.quantity || 1}`);

  const html = getBookingConfirmationTemplate({
    customerName: customer.name,
    bookingId: booking.id,
    deviceName: `${device.brand} ${device.name}`,
    quantity: booking.quantity || 1,
    startDate: booking.bookingDate || booking.start_date,
    endDate: booking.returnDate || booking.end_date,
    location,
    totalAmount: booking.rental_amount,
    status: 'Confirmed',
    companyName,
    logoUrl: companyLogo,
    supportEmail,
    supportPhone
  });

  return await sendEmailWithRetry({
    to: email,
    subject: 'Booking Confirmed',
    htmlContent: html,
    customerName: customer.name,
    type: 'Rental Confirmation'
  });
}

async function sendPaymentSuccessEmail(booking, customer, device, payment, settings) {
  const email = customer.email;
  const companyLogo = settings.company_logo;
  const supportEmail = settings.company_support_email || 'onepointsolutions16@gmail.com';
  const txnId = payment.notes && payment.notes.includes('TXN-') 
    ? payment.notes.match(/TXN-\w+-\w+/)?.[0] || `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    : `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log(`[SMTP Log] Payment Success → Customer: ${customer.name} | Email: ${email} | Txn: ${txnId}`);

  const html = getPaymentSuccessTemplate({
    customerName: customer.name,
    transactionId: txnId,
    bookingId: booking.id,
    deviceName: `${device.brand} ${device.name}`,
    amountPaid: payment.amount,
    paymentDate: new Date(payment.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    paymentMethod: booking.payment_method || 'UPI',
    logoUrl: companyLogo,
    supportEmail
  });

  return await sendEmailWithRetry({
    to: email,
    subject: 'Payment Successful',
    htmlContent: html,
    customerName: customer.name,
    type: 'Payment Success'
  });
}

async function sendDeviceReturnedEmail(booking, customer, device, settings) {
  const email = customer.email;
  const companyLogo = settings.company_logo;
  const supportEmail = settings.company_support_email || 'onepointsolutions16@gmail.com';
  
  // Calculate security deposit status message
  const deposit = booking.deposit_amount || 0;
  const damageFee = booking.damage_fee || 0;
  let depositStatus = '';
  if (damageFee === 0) {
    depositStatus = `Fully Refunded (₹${deposit})`;
  } else if (damageFee >= deposit) {
    depositStatus = `Forfeited (₹${deposit} deposit applied to ₹${damageFee} damage fee)`;
  } else {
    depositStatus = `Partially Refunded (₹${deposit - damageFee} returned after deducting ₹${damageFee} damage fee)`;
  }

  console.log(`[SMTP Log] Device Return → Customer: ${customer.name} | Email: ${email} | Device: ${device.name}`);

  const html = getDeviceReturnedTemplate({
    customerName: customer.name,
    bookingId: booking.id,
    deviceName: `${device.brand} ${device.name}`,
    returnDate: booking.actual_return_date || new Date().toISOString().split('T')[0],
    rentalAmount: booking.rental_amount,
    damageFee,
    securityDepositStatus: depositStatus,
    logoUrl: companyLogo,
    supportEmail
  });

  return await sendEmailWithRetry({
    to: email,
    subject: 'Device Returned Successfully',
    htmlContent: html,
    customerName: customer.name,
    type: 'Return Confirmation'
  });
}

/**
 * Compatibility hooks mapping original triggers to new SMTP mailers and Twilio mock SMS
 */

async function triggerRentalCreatedNotifications(booking, customer, device, companyName) {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || { company_name: companyName };

  // Send SMTP Confirm Email
  await sendBookingConfirmEmail(booking, customer, device, settings);

  // Send Mock WhatsApp
  const whatsappBody = `Rental Confirmation from ${companyName}. Device: ${device.name}. Total: ₹${booking.rental_amount}. Deposit: ₹${booking.deposit_amount}. Return Date: ${booking.end_date}.`;
  await sendWhatsAppSMS({
    customerName: customer.name,
    phone: customer.phone,
    messageBody: whatsappBody,
    type: 'Rental Confirmation',
    channel: 'WhatsApp'
  });
}

async function triggerRentalReturnedNotifications(booking, customer, device, companyName) {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || { company_name: companyName };

  // Send SMTP Return Email
  await sendDeviceReturnedEmail(booking, customer, device, settings);

  // Send Mock WhatsApp
  const whatsappBody = `Rental Return Confirmed for ${device.name}. Thank you for renting with ${companyName}!`;
  await sendWhatsAppSMS({
    customerName: customer.name,
    phone: customer.phone,
    messageBody: whatsappBody,
    type: 'Return Confirmation',
    channel: 'WhatsApp'
  });
}

async function triggerRentalExtendedNotifications(booking, customer, device, companyName) {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || { company_name: companyName };
  
  // Extension Email
  const html = `
    <h3>Rental Extended</h3>
    <p>Hi ${customer.name}, your rental of ${device.brand} ${device.name} (Booking #${booking.id}) has been extended to ${booking.end_date}.</p>
    <p>New Total Amount: ₹${booking.rental_amount}</p>
  `;
  await sendEmailWithRetry({
    to: customer.email,
    subject: `Rental Extended - Invoice #${String(booking.id).padStart(5, '0')}`,
    htmlContent: html,
    customerName: customer.name,
    type: 'Rental Extended'
  });

  const whatsappBody = `Your rental for ${device.name} has been extended to ${booking.end_date}. New total: ₹${booking.rental_amount}.`;
  await sendWhatsAppSMS({
    customerName: customer.name,
    phone: customer.phone,
    messageBody: whatsappBody,
    type: 'Rental Extended',
    channel: 'WhatsApp'
  });
}

async function triggerReminderNotification(booking, customer, device, companyName, isOverdue = false) {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || { company_name: companyName };
  
  const type = isOverdue ? 'Overdue Reminder' : '24-hour Return Reminder';
  const subject = isOverdue ? `⚠️ OVERDUE RENTAL: Booking #${booking.id}` : `Return Reminder: Booking #${booking.id}`;
  
  const html = `
    <h3>${type}</h3>
    <p>Hi ${customer.name}, this is a reminder regarding your rental of ${device.brand} ${device.name} (Booking #${booking.id}).</p>
    <p>Due Date: ${booking.end_date}</p>
    ${isOverdue ? '<p style="color:red;font-weight:bold;">Please return the device immediately. Late fees are accumulating.</p>' : '<p>Please prepare the device for return tomorrow.</p>'}
  `;
  
  await sendEmailWithRetry({
    to: customer.email,
    subject,
    htmlContent: html,
    customerName: customer.name,
    type
  });

  const whatsappBody = isOverdue
    ? `⚠️ OVERDUE REMINDER: Your rental for ${device.name} was due on ${booking.end_date}. Please return it immediately. Late fees may apply.`
    : `Friendly Reminder: Your rental for ${device.name} is due tomorrow, ${booking.end_date}. Please prepare the device for return.`;

  await sendWhatsAppSMS({
    customerName: customer.name,
    phone: customer.phone,
    messageBody: whatsappBody,
    type,
    channel: 'WhatsApp'
  });
}

async function sendWhatsAppSMS({ customerName, phone, messageBody, type, channel }) {
  try {
    console.log(`[WhatsApp SMS Mock] sending to ${phone}: ${messageBody}`);
    logNotification({
      customer_name: customerName,
      phone,
      email: '',
      type,
      channel,
      status: 'Sent',
      message_preview: messageBody
    });
    return { success: true };
  } catch (err) {
    console.error('Error logging WhatsApp mock:', err.message);
    return { success: false, error: err.message };
  }
}

// Kept for backward compatibility
async function sendEmailJS({ customerName, customerEmail, companyName, deviceName, rentalDate, returnDate, rentalAmount, depositAmount, type }) {
  console.log(`[Deprecated sendEmailJS Called] to ${customerEmail}`);
  return true;
}

module.exports = {
  getTransporter,
  triggerRentalCreatedNotifications,
  triggerRentalReturnedNotifications,
  triggerRentalExtendedNotifications,
  triggerReminderNotification,
  sendBookingConfirmEmail,
  sendPaymentSuccessEmail,
  sendDeviceReturnedEmail,
  sendWhatsAppSMS,
  sendEmailJS
};