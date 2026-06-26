import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Grid, List, Trash2, Edit, X, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDevices = () => {
  const { showToast } = useToast();
  const location = useLocation();

  const [devices, setDevices] = useState([]);
  const [deletedDevices, setDeletedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showDeletedHistory, setShowDeletedHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Laptop',
    brand: '',
    model: '',
    serial_number: '',
    condition: 'Excellent',
    purchase_date: new Date().toISOString().split('T')[0],
    rental_price: '',
    deposit_amount: '',
    image_url: '',
    description: '',
    notes: '',
    totalQuantity: 1
  });

  // Sync parameters from dashboard redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const addParam = params.get('add');

    if (filterParam) {
      if (filterParam === 'All') setStatusFilter('All');
      else setStatusFilter(filterParam);
    }
    if (addParam === 'true') {
      handleAddClick();
    }
  }, [location.search]);

  // Load Active and Deleted Devices
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const [devicesRes, deletedRes] = await Promise.all([
        api.get('/devices'),
        api.get('/devices/deleted')
      ]);
      setDevices(devicesRes.data);
      setDeletedDevices(deletedRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load devices list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddClick = () => {
    setFormMode('add');
    setFormData({
      id: '',
      name: '',
      category: 'Laptop',
      brand: '',
      model: '',
      serial_number: '',
      condition: 'Excellent',
      purchase_date: new Date().toISOString().split('T')[0],
      rental_price: '',
      deposit_amount: '',
      image_url: '',
      description: '',
      notes: '',
      totalQuantity: 1
    });
    setShowFormModal(true);
  };

  const handleEditClick = (device) => {
    setFormMode('edit');
    setFormData({
      ...device,
      purchase_date: device.purchase_date ? device.purchase_date.split('T')[0] : '',
      totalQuantity: device.totalQuantity || 1
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.brand || !formData.model || !formData.serial_number || formData.rental_price === '') {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    try {
      if (formMode === 'add') {
        await api.post('/devices', formData);
        showToast('Device added successfully!', 'success');
      } else {
        await api.put(`/devices/${formData.id}`, formData);
        showToast('Device updated successfully!', 'success');
      }
      setShowFormModal(false);
      fetchDevices();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  // Soft Delete device
  const handleSoftDelete = async (id) => {
    if (!window.confirm('Move this device to Deleted History? (It will be hidden from active stock)')) return;
    try {
      await api.delete(`/devices/${id}`);
      showToast('Device moved to Deleted History.', 'success');
      fetchDevices();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete device.', 'error');
    }
  };

  // Restore Device
  const handleRestoreDevice = async (id) => {
    try {
      await api.post(`/devices/${id}/restore`);
      showToast('Device restored to active inventory.', 'success');
      fetchDevices();
    } catch (err) {
      showToast('Failed to restore device.', 'error');
    }
  };

  // Permanent Delete Device
  const handlePermanentDelete = async (id) => {
    if (!window.confirm('WARNING: Permanently delete this device? This will erase database records. Continue?')) return;
    try {
      await api.delete(`/devices/${id}/permanent`);
      showToast('Device permanently deleted from inventory.', 'success');
      fetchDevices();
    } catch (err) {
      showToast('Failed to permanently delete device.', 'error');
    }
  };

  // Filter listings
  const filteredDevices = (showDeletedHistory ? deletedDevices : devices).filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Laptop', 'Camera', 'Drone', 'Audio', 'Gaming', 'Smartphone', 'Tablet', 'Display', 'VR', 'Lighting', 'Grip', 'Accessories', 'Printer'];

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {showDeletedHistory ? 'Deleted Devices History' : 'Electronics Fleet'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {showDeletedHistory 
              ? 'Restore or permanently delete retired hardware devices.' 
              : 'Add, update, and audit rental electronics stock.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeletedHistory(!showDeletedHistory)}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showDeletedHistory 
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showDeletedHistory ? 'Active Stock' : 'Deleted History'}
          </button>

          {!showDeletedHistory && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Device
            </button>
          )}
        </div>
      </div>

      {/* Control panel (search, filters, view toggle) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] md:flex-none">
            <input
              type="text"
              placeholder="Search name or SN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:bg-white outline-none transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-600"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Status Filter (only for Active list) */}
          {!showDeletedHistory && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-600"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Repair">Repair</option>
            </select>
          )}
        </div>

        {/* View Toggle buttons */}
        <div className="flex items-center gap-2 border-l border-slate-200/80 pl-4 hidden md:flex">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Grid or List of Devices */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-medium">No devices found matching your criteria.</p>
        </div>
      ) : viewMode === 'grid' && !showDeletedHistory ? (
        /* GRID VIEW (Only Active Stock) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDevices.map((device) => (
            <div 
              key={device.id} 
              className="bg-white rounded-3xl border border-slate-200/85 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Device Image Box */}
              <div className="h-44 bg-slate-50 relative flex items-center justify-center border-b border-slate-100">
                {device.image_url ? (
                  <img 
                    src={device.image_url} 
                    alt={device.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.style.display = 'none'; // hide broken link
                    }}
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <ImageIcon size={32} />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm ${
                    device.status === 'Repair' ? 'bg-red-500 text-white' :
                    device.availableQuantity > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {device.status === 'Repair' ? 'Repair' : (device.availableQuantity > 0 ? 'In Stock' : 'Out of Stock')}
                  </span>
                  <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 text-[8px] font-bold rounded-md uppercase tracking-wider">
                    {device.condition}
                  </span>
                </div>
              </div>

              {/* Device Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{device.category} • {device.brand}</div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight mt-1.5 leading-tight line-clamp-1">{device.name}</h3>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">S/N: {device.serial_number}</p>
                  
                  {/* Stock Breakdown Quantities */}
                  <div className="mt-3 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-xl p-2 grid grid-cols-3 text-center gap-1">
                    <div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Total</span>
                      <span className="text-slate-800 font-bold">{device.totalQuantity}</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Available</span>
                      <span className="text-emerald-600 font-bold">{device.availableQuantity}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Booked</span>
                      <span className="text-blue-600 font-bold">{device.bookedQuantity}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Rate</span>
                    <p className="text-xs font-black text-slate-800">₹{device.rental_price}/day</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Deposit</span>
                    <p className="text-xs font-black text-slate-500">₹{device.deposit_amount}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 px-4 py-3 flex gap-2 border-t border-slate-100">
                {/* Live Stock Indicator Button */}
                <div className={`flex-1 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-sm bg-white ${
                  device.status === 'Repair' 
                    ? 'border-red-200 text-red-500 bg-red-50/10'
                    : device.availableQuantity > 0 
                      ? 'border-emerald-200 text-emerald-600' 
                      : 'border-rose-200 text-rose-500 bg-rose-50/10'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    device.status === 'Repair' ? 'bg-red-500' :
                    device.availableQuantity > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}></span>
                  {device.status === 'Repair' ? 'Repair' : (device.availableQuantity > 0 ? 'In Stock' : 'Out of Stock')}
                </div>

                <button
                  onClick={() => handleEditClick(device)}
                  className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg border border-cyan-100 hover:bg-cyan-100 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleSoftDelete(device.id)}
                  className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Move to Trash"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE / LIST VIEW (And Deleted list layout) */
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Device</th>
                  <th className="py-4 px-3">Category</th>
                  <th className="py-4 px-3">Serial Number</th>
                  <th className="py-4 px-3">Stock (T/A/B)</th>
                  <th className="py-4 px-3">Status / Condition</th>
                  <th className="py-4 px-3 text-right">Price</th>
                  <th className="py-4 px-3 text-right">Deposit</th>
                  {showDeletedHistory && <th className="py-4 px-3">Deleted Date</th>}
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-100 overflow-hidden shrink-0">
                          {device.image_url ? (
                            <img src={device.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 uppercase leading-none">{device.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-none">{device.brand} • {device.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-500">{device.category}</td>
                    <td className="py-4 px-3 font-mono text-[10px] text-slate-500">{device.serial_number}</td>
                    <td className="py-4 px-3">
                      <span className="font-bold text-slate-700">{device.totalQuantity}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="font-bold text-emerald-600">{device.availableQuantity}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="font-bold text-blue-600">{device.bookedQuantity}</span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          device.status === 'Repair' ? 'bg-red-50 text-red-600' :
                          device.availableQuantity > 0 ? 'bg-emerald-50 text-emerald-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {device.status === 'Repair' ? 'Repair' : (device.availableQuantity > 0 ? 'In Stock' : 'Out of Stock')}
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{device.condition}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-right font-bold">₹{device.rental_price}</td>
                    <td className="py-4 px-3 text-right text-slate-500">₹{device.deposit_amount}</td>
                    {showDeletedHistory && (
                      <td className="py-4 px-3 text-slate-500">
                        {device.deleted_at ? new Date(device.deleted_at).toLocaleDateString() : 'N/A'}
                      </td>
                    )}
                    <td className="py-4 px-6 text-right">
                      {showDeletedHistory ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleRestoreDevice(device.id)}
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] font-bold cursor-pointer"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(device.id)}
                            className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(device)}
                            className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg border border-cyan-100 hover:bg-cyan-100 transition-colors cursor-pointer"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleSoftDelete(device.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD/EDIT DEVICE DIALOG ─── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFormModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowFormModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">
              {formMode === 'add' ? 'Add Fleet Device' : 'Edit Device Credentials'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Device Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white transition-all text-slate-800"
                    placeholder="e.g. MacBook Pro 16"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-700"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                    placeholder="e.g. Apple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Model Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                    placeholder="e.g. A3184"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Serial Number (S/N) *</label>
                  <input
                    type="text"
                    required
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                    placeholder="e.g. SN-MBP-101"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Total Stock Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-855 font-bold"
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Physical Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-700"
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Rental Price (₹ / day) *</label>
                  <input
                    type="number"
                    required
                    value={formData.rental_price}
                    onChange={(e) => setFormData({ ...formData, rental_price: parseFloat(e.target.value) || '' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                    placeholder="e.g. 1500"
                  />
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Deposit Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Device Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Specifications</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850 resize-none"
                  placeholder="M4 chip, 16GB RAM..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850 resize-none"
                  placeholder="Acquired via Bangalore vendor."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevices;
