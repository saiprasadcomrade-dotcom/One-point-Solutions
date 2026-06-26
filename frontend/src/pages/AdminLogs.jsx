import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { History, Search, Info, ShieldAlert } from 'lucide-react';

const AdminLogs = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/activity-logs');
        setLogs(res.data);
      } catch (err) {
        showToast('Failed to load activity logs.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [showToast]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.admin_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const modules = ['All', 'Auth', 'Devices', 'Customers', 'Rentals', 'Damages', 'Notifications', 'Settings'];

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Security Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">Immutable audit trail of administrator sessions, data creations, edits, deletions, restorations, and billing changes.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by action, details, actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:bg-white outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 text-slate-650 font-bold uppercase tracking-wider"
        >
          {modules.map(m => (
            <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>
          ))}
        </select>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <ShieldAlert className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-medium">No audit logs found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-3">Module</th>
                  <th className="py-4 px-3">Action logged</th>
                  <th className="py-4 px-3">Actor</th>
                  <th className="py-4 px-6">Event details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredLogs.map((log) => {
                  const date = new Date(log.created_at);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                      <td className="py-4 px-6 text-slate-500">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded uppercase font-bold">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-900 font-bold uppercase tracking-wider">
                        {log.action}
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-bold">
                        {log.admin_name}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-normal">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
