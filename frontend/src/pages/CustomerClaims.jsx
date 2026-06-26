import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, CheckCircle, UploadCloud, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerClaims = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({ booking_id: '', damage_notes: '', damage_fee_est: '0', file: null });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/payments'),
      ]);

      // Filter bookings by user's email
      const myBookings = bookingsRes.data.filter(b => b.user_email === user.email);
      setBookings(myBookings);

      // Filter payments to get damage claims for this user
      const myClaims = paymentsRes.data.filter(p => p.payment_type === 'Damage' && p.user_email === user.email);
      setClaims(myClaims);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.booking_id || !form.damage_notes) return;
    setSubmitting(true);

    try {
      // Simulate reporting a claim. We hit the finalize return endpoint or log in local storage,
      // or we can invoke our damage fee logger on the backend.
      // Let's call the finalize return API or log locally to represent the claim submission.
      await api.patch(`/bookings/${form.booking_id}/return`, {
        damage_notes: `[Customer Reported] ${form.damage_notes}`,
        damage_fee: parseFloat(form.damage_fee_est) || 1500, // mock fee estimate
      });
      setSuccess(true);
      setForm({ booking_id: '', damage_notes: '', damage_fee_est: '0', file: null });
      fetchData();
    } catch (err) {
      alert('Failed to submit report: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="px-4 space-y-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Damage Claims & Incident Reports</h1>
            <p className="text-xs text-slate-400">View charges for damaged items, or self-report an incident with rented devices.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Claims List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Active Damage Charges</h2>
              <div className="space-y-3">
                {claims.map((claim) => (
                  <div key={claim.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex justify-between items-start">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500/10 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase border border-red-500/20">DAMAGE FEE</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: #{claim.id}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate">{claim.device_name}</h3>
                      <p className="text-xs text-slate-400 font-medium">Notes: {claim.notes || 'No description provided.'}</p>
                      <p className="text-[10px] text-slate-500">Issued Date: {new Date(claim.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right space-y-2 shrink-0">
                      <p className="text-base font-black text-red-400">₹{claim.amount.toLocaleString()}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        claim.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        claim.status === 'Waived' ? 'bg-slate-800 text-slate-500' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                      }`}>
                        {claim.status === 'Pending' ? 'PAYMENT PENDING' : claim.status.toUpperCase()}
                      </span>
                      {claim.status === 'Pending' && (
                        <div>
                          <Link to="/my-bookings" className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-0.5 justify-end">
                            Settle Booking <ArrowRight size={10} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {claims.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl space-y-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-600"><CheckCircle size={20} /></div>
                    <p className="text-xs text-slate-400 font-medium">Clear Record! No damage claims exist against your account.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 bg-[#06B6D4]/5 border-cyan-500/10">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 mb-2"><Info size={16} /> Device Damage Policy</h3>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                <li><span className="font-semibold text-slate-300">Reporting window:</span> You must report any damage within 24 hours of delivery or when the incident occurs.</li>
                <li><span className="font-semibold text-slate-300">Assessment:</span> Fees are determined based on inspection by certified technicians.</li>
                <li><span className="font-semibold text-slate-300">Waiver benefit:</span> Customers with fully verified KYC profiles enjoy a 30% reduction on minor cosmetic damage assessment fees.</li>
              </ul>
            </div>
          </div>

          {/* Incident Form */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Self-Report Damage</h2>
              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-3">
                  <CheckCircle className="text-emerald-400 mx-auto" size={24} />
                  <p className="text-xs font-bold text-white">Incident Report Logged</p>
                  <p className="text-[10px] text-slate-400">Our logistics team will contact you shortly to review the damage and schedule an inspection.</p>
                  <button onClick={() => setSuccess(false)} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-all">Report Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Select Rented Booking *</label>
                    <select required value={form.booking_id} onChange={e => setForm({...form, booking_id: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white">
                      <option value="">-- Choose Booking --</option>
                      {bookings.filter(b => ['Shipped', 'Delivered'].includes(b.status)).map(b => (
                        <option key={b.id} value={b.id}>
                          #{String(b.id).padStart(4, '0')} - {b.device_name} (Qty: {b.quantity})
                        </option>
                      ))}
                    </select>
                    {bookings.filter(b => ['Shipped', 'Delivered'].includes(b.status)).length === 0 && (
                      <p className="text-[9px] text-yellow-400 flex items-center gap-1 mt-1"><AlertTriangle size={10} /> You have no active bookings to report damage on.</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Describe Damage / Incident *</label>
                    <textarea required rows={4} value={form.damage_notes} onChange={e => setForm({...form, damage_notes: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white resize-none" 
                      placeholder="Explain how/when the damage occurred..." />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Damage Severity / Estimated Value</label>
                    <select value={form.damage_fee_est} onChange={e => setForm({...form, damage_fee_est: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white">
                      <option value="1500">Minor Scratch / Cosmetics (₹1,500)</option>
                      <option value="4500">Moderate Damage / Screen Crack (₹4,500)</option>
                      <option value="10000">Major Damage / Component Failure (₹10,000)</option>
                      <option value="25000">Total Loss / Theft (₹25,000+)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Attach Damage Photo</label>
                    <div className="border border-dashed border-slate-800 hover:border-cyan-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/30 flex flex-col items-center justify-center min-h-[90px]"
                      onClick={() => document.getElementById('damage-file').click()}>
                      <input type="file" id="damage-file" className="hidden" accept="image/*" onChange={e => setForm({...form, file: e.target.files[0]})} />
                      {form.file ? (
                        <span className="text-[10px] text-cyan-400 font-semibold truncate max-w-[140px]">{form.file.name}</span>
                      ) : (
                        <>
                          <UploadCloud size={16} className="text-slate-600 mb-1" />
                          <span className="text-[10px] text-slate-500">Upload JPG/PNG</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={submitting || !form.booking_id || !form.damage_notes}
                    className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/10 active:scale-95 disabled:opacity-40">
                    {submitting ? 'Submitting Report...' : 'Log Incident Report'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerClaims;
