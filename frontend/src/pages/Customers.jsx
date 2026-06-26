import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Search, Mail, MapPin, Calendar, TrendingUp, Package, Phone, X, RefreshCcw, UserPlus } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, bookingsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/bookings')
      ]);
      setCustomers(customersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getCustomerBookings = (email) => bookings.filter(b => b.user_email === email);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
      <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">Loading customers...</p>
    </div>
  );

  const totalSpent = customers.reduce((acc, c) => {
    const customerBookings = getCustomerBookings(c.email);
    return acc + customerBookings.reduce((sum, b) => sum + b.total_price + (b.damage_fee || 0), 0);
  }, 0);

  const filteredCustomers = customers.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-3">
        <div>
          <span className="bg-gradient-to-r from-cyan-500 to-purple-500 w-8 h-1 rounded-full inline-block mb-1.5"></span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer <span className="text-gradient">Management</span></h1>
          <p className="text-xs text-slate-400 mt-1">Manage your customer base and their rental history.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 gap-2">
            <Search size={13} className="text-slate-500" />
            <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-40" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-cyan-500/10"
          >
            <UserPlus size={14} /> Add Customer
          </button>
          <button onClick={fetchData} className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 transition-all"><RefreshCcw size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Customers</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{customers.length}</p>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg. Lifetime Value</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">₹{customers.length ? Math.round(totalSpent / customers.length).toLocaleString() : 0}</p>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active (With Bookings)</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{customers.filter(c => getCustomerBookings(c.email).length > 0).length}</p>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-900">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Bookings</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Total Spent</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredCustomers.map((customer) => {
                const customerBookings = getCustomerBookings(customer.email);
                const total = customerBookings.reduce((sum, b) => sum + b.total_price + (b.damage_fee || 0), 0);
                return (
                  <tr key={customer.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                          {customer.name.charAt(0)}
                        </div>
                        <p className="text-xs font-bold text-white">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail size={10} /> {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone size={10} /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {customerBookings.length} order{customerBookings.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-white">₹{total.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={10} />
                        {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
                {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center"><Users size={24} className="text-slate-600" /></div>
                      <p className="text-slate-400 font-medium text-xs">{searchQuery ? 'No customers match your search.' : 'No customers yet.'}</p>
                      {!searchQuery && <button onClick={() => setShowModal(true)} className="text-xs text-cyan-400 font-medium hover:underline">Add your first customer</button>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Customer</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white mt-1" placeholder="Full name" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white mt-1" placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white mt-1" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2} className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white mt-1 resize-none" placeholder="Address" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50">{saving ? 'Saving...' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
