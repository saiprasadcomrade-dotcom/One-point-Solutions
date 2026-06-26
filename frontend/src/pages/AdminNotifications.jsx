import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Bell, Mail, MessageSquare, Phone, Search, 
  CheckCircle, XCircle, AlertTriangle, Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNotifications = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Preview modal states
  const [activePreview, setActivePreview] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setLogs(res.data);
    } catch (err) {
      showToast('Failed to load notifications history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleShowPreview = (log) => {
    setActivePreview(log);
    setShowPreviewModal(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Sent': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Failed': return 'bg-red-50 text-red-650 border border-red-100';
      case 'Not Configured': return 'bg-amber-50 text-amber-600 border border-amber-100';
      default: return 'bg-slate-50 text-slate-550 border border-slate-200';
    }
  };

  const getChannelIcon = (chan) => {
    switch (chan) {
      case 'Email': return <Mail size={14} className="text-cyan-550 shrink-0" />;
      case 'WhatsApp': return <MessageSquare size={14} className="text-emerald-500 shrink-0" />;
      default: return <Phone size={14} className="text-indigo-400 shrink-0" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === 'All' || log.channel === channelFilter;
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Notifications Log</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">Audit transactional delivery records, alerts, reminders, and configuration warnings.</p>
      </div>

      {/* Controller */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by customer, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:bg-white outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex gap-4">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-600 font-bold uppercase tracking-wider"
          >
            <option value="All">All Channels</option>
            <option value="Email">Email Only</option>
            <option value="WhatsApp">WhatsApp Only</option>
            <option value="SMS">SMS Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-600 font-bold uppercase tracking-wider"
          >
            <option value="All">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
            <option value="Not Configured">Not Configured</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <Bell className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-medium">No notification alerts found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Sent Date</th>
                  <th className="py-4 px-3">Recipient</th>
                  <th className="py-4 px-3">Alert Type</th>
                  <th className="py-4 px-3">Channel</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-3">Preview</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-3">
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{log.customer_name || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-none">{log.email || log.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-700 font-bold uppercase tracking-wide">
                      {log.type}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600">
                        {getChannelIcon(log.channel)}
                        {log.channel}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-550 font-normal max-w-[200px] truncate">
                      {log.message_preview || 'No message template logged.'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleShowPreview(log)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ALERT PREVIEW DIALOG ─── */}
      {showPreviewModal && activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowPreviewModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Message Payload Preview</h2>
            <p className="text-xs text-slate-500 mb-6">Channel: {activePreview.channel} | Status: {activePreview.status}</p>
            
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-cyan-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[40vh] text-left">
              {activePreview.message_preview || 'No preview logged.'}
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
