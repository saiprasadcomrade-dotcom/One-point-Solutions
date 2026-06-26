import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, CheckCheck, XCircle, Truck, ArrowRight, ShieldCheck, AlertCircle, Zap, X } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailBooking, setDetailBooking] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const response = await api.get('/bookings');
        setBookings(response.data.filter(b => b.user_email === user.email));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyBookings();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="text-blue-400" size={14} />;
      case 'Shipped': return <Truck className="text-purple-400" size={14} />;
      case 'Delivered': return <CheckCheck className="text-cyan-400" size={14} />;
      case 'Returned': return <ShieldCheck className="text-emerald-400" size={14} />;
      case 'Cancelled': return <XCircle className="text-red-400" size={14} />;
      default: return <Clock className="text-yellow-400" size={14} />;
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      Approved: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      Shipped: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      Delivered: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      Returned: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      Cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return map[status] || 'bg-slate-800 text-slate-400 border border-slate-700';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Rental Orders</h1>
        <p className="text-xs text-slate-400">Track shipping, schedule returns, and check invoices for active bookings.</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="glass-card rounded-2xl border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Order #ORD-{String(booking.id).padStart(5, '0')}</span>
                    </div>
                    <h2 className="text-sm font-bold text-white mt-1 leading-snug">{booking.device_name}</h2>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-base font-black text-cyan-400">₹{booking.total_price?.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Bill</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-900/80 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Period</p>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{booking.start_date} → {booking.end_date}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Quantity</p>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{booking.quantity} unit(s)</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Delivery Mode</p>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{booking.delivery_option}</p>
                </div>
                <div className="flex justify-start md:justify-end items-end gap-3">
                  <Link to={`/booking-summary/${booking.id}`} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                    Invoice <ArrowRight size={12} />
                  </Link>
                  <button onClick={() => setDetailBooking(booking)}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                    Details
                  </button>
                </div>
              </div>

              {booking.status === 'Returned' && booking.damage_fee > 0 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-300"><span className="font-semibold text-red-200">Incident Charge:</span> ₹{booking.damage_fee} — "{booking.damage_notes}"</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="glass-card rounded-[2.5rem] p-16 text-center space-y-5 border-slate-800">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
              <Package size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">No leases found</h3>
              <p className="text-xs text-slate-500 mt-1">RentEase premium electronics catalog is waiting for your deployment.</p>
            </div>
            <div>
              <Link to="/devices" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95">
                <Zap size={14} className="fill-current" /> Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>

      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetailBooking(null)}>
          <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Lease Breakdown</h2>
              <button onClick={() => setDetailBooking(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                  #{detailBooking.id}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-snug">{detailBooking.device_name}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Leased Equipment</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Workflow Status', detailBooking.status],
                  ['Lease Quantity', `${detailBooking.quantity} unit(s)`],
                  ['Deployment Date', detailBooking.start_date],
                  ['Expected Return', detailBooking.end_date],
                  ['Fulfillment Type', detailBooking.delivery_option],
                  ['Settlement Method', detailBooking.payment_method],
                  ['Base Amount', `₹${detailBooking.total_price?.toLocaleString()}`],
                  ['Incident Fees', detailBooking.damage_fee > 0 ? `₹${detailBooking.damage_fee}` : '₹0'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              {detailBooking.delivery_address && (
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Express Address</p>
                  <p className="text-xs text-slate-300 mt-0.5">{detailBooking.delivery_address}</p>
                </div>
              )}
              {detailBooking.damage_notes && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
                  <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Damage Diagnostics</p>
                  <p className="text-xs text-red-300 mt-0.5">{detailBooking.damage_notes}</p>
                </div>
              )}
            </div>
            <button onClick={() => setDetailBooking(null)}
              className="w-full mt-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
