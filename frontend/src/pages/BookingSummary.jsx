import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle, Calendar, Truck, CreditCard, ChevronRight, Zap, Printer } from 'lucide-react';

const BookingSummary = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
        <p className="mt-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">Loading receipt...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-red-400 text-lg font-bold">Booking Not Found</div>
        <p className="text-xs text-slate-400">The requested booking ID does not exist or has been deleted.</p>
        <Link to="/" className="inline-block px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold">Return Home</Link>
      </div>
    );
  }

  // Calculate rental duration in days
  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  const pricePerDay = booking.total_price / (days * booking.quantity);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Confirmed Banner */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={26} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Booking Confirmed!</h1>
          <p className="text-xs text-slate-400">Order ID: <span className="font-mono text-cyan-400 font-bold">#ORD-{String(booking.id).padStart(5, '0')}</span></p>
        </div>

        {/* Receipt Card */}
        <div className="glass-card rounded-[2rem] p-6 md:p-8 space-y-6 relative overflow-hidden border border-white/10 shadow-2xl print:bg-white print:text-black">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
          
          {/* Logo & Status */}
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-slate-900 fill-current" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Rent<span className="text-cyan-400">Ease</span></span>
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                booking.status === 'Returned' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                booking.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                booking.status === 'Delivered' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-4">
              <div>
                <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Device</p>
                <p className="text-sm font-bold text-white mt-0.5">{booking.device_name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Quantity</p>
                <p className="text-sm font-semibold text-white mt-0.5">{booking.quantity} Unit{booking.quantity > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Rental Duration</p>
                <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
                  <Calendar size={13} className="text-cyan-400" />
                  <span>{days} Day{days > 1 ? 's' : ''} ({booking.start_date} to {booking.end_date})</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Customer Details</p>
                <p className="text-sm font-semibold text-white mt-0.5">{booking.user_name}</p>
                <p className="text-slate-400 text-[10px]">{booking.user_email}</p>
                <p className="text-slate-400 text-[10px]">{booking.customer_phone}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Delivery Mode</p>
                <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
                  <Truck size={13} className="text-purple-400" />
                  <span>{booking.delivery_option}</span>
                </div>
                {booking.delivery_address && (
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{booking.delivery_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Calculations */}
          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Rate Per Day (per unit)</span>
              <span>₹{pricePerDay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Quantity</span>
              <span>x {booking.quantity}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Rental Days</span>
              <span>x {days}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Delivery Charges</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            {booking.damage_fee > 0 && (
              <div className="flex justify-between text-xs text-red-400 font-semibold">
                <span>Damage Claims / Incident Fees</span>
                <span>+ ₹{booking.damage_fee.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-800/80 pt-3 flex justify-between items-baseline">
              <span className="text-xs text-white font-bold">Total Bill Amount</span>
              <div className="text-right">
                <span className="text-2xl font-black text-cyan-400">₹{(booking.total_price + (booking.damage_fee || 0)).toLocaleString()}</span>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Paid via {booking.payment_method}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-center print:hidden">
          <button onClick={handlePrint} className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-850 hover:text-white flex items-center justify-center gap-1.5 transition-all">
            <Printer size={13} /> Print Invoice
          </button>
          <Link to="/" className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/10">
            Continue to Devices
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
