import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  AlertTriangle, CheckCircle, Search, Edit, X, 
  User, Laptop, FileText, Settings, Hammer, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDamages = () => {
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    status: 'Pending',
    repair_cost: 0,
    description: ''
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/damage-reports');
      setReports(res.data);
    } catch (err) {
      showToast('Failed to load damage diagnostics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleEditClick = (report) => {
    setSelectedReport(report);
    setFormData({
      id: report.id,
      status: report.status,
      repair_cost: report.repair_cost,
      description: report.description
    });
    setShowEditModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/damage-reports/${formData.id}`, formData);
      showToast('Damage report updated successfully.', 'success');
      setShowEditModal(false);
      fetchReports();
    } catch (err) {
      showToast('Failed to update damage report.', 'error');
    }
  };

  // Severity style helper
  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-red-950/20 text-red-600 border border-red-500/30';
      case 'High': return 'bg-orange-950/20 text-orange-600 border border-orange-500/30';
      case 'Medium': return 'bg-amber-950/20 text-amber-600 border border-amber-500/30';
      default: return 'bg-blue-950/20 text-blue-600 border border-blue-500/30';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Under Review': return 'bg-amber-100 text-amber-600 border-amber-250';
      default: return 'bg-red-100 text-red-600 border-red-200';
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.device_serial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Hardware Damage Incidents</h1>
        <p className="text-xs text-slate-500 mt-1.5">Diagnose and manage damaged electronic devices, assess severities, log repair charges, and restore operational status.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search device, client, serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:bg-white outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex gap-2">
          {['All', 'Pending', 'Under Review', 'Resolved'].map(tab => (
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
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <Info className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-medium">No device damage incidents recorded.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Incident details</th>
                  <th className="py-4 px-3">Device (SN)</th>
                  <th className="py-4 px-3">Responsible Customer</th>
                  <th className="py-4 px-3">Severity</th>
                  <th className="py-4 px-3 text-right">Repair Cost</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="py-4 px-6">
                      <div className="max-w-[200px]">
                        <p className="font-bold text-slate-900 leading-none">Case #{String(report.id).padStart(4, '0')}</p>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1.5 line-clamp-2">{report.description}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 leading-none">Logged: {new Date(report.damage_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div>
                        <p className="font-bold text-slate-900 uppercase leading-none">{report.device_name}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1 leading-none">{report.device_serial}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div>
                        <p className="font-bold text-slate-900 uppercase leading-none">{report.customer_name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-none">{report.customer_phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${getSeverityStyle(report.severity)}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right font-bold text-slate-850">₹{report.repair_cost}</td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 border text-[9px] font-bold rounded uppercase ${getStatusStyle(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleEditClick(report)}
                        className="px-2.5 py-1.5 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg hover:bg-cyan-100 transition-colors text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Hammer size={12} /> Audit Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── AUDIT DAMAGE DIALOG ─── */}
      {showEditModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-sm w-full p-6 sm:p-8 shadow-2xl relative">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowEditModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Audit Damage Case</h2>
            <p className="text-xs text-slate-500 mb-6">{selectedReport.device_name} [SN: {selectedReport.device_serial}]</p>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Resolution Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved (Restores Device)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Repair Cost (₹)</label>
                <input
                  type="number"
                  value={formData.repair_cost}
                  onChange={(e) => setFormData({ ...formData, repair_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Damage Description / Diagnostic details</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-800 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDamages;
