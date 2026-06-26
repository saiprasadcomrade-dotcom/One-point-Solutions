import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Mail, Package, CheckCircle, ArrowLeft, CreditCard, MapPin, Phone, X, Zap, ShieldCheck, Truck, ShieldAlert } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const Booking = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [allDevices, setAllDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rentalDays, setRentalDays] = useState(1);

  const savedName = localStorage.getItem(`user_name_${user?.uid}`) || user?.name || '';
  const savedAddress = localStorage.getItem(`user_address_${user?.uid}`) || '';

  const [formData, setFormData] = useState({
    user_name: savedName,
    user_email: user?.email || '',
    user_phone: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    quantity: 1,
    delivery_option: 'Delivery',
    payment_method: 'UPI',
    delivery_address: savedAddress,
    delivery_lat: null,
    delivery_lng: null,
  });

  const [showAddress, setShowAddress] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get('/devices');
        setAllDevices(response.data);
        
        if (id) {
          const selected = response.data.find(d => String(d.id) === String(id));
          setDevice(selected);
          setFormData(prev => ({ ...prev, device_id: selected.id }));
        } else if (response.data.length > 0) {
          const firstAvailable = response.data[0];
          setDevice(firstAvailable);
          setFormData(prev => ({ ...prev, device_id: firstAvailable.id }));
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeviceChange = (e) => {
    const devId = parseInt(e.target.value);
    const selected = allDevices.find(d => d.id === devId);
    setDevice(selected);
    setFormData(prev => ({ ...prev, device_id: devId, quantity: 1 }));
  };

  const handleDateChange = (name, val) => {
    const updated = { ...formData, [name]: val };
    setFormData(updated);
    if (updated.start_date && updated.end_date) {
      const start = new Date(updated.start_date);
      const end = new Date(updated.end_date);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setRentalDays(diffDays);
      } else {
        setRentalDays(1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        device_id: device.id,
      };
      
      const res = await api.post('/bookings', submissionData);
      
      // Save phone and address locally
      if (formData.user_phone) localStorage.setItem(`user_phone_${user?.uid}`, formData.user_phone);
      if (formData.delivery_address) localStorage.setItem(`user_address_${user?.uid}`, formData.delivery_address);

      // Navigate to summary page directly!
      navigate(`/booking-summary/${res.data.booking_id}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Booking failed. Check date overlaps or device quantities.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest">Configuring booking engine...</p>
    </div>
  );

  if (!device) return <div className="text-center mt-10 text-red-500 font-medium">Device not found</div>;

  const totalPrice = device.daily_rate * rentalDays * formData.quantity;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/devices" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
        <ArrowLeft size={13} /> Back to Catalog
      </Link>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Device info box */}
        <div className="w-full lg:w-2/5 sticky lg:top-20">
          <div className="glass-card rounded-[2rem] p-6 border-slate-800 space-y-5">
            {/* Conditional Dropdown for Device Selection */}
            {!id ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Device to Rent</label>
                <select 
                  value={device.id} 
                  onChange={handleDeviceChange}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white"
                >
                  {allDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (₹{d.daily_rate}/day)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-center border-b border-slate-800/80 pb-4">
                <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{device.category}</span>
                <h2 className="text-sm font-bold text-white mt-1.5">{device.name}</h2>
              </div>
            )}

            <div className="aspect-square bg-slate-950/40 rounded-2xl border border-slate-850 p-4 flex items-center justify-center relative overflow-hidden">
              <img 
                src={device.image_url} 
                alt={device.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800'; }}
              />
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed text-center">{device.description}</p>
            
            <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Daily Rate</span>
                <span className="text-base font-black text-white">₹{device.daily_rate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Available Units</span>
                <span className="text-emerald-400 font-bold">{device.available_qty} / {device.total_qty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 w-full">
          <div className="glass-card rounded-[2rem] p-6 md:p-8 border-slate-800">
            <div className="mb-6">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Rental details & Booking</h2>
              <p className="text-xs text-slate-400 mt-1">Submit your verification contact details, quantity, and lease duration.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input type="text" name="user_name" defaultValue={formData.user_name} required
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="John Doe"
                    onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input type="email" name="user_email" defaultValue={formData.user_email} required
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="you@email.com"
                    onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
                  <input type="tel" name="user_phone" required
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="+91 98765 43210"
                    value={formData.user_phone} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity *</label>
                  <input type="number" name="quantity" min="1" max={device.available_qty || 1} required
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white"
                    value={formData.quantity} onChange={handleChange} />
                </div>
                
                {/* Custom Date Pickers */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date *</label>
                  <input type="date" required value={formData.start_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date *</label>
                  <input type="date" required value={formData.end_date}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Option *</label>
                  <select name="delivery_option"
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white"
                    value={formData.delivery_option}
                    onChange={(e) => { handleChange(e); setShowAddress(e.target.value === 'Delivery'); }}
                  >
                    <option value="Pickup">Pickup at Hub Store (New Delhi)</option>
                    <option value="Delivery">Doorstep Express Delivery</option>
                  </select>
                </div>
              </div>

              {showAddress && (
                <div className="space-y-2 border-t border-slate-850 pt-4">
                  <LocationPicker
                    address={formData.delivery_address}
                    onAddressChange={(val) => setFormData(prev => ({ ...prev, delivery_address: val }))}
                    coords={formData.delivery_lat ? [formData.delivery_lat, formData.delivery_lng] : null}
                    onCoordsChange={([lat, lng]) => setFormData(prev => ({ ...prev, delivery_lat: lat, delivery_lng: lng }))}
                  />
                </div>
              )}

              <div className="space-y-2 border-t border-slate-850 pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['UPI', 'Credit Card', 'Net Banking', 'Cash on Pickup'].map((method) => (
                    <button key={method} type="button"
                      onClick={() => setFormData({ ...formData, payment_method: method })}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
                        formData.payment_method === method
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="border-t border-slate-800/80 pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Rental Period</span>
                  <span className="font-semibold text-slate-200">{rentalDays} Day{rentalDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Quantity</span>
                  <span className="font-semibold text-slate-200">x {formData.quantity} unit{formData.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Daily Rate</span>
                  <span className="font-semibold text-slate-200">₹{device.daily_rate}</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-white border-t border-slate-850 pt-2 mt-2">
                  <span>Total Amount</span>
                  <span className="text-xl font-black text-cyan-400">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Confirming with database...' : `Submit Booking - ₹${totalPrice.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
