import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { ShieldAlert, CheckCircle, XCircle, RefreshCcw, Search, Clock, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Claims = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === 'Paid') {
        const res = await api.post('/payment/success', { payment_id: id });
        showToast('Payment Successful', 'success');
        if (res.data.emailStatus === 'Sent') {
          showToast('Email Sent', 'success');
        } else if (res.data.emailStatus === 'Failed' || res.data.emailStatus === 'Not Configured') {
          showToast('Email Failed', 'error');
        }
      } else {
        await api.patch(`/payments/${id}/status`, { status });
        showToast('Payment status updated.', 'success');
      }
      fetchPayments();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      showToast('Failed to update status.', 'error');
    }
  };

  const damageClaims = payments.filter(p => p.payment_type === 'Damage');
  const totalClaimed = damageClaims.reduce((acc, p) => acc + p.amount, 0);
  const collectedClaims = damageClaims.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const pendingClaims = damageClaims.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

  if (loading && payments.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
      <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">Loading claims...</p>
    </div>
  );

  const stats = [
    { label: 'Total Claims', value: damageClaims.length, icon: ShieldAlert, color: 'text-red-400 bg-red-500/10', sub: `₹${totalClaimed.toLocaleString()} total` },
    { label: 'Pending', value: damageClaims.filter(p => p.status === 'Pending').length, icon: Clock, color: 'text-yellow-400 bg-yellow-500/10', sub: `₹${pendingClaims.toLocaleString()} pending` },
    { label: 'Collected', value: damageClaims.filter(p => p.status === 'Paid').length, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10', sub: `₹${collectedClaims.toLocaleString()} collected` },
    { label: 'Waived', value: damageClaims.filter(p => p.status === 'Waived').length, icon: XCircle, color: 'text-slate-400 bg-slate-500/10', sub: 'Written off' },
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-3">
        <div>
          <span className="bg-gradient-to-r from-cyan-500 to-purple-500 w-8 h-1 rounded-full inline-block mb-1.5"></span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Damage <span className="text-gradient">Claims</span></h1>
          <p className="text-xs text-slate-400 mt-1">Manage damage-related payments and claims.</p>
        </div>
        <button onClick={fetchPayments}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
            {stat.sub && <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2rem] border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-850 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">All Damage Claims</h2>
          <div className="flex items-center bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 gap-2">
            <Search size={13} className="text-slate-500" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-32" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-900">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Device</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {damageClaims.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                        {payment.user_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{payment.user_name}</p>
                        <p className="text-[10px] text-slate-500">{payment.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">{payment.device_name}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-red-400">₹{payment.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{payment.notes || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      payment.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      payment.status === 'Waived' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {payment.status === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(payment.id, 'Paid')}
                            className="w-7 h-7 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/20 transition-all" title="Mark Paid">
                            <CheckCircle size={13} />
                          </button>
                          <button onClick={() => handleStatusUpdate(payment.id, 'Waived')}
                            className="w-7 h-7 bg-slate-500/10 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-500 hover:text-white border border-slate-500/20 transition-all" title="Waive">
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {payment.status !== 'Pending' && (
                        <span className="text-[10px] text-slate-600 font-medium">Settled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {damageClaims.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                        <ShieldAlert size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium text-xs">No damage claims recorded.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Claims;
