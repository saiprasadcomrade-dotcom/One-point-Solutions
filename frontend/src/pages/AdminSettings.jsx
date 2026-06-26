import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Settings, Building, ShieldAlert, Key, MessageSquare, 
  Database, RefreshCw, Mail, Phone, Lock, Save, Zap, AlertCircle, CheckCircle2, Send, ExternalLink
} from 'lucide-react';

const AdminSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    company_name: 'One Point Solutions',
    company_logo: '',
    company_email: 'onepointsolutions16@gmail.com',
    company_phone: '+91 98765 43210',
    company_address: '123 Tech Park, Bangalore, India',
    company_website: 'www.onepointsolutions.com',
    company_support_email: 'support@onepointsolutions.com',
    company_whatsapp: '+91 98765 43210',
    
    // Gateway configs
    whatsapp_provider: 'Meta',
    whatsapp_access_token: '',
    whatsapp_phone_number_id: '',
    twilio_sid: '',
    twilio_auth_token: '',
    sms_api_key: '',
    sender_id: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setCompanyForm(prev => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (err) {
      showToast('Failed to load settings configuration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', companyForm);
      showToast('Company configurations saved successfully!', 'success');
      fetchSettings();
    } catch (err) {
      showToast('Failed to update company settings.', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'warning');
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast('Admin password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update password.', 'error');
    }
  };

  // Backups
  const handleBackupDB = async () => {
    try {
      await api.post('/backup');
      showToast('Database backup created successfully! (rental.db.bak)', 'success');
    } catch (err) {
      showToast('Backup creation failed.', 'error');
    }
  };

  const handleRestoreDB = async () => {
    if (!window.confirm('WARNING: Restore database from rental.db.bak? Current transactions will be overwritten.')) return;
    try {
      await api.post('/restore-backup');
      showToast('Database restored successfully from backup!', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showToast(err.response?.data?.error || 'Restore failed.', 'error');
    }
  };

  // SMTP Test state
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null); // { success, message, fix, diagnostics, error }

  const handleSmtpTest = async (e) => {
    e.preventDefault();
    if (!smtpTestEmail) {
      showToast('Please enter a recipient email to test.', 'warning');
      return;
    }
    setSmtpTesting(true);
    setSmtpResult(null);
    try {
      const res = await api.post('/test-email', { email: smtpTestEmail });
      setSmtpResult({ success: true, ...res.data });
      showToast('✅ SMTP test passed! Email sent successfully.', 'success');
    } catch (err) {
      const data = err.response?.data || {};
      setSmtpResult({ success: false, ...data });
      showToast('❌ SMTP test failed. Check diagnostics below.', 'error');
    } finally {
      setSmtpTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest">Loading Settings Panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-700 animate-fade-in pb-16">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium font-sans">Manage company metadata, edit admin accounts, toggle gateways, and execute database backups.</p>
      </div>

      {/* ─── SMTP EMAIL DIAGNOSTICS CARD ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
            <Mail size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">SMTP Email Diagnostics</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Verify your Gmail SMTP credentials and test live email delivery</p>
          </div>
        </div>

        {/* Step-by-step App Password guide */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-800">Gmail requires a Google App Password — NOT your normal password</p>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                Your regular Gmail password is blocked by Google's SMTP security. You must generate a 16-character App Password:
              </p>
              <ol className="text-[11px] text-amber-700 mt-2 space-y-0.5 list-decimal list-inside">
                <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-bold">myaccount.google.com/security</a></li>
                <li>Enable <strong>2-Step Verification</strong></li>
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold">myaccount.google.com/apppasswords</a></li>
                <li>App name: <strong>ERBS Mailer</strong> → Click <strong>Create</strong></li>
                <li>Copy the 16-character password (e.g. <code className="bg-amber-100 px-1 rounded">abcdefghijklmnop</code>)</li>
                <li>Open <code className="bg-amber-100 px-1 rounded">backend/.env</code> → set <code className="bg-amber-100 px-1 rounded">EMAIL_PASS=abcdefghijklmnop</code> (no spaces)</li>
                <li>Restart backend: <code className="bg-amber-100 px-1 rounded">npm start</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Test form */}
        <form onSubmit={handleSmtpTest} className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Send Test Email To</label>
            <div className="relative">
              <input
                type="email"
                value={smtpTestEmail}
                onChange={(e) => setSmtpTestEmail(e.target.value)}
                placeholder="Enter any Gmail address to test delivery"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
              <Mail size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={smtpTesting}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:from-indigo-400 hover:to-violet-500 transition-all cursor-pointer shadow-md shadow-indigo-500/10 flex items-center gap-2 disabled:opacity-60 shrink-0"
          >
            {smtpTesting ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Testing...</>
            ) : (
              <><Send size={13} /> Send Test</>
            )}
          </button>
        </form>

        {/* Diagnostics result panel */}
        {smtpResult && (
          <div className={`mt-4 rounded-2xl border p-4 ${
            smtpResult.success
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {smtpResult.success
                ? <CheckCircle2 size={16} className="text-emerald-500" />
                : <AlertCircle size={16} className="text-red-500" />}
              <p className={`text-xs font-black ${smtpResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                {smtpResult.success ? '✅ SMTP Connected & Email Delivered!' : `❌ ${smtpResult.step_failed || 'SMTP Test Failed'}`}
              </p>
            </div>

            {/* Diagnostics table */}
            {smtpResult.diagnostics && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'EMAIL_USER', value: smtpResult.diagnostics.email_user_value, ok: smtpResult.diagnostics.email_user_defined },
                  { label: 'EMAIL_PASS set', value: smtpResult.diagnostics.email_pass_defined ? 'Yes' : 'No (placeholder)', ok: smtpResult.diagnostics.email_pass_defined },
                  { label: 'Is Placeholder?', value: smtpResult.diagnostics.email_pass_is_placeholder ? '⚠️ YES — needs real App Password' : '✓ No', ok: !smtpResult.diagnostics.email_pass_is_placeholder },
                  { label: 'App Password Format', value: smtpResult.diagnostics.email_pass_format_ok ? '✓ 16-char format ok' : '✗ Wrong format', ok: smtpResult.diagnostics.email_pass_format_ok },
                  { label: 'SMTP Host', value: smtpResult.diagnostics.smtp_host, ok: true },
                  { label: 'SMTP Port', value: smtpResult.diagnostics.smtp_port, ok: true },
                ].map((row, i) => (
                  <div key={i} className="bg-white/70 rounded-lg px-3 py-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</p>
                    <p className={`text-[11px] font-bold mt-0.5 ${row.ok ? 'text-slate-800' : 'text-red-600'}`}>{String(row.value)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Error message */}
            {smtpResult.error && (
              <div className="bg-white/60 rounded-xl p-3 mb-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SMTP Error</p>
                <p className="text-xs text-red-700 font-semibold break-words">{smtpResult.error}</p>
              </div>
            )}

            {/* Fix instructions */}
            {smtpResult.fix && (
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">How to Fix</p>
                <pre className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{smtpResult.fix}</pre>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <ExternalLink size={11} /> Open Google App Passwords →
                </a>
              </div>
            )}

            {smtpResult.success && (
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                All three email notifications (Booking Confirmed, Payment Successful, Device Returned) will now deliver automatically.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Company Settings Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building className="text-cyan-500" size={18} />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Company Specifications</h2>
          </div>

          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                <input
                  type="text"
                  value={companyForm.company_name}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company Email</label>
                <input
                  type="email"
                  value={companyForm.company_email}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</label>
                <input
                  type="text"
                  value={companyForm.company_phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Website URL</label>
                <input
                  type="text"
                  value={companyForm.company_website}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Support Email</label>
                <input
                  type="email"
                  value={companyForm.company_support_email}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_support_email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Operations Number</label>
                <input
                  type="text"
                  value={companyForm.company_whatsapp}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Company Logo URL</label>
              <input
                type="text"
                value={companyForm.company_logo}
                onChange={(e) => setCompanyForm({ ...companyForm, company_logo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Business Address</label>
              <input
                type="text"
                value={companyForm.company_address}
                onChange={(e) => setCompanyForm({ ...companyForm, company_address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 outline-none text-slate-800"
              />
            </div>

            {/* API gateway inputs */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-cyan-500" size={18} />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">WhatsApp & SMS Gateways (Future Ready)</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Maintain configuration values for future Twilio and Meta WhatsApp developer accounts. Warning banners will display on execution logs if they remain empty.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Provider</label>
                  <select
                    value={companyForm.whatsapp_provider}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsapp_provider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-700"
                  >
                    <option value="Meta">Meta Cloud API</option>
                    <option value="Twilio">Twilio Gateway</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Access Token</label>
                  <input
                    type="password"
                    value={companyForm.whatsapp_access_token}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsapp_access_token: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Phone ID</label>
                  <input
                    type="text"
                    value={companyForm.whatsapp_phone_number_id}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsapp_phone_number_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Twilio Account SID</label>
                  <input
                    type="text"
                    value={companyForm.twilio_sid}
                    onChange={(e) => setCompanyForm({ ...companyForm, twilio_sid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Twilio Auth Token</label>
                  <input
                    type="password"
                    value={companyForm.twilio_auth_token}
                    onChange={(e) => setCompanyForm({ ...companyForm, twilio_auth_token: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SMS API Gateway Key</label>
                  <input
                    type="password"
                    value={companyForm.sms_api_key}
                    onChange={(e) => setCompanyForm({ ...companyForm, sms_api_key: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 text-right">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 ml-auto"
              >
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Change Password & Backups */}
        <div className="space-y-8">
          
          {/* Change Password form */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Key className="text-cyan-500" size={18} />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Security Profile</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Database Backup & Restore */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Database className="text-cyan-500" size={18} />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Database Backups</h2>
            </div>
            
            <p className="text-[10px] text-slate-450 leading-normal">
              Execute real-time backups of the local SQLite database file `rental.db` or restore from a previously created snapshot.
            </p>

            <div className="space-y-3.5">
              <button
                onClick={handleBackupDB}
                className="w-full py-3 bg-cyan-55 border border-cyan-100 text-cyan-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-cyan-100/50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Database size={14} /> Create Snapshot Backup
              </button>
              
              <button
                onClick={handleRestoreDB}
                className="w-full py-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-100/50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} /> Restore Previous Snapshot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
