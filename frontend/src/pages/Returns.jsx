import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle, Truck, Package, Clock, ShieldAlert } from 'lucide-react';

const Returns = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingId, setSchedulingId] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00 AM - 1:00 PM');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActiveRentals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get('/bookings');
      // Active rentals are 'Approved', 'Shipped' or 'Delivered'
      const active = response.data.filter(
        b => b.user_email === user.email && ['Approved', 'Shipped', 'Delivered'].includes(b.status)
      );
      setRentals(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActiveRentals();
  }, [fetchActiveRentals]);

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!schedulingId || !pickupDate) return;
    setSubmitting(true);

    try {
      // Finalize the return by hitting the backend endpoint
      // This will restore device availability and log return status
      await api.patch(`/bookings/${schedulingId}/return`, {
        damage_notes: comments || 'Returned in excellent condition.',
        damage_fee: 0,
      });

      setSchedulingId(null);
      setPickupDate('');
      setComments('');
      fetchActiveRentals();
    } catch (err) {
      alert('Return failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && rentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="px-4 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Return Management</h1>
            <p className="text-xs text-slate-400">Manage active electronics rentals in your possession and schedule returns.</p>
          </div>
        </div>

        {rentals.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500"><Truck size={24} /></div>
            <div>
              <h2 className="text-base font-bold text-white">No Active Rentals</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">You do not have any devices marked as Shipped or in your possession currently.</p>
            </div>
            <div>
              <a href="/devices" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-wider transition-all">Rent Devices Now</a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {rentals.map((rental) => (
                <div key={rental.id} className="glass-card rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-1.5 ${
                        rental.status === 'Shipped' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' :
                        rental.status === 'Delivered' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                      }`}>
                        {rental.status === 'Shipped' ? 'IN POSSESSION' : rental.status === 'Delivered' ? 'DELIVERED' : 'APPROVED'}
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">{rental.device_name}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Booking Order: #{String(rental.id).padStart(4, '0')} • Quantity: {rental.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-200">Total Charged</p>
                      <p className="text-base font-black text-cyan-400">₹{rental.total_price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-slate-800/80 py-3 text-xs">
                    <div>
                      <p className="text-slate-500 font-semibold uppercase text-[9px]">Rental Period</p>
                      <p className="text-slate-300 font-medium mt-0.5">{new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold uppercase text-[9px]">Delivery Mode</p>
                      <p className="text-slate-300 font-medium mt-0.5">{rental.delivery_option} {rental.delivery_option === 'Delivery' ? `to Address` : 'from Store'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSchedulingId(rental.id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/10 active:scale-95">
                      Schedule Return Pickup
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-1">
              {schedulingId ? (
                <div className="glass-card rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Schedule Pickup Details</h3>
                  <form onSubmit={handleRequestReturn} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Pickup Date *</label>
                      <input type="date" required value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Preferred Time Slot *</label>
                      <select value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white">
                        <option value="10:00 AM - 1:00 PM">Morning (10:00 AM - 1:00 PM)</option>
                        <option value="1:00 PM - 4:00 PM">Afternoon (1:00 PM - 4:00 PM)</option>
                        <option value="4:00 PM - 7:00 PM">Evening (4:00 PM - 7:00 PM)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Logistics Notes / Comments</label>
                      <textarea rows={3} value={comments} onChange={e => setComments(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white resize-none" 
                        placeholder="e.g. Device returned in original packaging with charger..." />
                    </div>

                    <button type="submit" disabled={submitting || !pickupDate}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-40">
                      {submitting ? 'Confirming...' : 'Request Pickup'}
                    </button>
                    <button type="button" onClick={() => setSchedulingId(null)} className="w-full border border-slate-850 hover:bg-slate-900 text-slate-400 py-2 rounded-xl text-xs font-semibold">Cancel</button>
                  </form>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-5 space-y-3 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border-purple-500/20">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5"><Truck size={14} /> Hassle-Free Returns</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our courier team will visit your scheduled address during your chosen time slot.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Please ensure the electronic item is clean, packed with its accessories (chargers, lenses, cages), and ready for hand-off.
                  </p>
                  <div className="bg-[#1e1e2d] rounded-xl p-3 flex gap-2 border border-slate-800">
                    <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] text-slate-400 leading-relaxed">Ensure you photograph the item in its working condition before handover to protect against in-transit damage claims.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;
