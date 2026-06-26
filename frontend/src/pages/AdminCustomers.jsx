import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Trash2, Edit, X, User, Mail, 
  Phone, MapPin, Download, History, Calendar, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCustomers = () => {
  const { showToast } = useToast();
  const location = useLocation();

  const [customers, setCustomers] = useState([]);
  const [deletedCustomers, setDeletedCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [showDeletedHistory, setShowDeletedHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeHistoryCustomer, setActiveHistoryCustomer] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    id_proof: 'Aadhaar',
    gov_id_number: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const [customersRes, deletedRes, rentalsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/customers/deleted'),
        api.get('/rentals')
      ]);
      setCustomers(customersRes.data);
      setDeletedCustomers(deletedRes.data);
      setRentals(rentalsRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load customer catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Sync dashboard redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const addParam = params.get('add');
    if (addParam === 'true') {
      handleAddClick();
    }
  }, [location.search]);

  const handleAddClick = () => {
    setFormMode('add');
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      id_proof: 'Aadhaar',
      gov_id_number: '',
      notes: ''
    });
    setShowFormModal(true);
  };

  const handleEditClick = (customer) => {
    setFormMode('edit');
    setFormData({ ...customer });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill in Name, Email, and Phone.', 'warning');
      return;
    }

    try {
      if (formMode === 'add') {
        await api.post('/customers', formData);
        showToast('Customer profile registered successfully!', 'success');
      } else {
        await api.put(`/customers/${formData.id}`, formData);
        showToast('Customer profile updated.', 'success');
      }
      setShowFormModal(false);
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed.', 'error');
    }
  };

  // Soft Delete Customer
  const handleSoftDelete = async (id) => {
    if (!window.confirm('Move customer to Deleted History? (Rental records will remain safe)')) return;
    try {
      await api.delete(`/customers/${id}`);
      showToast('Customer moved to Deleted History.', 'success');
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete customer.', 'error');
    }
  };

  // Restore Customer
  const handleRestoreCustomer = async (id) => {
    try {
      await api.post(`/customers/${id}/restore`);
      showToast('Customer profile restored.', 'success');
      fetchCustomers();
    } catch (err) {
      showToast('Failed to restore customer.', 'error');
    }
  };

  // Permanent Delete Customer
  const handlePermanentDelete = async (customer) => {
    const historyCount = rentals.filter(r => r.customer_id === customer.id).length;
    let warningMsg = 'Permanently delete this customer from database?';
    if (historyCount > 0) {
      warningMsg = `CRITICAL WARNING: This customer has ${historyCount} rental bookings in their history. Permanent deletion may affect historical reports. Do you still wish to proceed?`;
    }

    if (!window.confirm(warningMsg)) return;

    try {
      await api.delete(`/customers/${customer.id}/permanent`);
      showToast('Customer permanently deleted from database.', 'success');
      fetchCustomers();
    } catch (err) {
      showToast('Failed to permanently delete customer.', 'error');
    }
  };

  // Export Customer List to CSV
  const handleExportCSV = () => {
    const list = showDeletedHistory ? deletedCustomers : customers;
    if (list.length === 0) {
      showToast('No customer records to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'ID Proof Type', 'Gov ID Number', 'Created At'];
    const rows = list.map(c => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.phone,
      `"${c.address || ''}"`,
      c.id_proof || '',
      c.gov_id_number || '',
      c.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', showDeletedHistory ? 'deleted_customers.csv' : 'active_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer spreadsheet exported!', 'success');
  };

  // View Customer Rental History
  const handleShowHistory = (customer) => {
    const customerHistory = rentals.filter(r => r.customer_id === customer.id);
    setActiveHistoryCustomer({
      profile: customer,
      bookings: customerHistory
    });
    setShowHistoryModal(true);
  };

  // Filter listings
  const filteredCustomers = (showDeletedHistory ? deletedCustomers : customers).filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.phone.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {showDeletedHistory ? 'Deleted Customers History' : 'Customer Database'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {showDeletedHistory 
              ? 'Restore or permanently remove customers. Warning tags display on active records.' 
              : 'Add and search customers, upload ID documents, and audit rental history.'}
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
            {showDeletedHistory ? 'Active Customers' : 'Deleted History'}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          {!showDeletedHistory && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Search controller */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:bg-white outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Grid List Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-medium">No customer profiles found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Customer info</th>
                  <th className="py-4 px-3">Contact</th>
                  <th className="py-4 px-3">Identity Proof</th>
                  <th className="py-4 px-3">Address</th>
                  <th className="py-4 px-3">Previous Orders</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredCustomers.map((customer) => {
                  const historyCount = rentals.filter(r => r.customer_id === customer.id).length;
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-450 border border-slate-200 shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 uppercase leading-none">{customer.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-none">Registered: {new Date(customer.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 leading-none"><Mail size={12} className="text-slate-400" /> {customer.email}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1.5 leading-none"><Phone size={12} className="text-slate-400" /> {customer.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded uppercase font-bold">{customer.id_proof}</span>
                          {customer.gov_id_number && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{customer.gov_id_number}</p>}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-slate-500 max-w-[150px] truncate" title={customer.address}>
                        {customer.address || 'N/A'}
                      </td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => handleShowHistory(customer)}
                          className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg border border-cyan-100 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <History size={12} /> {historyCount} Rentals
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {showDeletedHistory ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRestoreCustomer(customer.id)}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] font-bold cursor-pointer"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(customer)}
                              className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditClick(customer)}
                              className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg border border-cyan-100 hover:bg-cyan-100 transition-colors cursor-pointer"
                              title="Edit Profile"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(customer.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Move to Trash"
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

      {/* ─── ADD/EDIT CUSTOMER DIALOG ─── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFormModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowFormModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              {formMode === 'add' ? 'Register Customer' : 'Edit Customer Credentials'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-800"
                  placeholder="e.g. Rohan Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-800"
                  placeholder="rohan@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-800"
                  placeholder="+91 91234 56789"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">KYC ID Proof Type</label>
                  <select
                    value={formData.id_proof}
                    onChange={(e) => setFormData({ ...formData, id_proof: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-700"
                  >
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Government ID Number</label>
                  <input
                    type="text"
                    value={formData.gov_id_number}
                    onChange={(e) => setFormData({ ...formData, gov_id_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-800 font-mono"
                    placeholder="1234-5678-9012"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-800"
                  placeholder="e.g. Bangalore, India"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 focus:bg-white text-slate-800 resize-none"
                  placeholder="e.g. Corporate contact"
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
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOMER RENTAL HISTORY MODAL ─── */}
      {showHistoryModal && activeHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowHistoryModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Customer Rental Audit</h2>
            <p className="text-xs text-slate-500 mb-6">{activeHistoryCustomer.profile.name} (Rentals: {activeHistoryCustomer.bookings.length})</p>

            <div className="space-y-4">
              {activeHistoryCustomer.bookings.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">This customer has no previous bookings.</p>
              ) : (
                <div className="space-y-3">
                  {activeHistoryCustomer.bookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 uppercase">Booking #{String(booking.id).padStart(5, '0')}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            booking.status === 'Active' ? 'bg-blue-100 text-blue-600' :
                            booking.status === 'Returned' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-700 uppercase">{booking.device_name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Rental Period: {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>

                      <div className="sm:text-right space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Transaction</p>
                        <p className="font-bold text-slate-800">Rental: ₹{booking.rental_amount}</p>
                        <p className="text-[10px] text-slate-500 leading-none">Deposit: ₹{booking.deposit_amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
