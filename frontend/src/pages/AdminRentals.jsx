import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Trash2, Edit, X, Calendar, 
  User, CheckCircle, AlertTriangle, Play, RefreshCcw, DollarSign,
  ArrowRight, ShieldCheck, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminRentals = () => {
  const { showToast } = useToast();
  const location = useLocation();

  const [rentals, setRentals] = useState([]);
  const [deletedRentals, setDeletedRentals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [showDeletedHistory, setShowDeletedHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal control states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);


  // Active items for modals
  const [selectedRental, setSelectedRental] = useState(null);

  // Create/Edit Rental Form State
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState({
    id: '',
    customer_id: '',
    device_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0], // +3 days
    rental_amount: 0,
    deposit_amount: 0,
    payment_method: 'UPI',
    notes: '',
    quantity: 1
  });

  // Return Processing Form State
  const [returnForm, setReturnForm] = useState({
    damage_notes: '',
    damage_fee: 0,
    return_condition: 'Excellent',
    mark_repair: false
  });

  // Extension Processing Form State
  const [extendForm, setExtendForm] = useState({
    new_end_date: '',
    additional_amount: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rentalsRes, deletedRes, customersRes, devicesRes] = await Promise.all([
        api.get('/rentals'),
        api.get('/rentals/deleted'),
        api.get('/customers'),
        api.get('/devices')
      ]);
      setRentals(rentalsRes.data);
      setDeletedRentals(deletedRes.data);
      setCustomers(customersRes.data);
      setDevices(devicesRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load rental database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Synchronize dashboard query filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const addParam = params.get('add');

    if (filterParam) {
      setStatusFilter(filterParam);
    }
    if (addParam === 'true') {
      handleAddClick();
    }
  }, [location.search]);

  // Auto calculate pricing on form inputs
  useEffect(() => {
    if (formData.device_id && formData.start_date && formData.end_date) {
      const selectedDevice = devices.find(d => d.id === parseInt(formData.device_id));
      if (selectedDevice) {
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        
        const qty = parseInt(formData.quantity || 1, 10);
        const price = days * selectedDevice.rental_price * qty;
        setFormData(prev => ({
          ...prev,
          rental_amount: price,
          deposit_amount: selectedDevice.deposit_amount * qty
        }));
      }
    }
  }, [formData.device_id, formData.start_date, formData.end_date, formData.quantity, devices]);

  const handleAddClick = () => {
    setFormMode('add');
    setFormData({
      id: '',
      customer_id: '',
      device_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      rental_amount: 0,
      deposit_amount: 0,
      payment_method: 'UPI',
      notes: '',
      quantity: 1
    });
    setShowFormModal(true);
  };

  const handleEditClick = (rental) => {
    setFormMode('edit');
    setSelectedRental(rental);
    setFormData({
      id: rental.id,
      customer_id: rental.customer_id,
      device_id: rental.device_id,
      start_date: rental.start_date.split('T')[0],
      end_date: rental.end_date.split('T')[0],
      rental_amount: rental.rental_amount,
      deposit_amount: rental.deposit_amount,
      payment_method: rental.payment_method,
      payment_status: rental.payment_status || 'Paid',
      notes: rental.notes || '',
      quantity: rental.quantity || 1
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.device_id || !formData.start_date || !formData.end_date) {
      showToast('Please fill in dates, customer, and device.', 'warning');
      return;
    }

    try {
      if (formMode === 'add') {
        await api.post('/rentals', formData);
        showToast('Rental booking logged successfully!', 'success');
      } else {
        await api.put(`/rentals/${formData.id}`, formData);
        showToast('Rental booking updated.', 'success');
      }
      setShowFormModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed.', 'error');
    }
  };

  // Return Processing
  const handleReturnClick = (rental) => {
    setSelectedRental(rental);
    setReturnForm({
      damage_notes: '',
      damage_fee: 0,
      return_condition: rental.device_condition || 'Excellent',
      mark_repair: false
    });
    setShowReturnModal(true);
  };

  const handleConfirmBooking = async (id) => {
    try {
      const res = await api.post('/booking/confirm', { booking_id: id });
      showToast('Booking Confirmed', 'success');
      if (res.data.emailStatus?.startsWith('Sent')) {
        showToast(`Email ${res.data.emailStatus}!`, 'success');
      } else if (res.data.emailStatus === 'Failed' || res.data.emailStatus === 'Not Configured') {
        showToast('Email Notification Failed', 'error');
        const rentalObj = rentals.find(r => r.id === id);
        // setActiveEmailError removed as requested
      }
      fetchData();
    } catch (err) {
      showToast('Failed to confirm booking.', 'error');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/booking/return', { booking_id: selectedRental.id, ...returnForm });
      showToast('Device Returned Successfully!', 'success');
      if (res.data.emailStatus?.startsWith('Sent')) {
        showToast(`Email ${res.data.emailStatus}!`, 'success');
      } else if (res.data.emailStatus === 'Failed' || res.data.emailStatus === 'Not Configured') {
        showToast('Email Notification Failed', 'error');
        // setActiveEmailError removed as requested
      }
      setShowReturnModal(false);
      fetchData();
    } catch (err) {
      showToast('Failed to process return.', 'error');
    }
  };

  // Extension Processing
  const handleExtendClick = (rental) => {
    setSelectedRental(rental);
    // Suggest extension date (+3 days from current return date)
    const currentEnd = new Date(rental.end_date);
    const suggestedEnd = new Date(currentEnd.getTime() + 3*24*60*60*1000).toISOString().split('T')[0];
    
    // Auto-calculate suggested additional amount
    const device = devices.find(d => d.id === rental.device_id);
    const rate = device ? device.rental_price : 0;
    const addAmount = 3 * rate * (rental.quantity || 1);

    setExtendForm({
      new_end_date: suggestedEnd,
      additional_amount: addAmount
    });
    setShowExtendModal(true);
  };

  // Auto calculate extension price when extension end date changes
  useEffect(() => {
    if (selectedRental && extendForm.new_end_date) {
      const currentEnd = new Date(selectedRental.end_date);
      const extendEnd = new Date(extendForm.new_end_date);
      const days = Math.ceil((extendEnd - currentEnd) / (1000 * 60 * 60 * 24)) || 1;
      
      // Look up daily rate in devices list for safety
      const device = devices.find(d => d.id === selectedRental.device_id);
      const rate = device ? device.rental_price : 0;
      
      setExtendForm(prev => ({
        ...prev,
        additional_amount: Math.max(0, days * rate * (selectedRental.quantity || 1))
      }));
    }
  }, [extendForm.new_end_date, selectedRental, devices]);

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/rentals/${selectedRental.id}/extend`, extendForm);
      showToast('Rental extended and notification sent.', 'success');
      setShowExtendModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to extend rental.', 'error');
    }
  };

  // Soft Delete Rental
  const handleSoftDelete = async (id) => {
    if (!window.confirm('Move booking record to Deleted History?')) return;
    try {
      await api.delete(`/rentals/${id}`);
      showToast('Booking moved to Deleted History.', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete rental.', 'error');
    }
  };

  // Restore Rental
  const handleRestoreRental = async (id) => {
    try {
      await api.post(`/rentals/${id}/restore`);
      showToast('Booking restored successfully.', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to restore rental.', 'error');
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (id) => {
    if (!window.confirm('WARNING: Permanently delete this rental record? This cannot be undone.')) return;
    try {
      await api.delete(`/rentals/${id}/permanent`);
      showToast('Rental record permanently deleted.', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to permanently delete rental.', 'error');
    }
  };

  // Filter listings
  const filteredRentals = (showDeletedHistory ? deletedRentals : rentals).filter(r => {
    const matchesSearch = r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(r.id).includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {showDeletedHistory ? 'Deleted Rentals History' : 'Rental Bookings'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {showDeletedHistory 
              ? 'Restore or permanently clean deleted rental invoices.' 
              : 'Create new bookings, extend periods, process returns, and log late charges.'}
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
            {showDeletedHistory ? 'Active Bookings' : 'Deleted History'}
          </button>

          {!showDeletedHistory && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} /> Create Rental
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Control */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <input
            type="text"
            placeholder="Search customer, device, booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:bg-white outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {!showDeletedHistory && (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {['All', 'Active', 'Returned', 'Overdue', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                  statusFilter === tab
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rentals Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-medium">No booking invoices found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Rental Invoice</th>
                  <th className="py-4 px-3">Customer</th>
                  <th className="py-4 px-3">Device Selected</th>
                  <th className="py-4 px-3">Qty</th>
                  <th className="py-4 px-3">Duration</th>
                  <th className="py-4 px-3 text-right">Invoiced Amount</th>
                  <th className="py-4 px-3 text-right">Deposit Amount</th>
                  <th className="py-4 px-3">Payment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredRentals.map((rental) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isSoon = !rental.actual_return_date && rental.end_date >= todayStr && 
                    (new Date(rental.end_date) - new Date(todayStr)) <= 24*60*60*1000;

                  return (
                    <tr key={rental.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900">#{String(rental.id).padStart(5, '0')}</span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                            rental.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                            rental.status === 'Returned' ? 'bg-emerald-50 text-emerald-600' :
                            rental.status === 'Cancelled' ? 'bg-slate-100 text-slate-500' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {rental.status}
                          </span>
                          {isSoon && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-bold rounded uppercase tracking-wider animate-pulse">
                              Due Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{rental.customer_name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-none">{rental.customer_phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                            {rental.device_image ? (
                              <img src={rental.device_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">📦</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 uppercase leading-none">{rental.device_name}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-1 leading-none">S/N: {rental.device_serial}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-bold text-slate-700">
                        {rental.quantity || 1}
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-0.5">
                          <p className="text-slate-600 font-bold">{new Date(rental.start_date).toLocaleDateString()} to {new Date(rental.end_date).toLocaleDateString()}</p>
                          {rental.actual_return_date && (
                            <p className="text-[9px] text-emerald-600 font-medium">Returned on: {new Date(rental.actual_return_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <p className="font-bold text-slate-850">₹{rental.rental_amount}</p>
                        {rental.late_fee > 0 && <p className="text-[9px] text-red-500 font-bold leading-none mt-0.5">Late: +₹{rental.late_fee}</p>}
                        {rental.damage_fee > 0 && <p className="text-[9px] text-orange-500 font-bold leading-none mt-0.5">Damage: +₹{rental.damage_fee}</p>}
                      </td>
                      <td className="py-4 px-3 text-right text-slate-500 font-bold">₹{rental.deposit_amount}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          rental.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                          rental.payment_status === 'Waived' ? 'bg-slate-100 text-slate-500' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {rental.payment_status}
                        </span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-none">{rental.payment_method}</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {showDeletedHistory ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRestoreRental(rental.id)}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(rental.id)}
                              className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end items-center">
                            {rental.status === 'Active' || rental.status === 'Overdue' ? (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(rental.id)}
                                  className="px-2 py-1.5 bg-cyan-55 text-cyan-600 border border-cyan-100 rounded-lg hover:bg-cyan-100 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleReturnClick(rental)}
                                  className="px-2 py-1.5 bg-emerald-55 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                >
                                  Return
                                </button>
                                <button
                                  onClick={() => handleExtendClick(rental)}
                                  className="px-2 py-1.5 bg-violet-55 text-violet-600 border border-violet-100 rounded-lg hover:bg-violet-100 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                >
                                  Extend
                                </button>
                              </>
                            ) : null}
                            <button
                              onClick={() => handleEditClick(rental)}
                              className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg border border-cyan-100 hover:bg-cyan-100 transition-colors"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(rental.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CREATE/EDIT RENTAL DIALOG ─── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFormModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowFormModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              {formMode === 'add' ? 'Log Rental Booking' : 'Modify Booking Details'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Profile *</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-700"
                >
                  <option value="">Select a Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Device Selection *</label>
                <select
                  required
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-700"
                >
                  <option value="">Select a Device</option>
                  {devices.map(d => {
                    const currentBooking = formMode === 'edit' && parseInt(formData.id) === selectedRental?.id ? selectedRental : null;
                    const isThisDevice = currentBooking && currentBooking.device_id === d.id;
                    const effectiveAvailable = d.availableQuantity + (isThisDevice ? (currentBooking.quantity || 1) : 0);
                    const isOutOfStock = effectiveAvailable <= 0;

                    return (
                      <option 
                        key={d.id} 
                        value={d.id} 
                        disabled={formMode === 'add' ? d.availableQuantity <= 0 : isOutOfStock}
                      >
                        {d.brand} {d.name} [{d.serial_number}] 
                        {d.availableQuantity <= 0 
                          ? ' (OUT OF STOCK)' 
                          : ` (Avail: ${d.availableQuantity}/${d.totalQuantity} - ₹${d.rental_price}/day)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Return Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Booking Qty *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850 font-bold"
                    placeholder="1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-705"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Status</label>
                  <select
                    value={formData.payment_status || 'Paid'}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-705"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Rental Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.rental_amount}
                    onChange={(e) => setFormData({ ...formData, rental_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Security Deposit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Booking Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-850 resize-none"
                  placeholder="Additional logistics notes..."
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PROCESS RETURN MODAL ─── */}
      {showReturnModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReturnModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowReturnModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Finalize Rental Return</h2>
            <p className="text-xs text-slate-500 mb-6">{selectedRental.device_name} [SN: {selectedRental.device_serial}]</p>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Device Condition</label>
                  <select
                    value={returnForm.return_condition}
                    onChange={(e) => setReturnForm({ ...returnForm, return_condition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-700"
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Damage Fee (₹)</label>
                  <input
                    type="number"
                    value={returnForm.damage_fee}
                    onChange={(e) => setReturnForm({ ...returnForm, damage_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Damage Notes / Return Observations</label>
                <textarea
                  rows={2}
                  value={returnForm.damage_notes}
                  onChange={(e) => setReturnForm({ ...returnForm, damage_notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800 resize-none"
                  placeholder="Report screen scratches, dents, missing cables, etc."
                />
              </div>

              <div className="flex items-center gap-2.5 py-2">
                <input
                  type="checkbox"
                  id="markRepair"
                  checked={returnForm.mark_repair}
                  onChange={(e) => setReturnForm({ ...returnForm, mark_repair: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="markRepair" className="text-xs text-slate-600 font-bold select-none cursor-pointer">
                  Mark Device Status as "Under Repair"
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PROCESS EXTENSION MODAL ─── */}
      {showExtendModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExtendModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-sm w-full p-6 sm:p-8 shadow-2xl relative">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowExtendModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Extend Rental Period</h2>
            <p className="text-xs text-slate-500 mb-6">{selectedRental.device_name} [SN: {selectedRental.device_serial}]</p>
            
            <form onSubmit={handleExtendSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">New End Date *</label>
                <input
                  type="date"
                  required
                  min={selectedRental.end_date.split('T')[0]}
                  value={extendForm.new_end_date}
                  onChange={(e) => setExtendForm({ ...extendForm, new_end_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Additional Rental Charge (₹) *</label>
                <input
                  type="number"
                  required
                  value={extendForm.additional_amount}
                  onChange={(e) => setExtendForm({ ...extendForm, additional_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRentals;
