import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiStar, HiX } from 'react-icons/hi';
import ScrollReveal from '../components/ScrollReveal';

const categories = ['Laptop', 'Camera', 'Printer', 'Drone', 'Audio', 'Display', 'Gaming', 'Tablet', 'Smartphone', 'VR', 'Lighting', 'Grip', 'Accessories'];

function mapDevice(d) {
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    image: d.image_url,
    pricePerDay: Math.round(d.daily_rate / 100),
    rating: 0,
    available: d.available_qty > 0,
    specs: d.description,
    description: d.description,
    totalQty: d.total_qty,
    availableQty: d.available_qty,
  };
}

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', daily_rate: '', total_qty: '', image_url: '', description: '' });

  useEffect(() => {
    fetch('/api/devices')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch devices'); return r.json(); })
      .then(data => { setDevices(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filtered = devices
    .map(mapDevice)
    .filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || d.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.pricePerDay - b.pricePerDay;
        case 'price-desc': return b.pricePerDay - a.pricePerDay;
        default: return 0;
      }
    });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          daily_rate: Number(form.daily_rate),
          total_qty: Number(form.total_qty),
          image_url: form.image_url,
          description: form.description,
        }),
      });
      if (!res.ok) throw new Error('Failed to add device');
      const result = await res.json();
      setDevices(prev => [{ id: result.id, name: form.name, category: form.category, daily_rate: Number(form.daily_rate), total_qty: Number(form.total_qty), available_qty: Number(form.total_qty), image_url: form.image_url, description: form.description }, ...prev]);
      setShowAddModal(false);
      setForm({ name: '', category: '', daily_rate: '', total_qty: '', image_url: '', description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete device');
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-red-400 text-lg">Failed to connect to server. Make sure the backend is running.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Manage Devices & Gear</h1>
              <p className="text-gray-400 mt-2">Add, edit, or configure real-time device levels.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2 !py-2.5 !px-5 text-sm"
            >
              <HiPlus className="text-lg" /> Add Device
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field !pl-11"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field !w-auto !py-2.5 !pr-8"
              >
                <option value="name-asc">Sort: Name</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="price-asc">Sort: Price (Low)</option>
                <option value="price-desc">Sort: Price (High)</option>
              </select>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-accent-cyan text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              ALL DEVICES
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent-cyan text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-lg">No items found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adapting your search parameters or category filter.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategory + search + sort}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((d, i) => (
                <ScrollReveal key={d.id} delay={i * 0.05}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-card glass-hover overflow-hidden group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          d.available
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {d.available ? 'Available' : 'Rented'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg bg-white/10 hover:bg-accent-cyan/20 text-gray-300 hover:text-accent-cyan transition-all">
                          <HiPencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
                        >
                          <HiTrash size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500">{d.category}</p>
                        <span className="text-xs text-gray-500">
                          {d.availableQty}/{d.totalQty} available
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-base mb-1">{d.name}</h3>
                      {d.specs && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{d.specs}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-accent-cyan font-bold text-lg">${d.pricePerDay}</span>
                          <span className="text-gray-500 text-xs">/day</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Device</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <HiX size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Device Name</label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field" placeholder="e.g. MacBook Pro M4"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    required value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Daily Rate (cents)</label>
                    <input
                      type="number" required min={1}
                      value={form.daily_rate}
                      onChange={e => setForm({ ...form, daily_rate: e.target.value })}
                      className="input-field" placeholder="e.g. 4800"
                    />
                    <p className="text-xs text-gray-500 mt-1">Divided by 100 for $ display</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total Quantity</label>
                    <input
                      type="number" required min={1}
                      value={form.total_qty}
                      onChange={e => setForm({ ...form, total_qty: e.target.value })}
                      className="input-field" placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea rows={2} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="input-field" placeholder="Brief description..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                  <input type="url" value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                    className="input-field" placeholder="https://..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full text-center !py-3">
                  Add Device
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
