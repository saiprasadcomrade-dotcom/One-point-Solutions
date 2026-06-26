import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { devices } from '../data/devices';
import { recommendations } from '../data/recommendations';

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get('device');

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    deviceId: preSelectedId || '',
    quantity: 1,
    days: 1,
    delivery: 'delivery',
    address: '',
  });

  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    if (preSelectedId) {
      setForm(prev => ({ ...prev, deviceId: preSelectedId }));
    }
  }, [preSelectedId]);

  const selectedDevice = devices.find(d => d.id === Number(form.deviceId));
  const total = selectedDevice ? selectedDevice.pricePerDay * form.quantity * form.days : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/booking-summary', { state: { ...form, selectedDevice, total } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Book Your Rental</h1>
            <p className="text-gray-400 mt-3">Fill in the details below to reserve your equipment</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ScrollReveal delay={0.1}>
              <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Customer Name</label>
                    <input type="text" name="customerName" value={form.customerName} onChange={handleChange}
                      required placeholder="John Doe" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      required placeholder="john@example.com" className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                      required placeholder="+1 (555) 000-0000" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Device</label>
                    <select name="deviceId" value={form.deviceId} onChange={handleChange}
                      required className="input-field">
                      <option value="">Select a device</option>
                      {devices.filter(d => d.available).map(d => (
                        <option key={d.id} value={d.id}>{d.name} - ${d.pricePerDay}/day</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Quantity</label>
                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                      min="1" max="10" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Rental Duration (Days)</label>
                    <input type="number" name="days" value={form.days} onChange={handleChange}
                      min="1" max="90" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Delivery / Pickup</label>
                    <select name="delivery" value={form.delivery} onChange={handleChange}
                      className="input-field">
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>
                </div>

                {form.delivery === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-gray-300 text-sm font-medium mb-2">Delivery Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange}
                      required={form.delivery === 'delivery'}
                      placeholder="Enter your full delivery address"
                      className="input-field min-h-[100px]" />
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary w-full text-center text-base py-4"
                  disabled={!selectedDevice}
                >
                  Submit Booking
                </motion.button>
              </form>
            </ScrollReveal>
          </div>

          <div className="space-y-6">
            <ScrollReveal delay={0.15}>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
                {selectedDevice ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                      <img src={selectedDevice.image} alt={selectedDevice.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div>
                        <p className="text-white font-medium text-sm">{selectedDevice.name}</p>
                        <p className="text-gray-400 text-xs">{selectedDevice.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Quantity</span>
                        <span className="text-white">{form.quantity}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Duration</span>
                        <span className="text-white">{form.days} days</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Price per day</span>
                        <span className="text-white">${selectedDevice.pricePerDay}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Delivery</span>
                        <span className="text-white capitalize">{form.delivery}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/5 text-lg font-bold">
                        <span className="text-gray-300">Total</span>
                        <span className="gradient-text">${total}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Select a device to see the summary</p>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass-card p-6">
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
                  <span className="px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-xs font-medium">AI</span>
                </button>
                <p className="text-gray-400 text-sm mt-2 mb-4">Not sure what you need? Let AI suggest the perfect setup.</p>
                
                {showRecommendations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    {recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-accent-cyan/5 border border-white/5 hover:border-accent-cyan/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{rec.icon}</span>
                          <span className="text-white font-medium text-sm">{rec.usage}</span>
                        </div>
                        <p className="text-gray-500 text-xs mb-2">{rec.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.items.map((item, j) => (
                            <span key={j} className="px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
