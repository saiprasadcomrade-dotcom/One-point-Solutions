import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Laptop, Users, Calendar, AlertTriangle, ArrowRight, PlusCircle, 
  FileText, TrendingUp, Package, ShieldCheck, DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart data state
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [rentalTrends, setRentalTrends] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, logsRes, paymentsRes, rentalsRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/activity-logs'),
          api.get('/payments'),
          api.get('/rentals')
        ]);

        setSummary(summaryRes.data);
        setLogs(logsRes.data.slice(0, 5)); // show latest 5 logs

        // 1. Process Revenue Chart Data
        const monthlyRevenue = {};
        paymentsRes.data.forEach(p => {
          if (p.status === 'Paid') {
            const date = new Date(p.created_at);
            const month = date.toLocaleString('en-US', { month: 'short' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
          }
        });
        const revenueChart = Object.keys(monthlyRevenue).map(month => ({
          month,
          revenue: monthlyRevenue[month]
        }));
        setRevenueData(revenueChart.length ? revenueChart : [{ month: 'June', revenue: 0 }]);

        // 2. Process Device Status Pie Data
        const inv = summaryRes.data.inventory;
        setStatusData([
          { name: 'Available', value: inv.available, color: '#06B6D4' },
          { name: 'Rented', value: inv.rented, color: '#3B82F6' },
          { name: 'Repair', value: inv.repair, color: '#EF4444' }
        ]);

        // 3. Process Rental Trends Data (Active vs Returned)
        const trends = {};
        rentalsRes.data.forEach(r => {
          const date = new Date(r.created_at);
          const month = date.toLocaleString('en-US', { month: 'short' });
          if (!trends[month]) {
            trends[month] = { active: 0, returned: 0 };
          }
          const qty = r.quantity || 1;
          if (r.status === 'Returned') {
            trends[month].returned += qty;
          } else if (r.status === 'Active' || r.status === 'Overdue') {
            trends[month].active += qty;
          }
        });
        const trendsChart = Object.keys(trends).map(month => ({
          month,
          Active: trends[month].active,
          Returned: trends[month].returned
        }));
        setRentalTrends(trendsChart.length ? trendsChart : [{ month: 'June', Active: 0, Returned: 0 }]);

      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest">Synchronizing Live Performance...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Devices', value: summary.inventory.total, sub: 'In fleet inventory', icon: Laptop, color: 'from-blue-600 to-indigo-600', path: '/admin/devices?filter=All' },
    { label: 'Available Units', value: summary.inventory.available, sub: 'Ready to rent', icon: ShieldCheck, color: 'from-cyan-500 to-blue-500', path: '/admin/devices?filter=Available' },
    { label: 'Currently Rented', value: summary.inventory.rented, sub: 'Out with customers', icon: Package, color: 'from-violet-500 to-purple-600', path: '/admin/devices?filter=Rented' },
    { label: 'Under Repair', value: summary.inventory.repair, sub: 'Maintenance diagnostic', icon: AlertTriangle, color: 'from-rose-500 to-red-600', path: '/admin/devices?filter=Repair' },
    { label: 'Active Customers', value: summary.customers.active, sub: 'Verified accounts', icon: Users, color: 'from-indigo-500 to-blue-600', path: '/admin/customers' },
    { label: 'Active Rentals', value: summary.rentals.active, sub: 'Running bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500', path: '/admin/rentals?filter=Active' },
    { label: 'Overdue Returns', value: summary.rentals.overdue, sub: 'Action required', icon: AlertTriangle, color: 'from-red-500 to-pink-600', path: '/admin/rentals?filter=Overdue' },
    { label: 'Completed Rentals', value: summary.rentals.returned, sub: 'Devices returned', icon: ShieldCheck, color: 'from-emerald-500 to-teal-600', path: '/admin/rentals?filter=Returned' },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-700">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-1.5">Real-time status metrics, revenue collection, inventory tracking, and damage logs.</p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                <card.icon size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 leading-none">{card.value}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid: Charts & Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue line chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={16} className="text-cyan-500" /> Monthly Revenue Trend</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Rental fee collections across active months</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400">Total Invoiced</p>
              <p className="text-lg font-black text-emerald-600">₹{(summary.revenue.paid).toLocaleString()}</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <Area type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Status Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Device Status Distribution</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Availability breakdown of device assets</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Devices`, 'Inventory']} contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-4">
            {statusData.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[10px] font-bold text-slate-500">{d.name}</span>
                </div>
                <p className="text-xs font-black text-slate-900 mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Actions & Logs & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Admin Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { label: 'Add Device', desc: 'Register a new electronics item', action: () => navigate('/admin/devices?add=true'), icon: PlusCircle, color: 'text-cyan-500 bg-cyan-50 border-cyan-100 hover:bg-cyan-100/50' },
              { label: 'Add Customer', desc: 'Create profile with KYC check', action: () => navigate('/admin/customers?add=true'), icon: Users, color: 'text-blue-500 bg-blue-55 border-blue-100 hover:bg-blue-100/50' },
              { label: 'Create Rental Booking', desc: 'Log a new booking reservation', action: () => navigate('/admin/rentals?add=true'), icon: Calendar, color: 'text-violet-500 bg-violet-50 border-violet-100 hover:bg-violet-100/50' },
              { label: 'Generate Reports', desc: 'Export spreadsheets & PDF files', action: () => navigate('/admin/reports'), icon: FileText, color: 'text-teal-500 bg-teal-50 border-teal-100 hover:bg-teal-100/50' }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className={`w-full p-3.5 border rounded-2xl flex items-start gap-3 text-left transition-all duration-200 cursor-pointer ${btn.color}`}
              >
                <btn.icon size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none">{btn.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">{btn.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly trends chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Rental Volumes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '10px' }} />
                <Bar dataKey="Active" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Returned" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Log Snippet */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Audit Trail Log</h3>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="text-[10px] text-cyan-500 font-bold uppercase hover:underline flex items-center gap-1 cursor-pointer"
            >
              See all <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-3.5">
            {logs.map((log) => {
              const date = new Date(log.created_at);
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={log.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-none">{log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal truncate">{log.details}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{timeString}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
