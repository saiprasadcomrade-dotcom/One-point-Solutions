import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  FileText, Download, Printer, Box, Users, 
  Calendar, AlertTriangle, Bell, Trash2, DollarSign
} from 'lucide-react';

const AdminReports = () => {
  const { showToast } = useToast();

  const [companySettings, setCompanySettings] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Raw data arrays for exports
  const [devices, setDevices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [damages, setDamages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [settingsRes, summaryRes, devicesRes, customersRes, rentalsRes, damagesRes, notificationsRes] = await Promise.all([
          api.get('/settings'),
          api.get('/reports/summary'),
          api.get('/devices'),
          api.get('/customers'),
          api.get('/rentals'),
          api.get('/damage-reports'),
          api.get('/notifications')
        ]);

        setCompanySettings(settingsRes.data);
        setSummary(summaryRes.data);
        setDevices(devicesRes.data);
        setCustomers(customersRes.data);
        setRentals(rentalsRes.data);
        setDamages(damagesRes.data);
        setNotifications(notificationsRes.data);
      } catch (err) {
        showToast('Failed to compile reporting data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [showToast]);

  const handleExportCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    switch (type) {
      case 'inventory':
        headers = ['ID', 'Device Name', 'Category', 'Brand', 'Model', 'Serial', 'Condition', 'Status', 'Price/Day', 'Deposit'];
        rows = devices.map(d => [d.id, `"${d.name}"`, d.category, d.brand, d.model, d.serial_number, d.condition, d.status, d.rental_price, d.deposit_amount]);
        filename = 'inventory_report.csv';
        break;
      case 'customers':
        headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'ID Proof', 'ID Number', 'Notes'];
        rows = customers.map(c => [c.id, `"${c.name}"`, c.email, c.phone, `"${c.address || ''}"`, c.id_proof || '', c.gov_id_number || '', `"${c.notes || ''}"`]);
        filename = 'customer_report.csv';
        break;
      case 'rentals':
        headers = ['Rental ID', 'Customer', 'Device', 'Serial', 'Start Date', 'Return Date', 'Amount', 'Deposit', 'Status', 'Payment'];
        rows = rentals.map(r => [r.id, `"${r.customer_name}"`, `"${r.device_name}"`, r.device_serial, r.start_date, r.end_date, r.rental_amount, r.deposit_amount, r.status, r.payment_status]);
        filename = 'rentals_report.csv';
        break;
      case 'damages':
        headers = ['Case ID', 'Device', 'Serial', 'Customer', 'Description', 'Severity', 'Cost', 'Status'];
        rows = damages.map(d => [d.id, `"${d.device_name}"`, d.device_serial, `"${d.customer_name}"`, `"${d.description}"`, d.severity, d.repair_cost, d.status]);
        filename = 'damage_report.csv';
        break;
      case 'notifications':
        headers = ['ID', 'Customer', 'Email', 'Phone', 'Alert Type', 'Channel', 'Status', 'Timestamp'];
        rows = notifications.map(n => [n.id, `"${n.customer_name}"`, n.email, n.phone, n.type, n.channel, n.status, n.created_at]);
        filename = 'notification_history.csv';
        break;
      default:
        showToast('Unknown report category.', 'error');
        return;
    }

    if (rows.length === 0) {
      showToast('No records found to export.', 'warning');
      return;
    }

    const companyName = companySettings?.company_name || 'One Point Solutions';
    const csvHeader = `"${companyName} - Report Category: ${type.toUpperCase()}"\n\n`;

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + encodeURIComponent(csvHeader + [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));

    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log report export event via endpoint (already tracked dynamically or logged here)
    showToast(`${type.toUpperCase()} Report downloaded successfully!`, 'success');
  };

  const handlePrintReport = (type) => {
    // Generate simple high-fidelity print layout window dynamically
    const printWindow = window.open('', '_blank');
    const companyName = companySettings?.company_name || 'One Point Solutions';
    const companyEmail = companySettings?.company_email || 'onepointsolutions16@gmail.com';
    const companyPhone = companySettings?.company_phone || '+91 98765 43210';
    const companyLogo = companySettings?.company_logo || '';

    let contentHtml = '';
    
    if (type === 'inventory') {
      contentHtml = `
        <h2>Inventory Report</h2>
        <table>
          <thead>
            <tr><th>Device Name</th><th>Category</th><th>Serial</th><th>Condition</th><th>Status</th><th>Price/Day</th></tr>
          </thead>
          <tbody>
            ${devices.map(d => `<tr><td>${d.name}</td><td>${d.category}</td><td>${d.serial_number}</td><td>${d.condition}</td><td>${d.status}</td><td>₹${d.rental_price}</td></tr>`).join('')}
          </tbody>
        </table>`;
    } else if (type === 'revenue') {
      contentHtml = `
        <h2>Revenue Invoices Report</h2>
        <table>
          <thead>
            <tr><th>Rental ID</th><th>Customer</th><th>Device</th><th>Rental Amount</th><th>Deposit</th><th>Payment Status</th></tr>
          </thead>
          <tbody>
            ${rentals.map(r => `<tr><td>#${String(r.id).padStart(5, '0')}</td><td>${r.customer_name}</td><td>${r.device_name}</td><td>₹${r.rental_amount}</td><td>₹${r.deposit_amount}</td><td>${r.payment_status}</td></tr>`).join('')}
          </tbody>
        </table>`;
    } else if (type === 'damages') {
      contentHtml = `
        <h2>Damage Incident Logs</h2>
        <table>
          <thead>
            <tr><th>Case ID</th><th>Device</th><th>Customer</th><th>Severity</th><th>Repair Cost</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${damages.map(d => `<tr><td>#${String(d.id).padStart(4, '0')}</td><td>${d.device_name}</td><td>${d.customer_name}</td><td>${d.severity}</td><td>₹${d.repair_cost}</td><td>${d.status}</td></tr>`).join('')}
          </tbody>
        </table>`;
    } else {
      contentHtml = `
        <h2>Customer Index Report</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>ID Verification</th></tr>
          </thead>
          <tbody>
            ${customers.map(c => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.id_proof}: ${c.gov_id_number}</td></tr>`).join('')}
          </tbody>
        </table>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${companyName} - Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .company { font-weight: bold; }
            .logo { height: 40px; max-width: 150px; object-fit: contain; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
            h2 { color: #0284c7; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">${companyName}</div>
              <div style="font-size: 11px; color: #777;">${companyEmail} | ${companyPhone}</div>
            </div>
            ${companyLogo ? `<img src="${companyLogo}" class="logo" />` : ''}
          </div>
          ${contentHtml}
          <div style="margin-top: 40px; font-size: 10px; color: #aaa; text-align: center;">Report generated automatically by ERBS Admin Panel.</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast('PDF print queue started.', 'success');
  };

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest">Compiling Analytics Data...</p>
      </div>
    );
  }

  const reportsCategories = [
    { type: 'inventory', title: 'Inventory Fleet Report', desc: 'Detailed listing of active hardware, serial numbers, purchase dates, conditions, and catalog pricing.', icon: Box, color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
    { type: 'customers', title: 'Customer Index Report', desc: 'Spreadsheet list of all active verified customer profiles, contact numbers, emails, and KYC documentation.', icon: Users, color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { type: 'rentals', title: 'Rentals Booking Ledger', desc: 'Historical ledger of booked lease terms, client schedules, pricing, deposits, and delivery channels.', icon: Calendar, color: 'text-violet-500 bg-violet-50 border-violet-100' },
    { type: 'damages', title: 'Damage Diagnostics Log', desc: 'Case observations, device severities, resolution actions, repair fees, and historical incident logs.', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 border-rose-100' },
    { type: 'notifications', title: 'Notification Deliveries', desc: 'Historical logs of EmailJS deliveries, WhatsApp notification payloads, and SMS delivery reports.', icon: Bell, color: 'text-amber-500 bg-amber-50 border-amber-100' }
  ];

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Reports & Data Exports</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">Generate spreadsheet reports (CSV) and printable invoice lists (PDF) with dynamic business settings.</p>
      </div>

      {/* Grid listing options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsCategories.map((rep) => (
          <div 
            key={rep.type} 
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${rep.color} mb-4`}>
                <rep.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{rep.title}</h3>
              <p className="text-xs text-slate-450 mt-2 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50 mt-6">
              <button
                onClick={() => handleExportCSV(rep.type)}
                className="py-2.5 bg-slate-900 hover:bg-slate-950 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <Download size={12} /> Excel CSV
              </button>
              <button
                onClick={() => handlePrintReport(rep.type)}
                className="py-2.5 bg-cyan-55 text-cyan-600 border border-cyan-100 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-cyan-100/50 flex items-center justify-center gap-1"
              >
                <Printer size={12} /> Print PDF
              </button>
            </div>
          </div>
        ))}

        {/* Dynamic Financial PDF invoice report card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mb-4">
              <DollarSign size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Revenue Audit Report</h3>
            <p className="text-xs text-slate-450 mt-2 leading-relaxed">Financial summary of all rental incomes, damage billings, UPI transactions, cash flows, and balance sheets.</p>
          </div>

          <div className="pt-6 border-t border-slate-50 mt-6 flex justify-between items-center">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Paid Revenue</p>
              <p className="text-sm font-black text-emerald-600 leading-none mt-1">₹{(summary.revenue.paid).toLocaleString()}</p>
            </div>
            <button
              onClick={() => handlePrintReport('revenue')}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              Generate Invoice Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
