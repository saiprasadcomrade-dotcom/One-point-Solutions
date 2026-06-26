import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowRight, Zap, Filter, Plus, Pencil, Trash2, X, PackageOpen, RefreshCcw, AlertTriangle } from 'lucide-react';

const fallbackImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800';
const emptyForm = { name: '', category: 'Laptop', daily_rate: '', total_qty: '', available_qty: '', image_url: '', description: '' };

const Catalog = () => {
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const [searchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [addedToCart, setAddedToCart] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const isAdmin = user?.role === 'admin';
  const searchQuery = searchParams.get('search') || '';

  const fetchDevices = async () => {
    setLoading(true);
    try { 
      const res = await api.get('/devices'); 
      setDevices(res.data); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchDevices(); 
  }, []);

  useEffect(() => { 
    if (searchQuery) setActiveCategory('All'); 
  }, [searchQuery]);

  const categories = ['All', 'Laptop', 'Camera', 'Printer', 'Drone', 'Audio', 'Display', 'Gaming', 'Tablet', 'Smartphone', 'VR', 'Lighting', 'Grip', 'Accessories'];

  let filteredDevices = devices.filter(d => {
    const mc = activeCategory === 'All' || d.category === activeCategory;
    const ms = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase()) || d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return mc && ms;
  });

  const sorted = [...filteredDevices].sort((a, b) => {
    if (sortBy === 'price-low') return a.daily_rate - b.daily_rate;
    if (sortBy === 'price-high') return b.daily_rate - a.daily_rate;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'stock') return (a.available_qty || 0) - (b.available_qty || 0);
    return 0;
  });

  const handleAddToCart = (device) => {
    addToCart(device);
    setAddedToCart(prev => ({ ...prev, [device.id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [device.id]: false })), 2000);
  };

  const openAddModal = () => { setEditingDevice(null); setForm(emptyForm); setShowModal(true); };
  const openEditModal = (device) => {
    setEditingDevice(device);
    setForm({ name: device.name, category: device.category, daily_rate: device.daily_rate, total_qty: device.total_qty, available_qty: device.available_qty, image_url: device.image_url || '', description: device.description || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.daily_rate || !form.total_qty) return;
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        daily_rate: parseFloat(form.daily_rate), 
        total_qty: parseInt(form.total_qty),
        available_qty: form.available_qty !== '' ? parseInt(form.available_qty) : parseInt(form.total_qty)
      };
      if (editingDevice) await api.put(`/devices/${editingDevice.id}`, payload);
      else await api.post('/devices', payload);
      setShowModal(false); 
      fetchDevices();
    } catch (err) { 
      alert(err.response?.data?.error || 'Failed to save device'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    try { 
      await api.delete(`/devices/${id}`); 
      setDeleteConfirm(null); 
      fetchDevices(); 
    } catch { 
      alert('Failed to delete device'); 
    }
  };

  const toggleStock = async (device) => {
    const newAvailable = device.available_qty > 0 ? 0 : device.total_qty;
    try { 
      await api.put(`/devices/${device.id}`, { available_qty: newAvailable }); 
      fetchDevices(); 
    } catch { 
      alert('Failed to update stock'); 
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      <p className="mt-4 text-slate-500 font-semibold text-xs uppercase tracking-widest">Loading RentEase Inventory...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {searchQuery ? (
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Results for "{searchQuery}"</h1>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold">{filteredDevices.length} item{filteredDevices.length !== 1 ? 's' : ''} matched</p>
            </div>
          ) : (
            <div>
              <span className="bg-gradient-to-r from-cyan-500 to-purple-500 w-8 h-1 rounded-full inline-block mb-1.5"></span>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                {isAdmin ? 'Manage' : 'Rent'} <span className="text-gradient">Devices & Gear</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isAdmin ? 'Add, edit, or configure real-time device levels.' : 'Select high-end items, verify your KYC documents, and book instantly.'}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <button onClick={openAddModal} className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-cyan-500/10">
              <Plus size={15} /> Add Device
            </button>
          )}
          <div className="flex items-center bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl gap-2 text-xs">
            <Filter size={13} className="text-slate-500" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-slate-300 outline-none border-none cursor-pointer">
              <option value="name">Sort: Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              {isAdmin && <option value="stock">Stock: Low First</option>}
            </select>
          </div>
          <button onClick={fetchDevices} className="p-2 text-slate-500 hover:text-cyan-400 transition-colors"><RefreshCcw size={15} /></button>
        </div>
      </div>

      {/* Categories Horizontal Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} 
            className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap tracking-wider border uppercase ${
              activeCategory === cat 
                ? 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10' 
                : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'
            }`}
          >
            {cat === 'All' ? 'ALL DEVICES' : cat}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sorted.map((device) => {
          const inCart = cart.find(item => item.id === device.id);
          const outOfStock = device.available_qty <= 0;
          const ratings = (4.0 + (device.id % 10) * 0.1).toFixed(1);
          const reviewCount = 20 + (device.id * 7) % 150;
          
          return (
            <motion.div 
              key={device.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`group glass-card rounded-2xl border ${
                outOfStock ? 'border-red-950/40 opacity-70' : 'border-slate-800/80'
              } overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col relative`}
            >
              {/* Admin Actions Overlay */}
              {isAdmin && (
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <button onClick={() => openEditModal(device)} className="w-7 h-7 bg-slate-950/80 rounded-lg flex items-center justify-center text-slate-400 hover:bg-cyan-500 hover:text-slate-950 transition-all"><Pencil size={11} /></button>
                  <button onClick={() => setDeleteConfirm(device.id)} className="w-7 h-7 bg-slate-950/80 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={11} /></button>
                  <button onClick={() => toggleStock(device)} className={`w-7 h-7 bg-slate-950/80 rounded-lg flex items-center justify-center transition-all ${outOfStock ? 'text-emerald-400 hover:bg-emerald-500 hover:text-slate-950' : 'text-amber-400 hover:bg-amber-500 hover:text-slate-950'}`} title={outOfStock ? 'Mark in stock' : 'Mark out of stock'}>
                    {outOfStock ? <PackageOpen size={11} /> : <AlertTriangle size={11} />}
                  </button>
                </div>
              )}

              <Link to={isAdmin ? '#' : `/booking/${device.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-slate-950/30 p-4 flex items-center justify-center border-b border-slate-900">
                  <img src={device.image_url || fallbackImage} alt={device.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = fallbackImage; }} loading="lazy" />
                </div>
              </Link>

              <div className="p-4 flex-1 flex flex-col space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{device.category}</span>
                  {outOfStock && <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">OUT OF STOCK</span>}
                </div>

                <Link to={isAdmin ? '#' : `/booking/${device.id}`} className="text-xs font-bold text-slate-100 hover:text-cyan-400 transition-colors line-clamp-2 min-h-[32px] leading-tight">
                  {device.name}
                </Link>

                {isAdmin && <p className="text-[9px] text-slate-500">Live Stock: <span className={device.available_qty > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{device.available_qty}/{device.total_qty}</span></p>}
                
                {!isAdmin && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= Math.round(parseFloat(ratings)) ? 'text-cyan-400 fill-cyan-400' : 'text-slate-800'} />)}
                    </div>
                    <span className="text-[10px] text-cyan-400 font-bold">{ratings}</span>
                    <span className="text-[9px] text-slate-500">({reviewCount})</span>
                  </div>
                )}

                <div className="mt-auto pt-2">
                  <div className="flex items-baseline gap-1 mb-2.5">
                    <span className="text-base font-black text-white">₹{device.daily_rate}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">/ day</span>
                  </div>

                  {isAdmin ? (
                    <span className="block text-[9px] text-slate-500 text-center py-1 bg-slate-950/40 border border-slate-900 rounded-xl font-mono">CODE: {device.id}</span>
                  ) : (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleAddToCart(device)} 
                        disabled={outOfStock}
                        className={`flex-1 text-[10px] font-bold py-2 rounded-xl uppercase tracking-wider transition-all duration-300 ${
                          outOfStock 
                            ? 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed' 
                            : addedToCart[device.id] 
                              ? 'bg-emerald-500 text-slate-950 font-black' 
                              : inCart 
                                ? 'bg-cyan-500 text-slate-950' 
                                : 'bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-300 hover:text-white active:scale-95'
                        }`}
                      >
                        {outOfStock ? 'SOLD OUT' : addedToCart[device.id] ? 'ADDED!' : inCart ? 'RENT MORE' : 'ADD TO CART'}
                      </button>
                      <Link to={`/booking/${device.id}`} className="px-2.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all"><ArrowRight size={13} /></Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500"><Zap size={22} /></div>
          <div>
            <h3 className="text-base font-bold text-white">No items found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adapting your search parameters or category filter.</p>
          </div>
          {isAdmin && <button onClick={openAddModal} className="bg-cyan-500 text-slate-900 px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg"><Plus size={14} className="inline mr-1" /> Add Device</button>}
        </div>
      )}

      {/* Device Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-850">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">{editingDevice ? 'Edit Device Details' : 'Register New Device'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="Sony A7 IV" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-xl focus:border-cyan-500 outline-none text-xs text-white">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Rate (₹) *</label>
                  <input type="number" required min="1" value={form.daily_rate} onChange={e => setForm({...form, daily_rate: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Quantity *</label>
                  <input type="number" required min="1" value={form.total_qty} onChange={e => setForm({...form, total_qty: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="10" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</label>
                  <input type="number" min="0" value={form.available_qty} onChange={e => setForm({...form, available_qty: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="Set 0 for out of stock" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                  <input type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="https://images.unsplash.com/..." />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                    className="w-full mt-1 px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl focus:border-cyan-500 outline-none text-xs text-white resize-none" placeholder="Brief diagnostic description..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50">{saving ? 'Saving...' : editingDevice ? 'Update Device' : 'Create Device'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400"><Trash2 size={20} /></div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Remove Device?</h3>
                <p className="text-[10px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-400 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
