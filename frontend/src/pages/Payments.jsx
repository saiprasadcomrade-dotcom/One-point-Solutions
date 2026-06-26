import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { DollarSign, CheckCircle, XCircle, RefreshCcw, Search, Clock, CreditCard, Banknote } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Payments = () => {
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Waived': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const getTypeStyle = (type) => {
    return type === 'Rental' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  if (loading && payments.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
      <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">Loading payments...</p>
    </div>
  );

  const totalCollected = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

  const stats = [
    { label: 'Total Transactions', value: payments.length, icon: CreditCard, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Collected', value: `₹${totalCollected.toLocaleString()}`, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10', sub: `${payments.filter(p => p.status === 'Paid').length} payments` },
    { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, icon: Clock, color: 'text-yellow-400 bg-yellow-500/10', sub: `${payments.filter(p => p.status === 'Pending').length} payments` },
    { label: 'Waived', value: payments.filter(p => p.status === 'Waived').length, icon: XCircle, color: 'text-slate-400 bg-slate-500/10', sub: 'Written off' },
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-3">
        <div>
          <span className="bg-gradient-to-r from-cyan-500 to-purple-500 w-8 h-1 rounded-full inline-block mb-1.5"></span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payment <span className="text-gradient">Ledger</span></h1>
          <p className="text-xs text-slate-400 mt-1">Track rental fees and damage claims across all transactions.</p>
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
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">All Transactions</h2>
          <div className="flex items-center bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 gap-2">
            <Search size={13} className="text-slate-500" />
            <input type="text" placeholder="Filter..." className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-32" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-900">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Device</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {payments.map((payment) => (
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
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300">{payment.device_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getTypeStyle(payment.payment_type)}`}>
                      {payment.payment_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white">₹{payment.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(payment.status)}`}>
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
                        <span className="text-[10px] text-slate-600 font-medium">{payment.status === 'Paid' ? 'Settled' : 'Waived'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                        <Banknote size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium text-xs">No transactions yet.</p>
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

export default Payments;
