import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, ShieldAlert, CheckCircle, AlertTriangle, DollarSign, FileText, Clock, ArrowRight } from 'lucide-react';

const ReturnProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [damageFee, setDamageFee] = useState(0);
  const [hasDamage, setHasDamage] = useState(false);
  const [returnResult, setReturnResult] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch(`/bookings/${id}/return`, {
        damage_notes: hasDamage ? damageNotes : 'Returned in good condition',
        damage_fee: hasDamage ? parseFloat(damageFee) : 0
      });
      setReturnResult(res.data);
    } catch {
      alert('Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
      <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">Loading return data...</p>
    </div>
  );

  if (!booking) return (
    <div className="text-center p-12">
      <p className="text-slate-400 font-medium">Booking not found.</p>
      <Link to="/admin" className="text-cyan-400 font-medium mt-3 inline-block hover:underline">Back to Dashboard</Link>
    </div>
  );

  if (returnResult) {
    return (
      <div className="max-w-lg mx-auto mt-10 px-4">
        <div className="glass-card rounded-[2rem] border-slate-800 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
            <CheckCircle className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Return Finalized</h2>
          <p className="text-sm text-slate-400 mb-5">{booking.device_name} has been successfully processed.</p>
          {hasDamage && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-5 inline-flex items-center gap-3">
              <DollarSign className="text-yellow-400 shrink-0" size={20} />
              <div className="text-left">
                <p className="text-xs font-medium text-yellow-400">Damage Claim Raised</p>
                <p className="text-lg font-bold text-yellow-400">₹{parseFloat(damageFee).toLocaleString()}</p>
              </div>
            </div>
          )}
          <Link to="/admin" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/10">
            Back to Dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
        <ArrowLeft size={13} /> Back to Dashboard
      </Link>

      <div className="glass-card rounded-[2rem] border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-850">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Post-Rental Assessment</h1>
              <p className="text-xs text-slate-400 mt-0.5">Order #{booking.id.toString().padStart(5, '0')} &middot; {booking.device_name}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button type="button" onClick={() => setHasDamage(false)}
                className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  !hasDamage 
                    ? 'border-emerald-500/40 bg-emerald-500/10' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  !hasDamage ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500'
                }`}>
                  <CheckCircle size={22} />
                </div>
                <p className={`font-bold text-xs uppercase tracking-wider ${!hasDamage ? 'text-emerald-400' : 'text-slate-400'}`}>Pristine Return</p>
                <p className="text-[10px] text-slate-500">No visible damage.</p>
              </button>
              <button type="button" onClick={() => setHasDamage(true)}
                className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  hasDamage 
                    ? 'border-red-500/40 bg-red-500/10' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  hasDamage ? 'bg-red-500 text-white' : 'bg-slate-900 text-slate-500'
                }`}>
                  <AlertTriangle size={22} />
                </div>
                <p className={`font-bold text-xs uppercase tracking-wider ${hasDamage ? 'text-red-400' : 'text-slate-400'}`}>Damage Detected</p>
                <p className="text-[10px] text-slate-500">Requires repair fee.</p>
              </button>
            </div>

            {hasDamage && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Damage Description</label>
                  <textarea required={hasDamage}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white min-h-[80px] resize-none"
                    placeholder="Describe the condition of the asset..."
                    value={damageNotes} onChange={(e) => setDamageNotes(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penalty / Cleaning Fee (₹)</label>
                  <input type="number" required={hasDamage} min="0"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white"
                    placeholder="0" value={damageFee} onChange={(e) => setDamageFee(e.target.value)} />
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-500" />
                <span className="text-xs text-slate-400">{booking.start_date} to {booking.end_date}</span>
              </div>
              <button type="submit" disabled={submitting}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                  hasDamage
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? 'Processing...' : 'Finalize Return'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnProcess;
