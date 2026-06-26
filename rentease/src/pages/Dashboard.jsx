import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiDeviceMobile, HiCube, HiCurrencyDollar, HiUserGroup, HiRefresh, HiClock } from 'react-icons/hi';
import ScrollReveal from '../components/ScrollReveal';
import { devices } from '../data/devices';
import { sampleBookings } from '../data/bookings';

const statsCards = [
  { icon: HiCube, label: 'Total Devices', value: '156', color: 'from-accent-cyan/20 to-accent-cyan/5', border: 'border-accent-cyan/20', textColor: 'text-accent-cyan' },
  { icon: HiDeviceMobile, label: 'Available Devices', value: '128', color: 'from-green-500/20 to-green-500/5', border: 'border-green-500/20', textColor: 'text-green-400' },
  { icon: HiRefresh, label: 'Active Rentals', value: '28', color: 'from-accent-purple/20 to-accent-purple/5', border: 'border-accent-purple/20', textColor: 'text-accent-purple' },
  { icon: HiCurrencyDollar, label: 'Revenue', value: '$48,290', color: 'from-yellow-500/20 to-yellow-500/5', border: 'border-yellow-500/20', textColor: 'text-yellow-400' },
  { icon: HiClock, label: 'Pending Returns', value: '12', color: 'from-red-500/20 to-red-500/5', border: 'border-red-500/20', textColor: 'text-red-400' },
  { icon: HiUserGroup, label: 'Customers', value: '892', color: 'from-accent-blue/20 to-accent-blue/5', border: 'border-accent-blue/20', textColor: 'text-accent-blue' },
];

const pieData = [
  { name: 'Laptops', value: 45 },
  { name: 'Cameras', value: 30 },
  { name: 'Projectors', value: 15 },
  { name: 'Tablets', value: 25 },
  { name: 'Gaming', value: 20 },
  { name: 'Other', value: 21 },
];

const COLORS = ['#06B6D4', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 19000 },
  { month: 'Mar', revenue: 15000 },
  { month: 'Apr', revenue: 22000 },
  { month: 'May', revenue: 28000 },
  { month: 'Jun', revenue: 35000 },
];

const statusColors = {
  'Active': 'bg-green-500/20 text-green-300',
  'Completed': 'bg-blue-500/20 text-blue-300',
  'Pending': 'bg-yellow-500/20 text-yellow-300',
};

export default function Dashboard() {
  const [counters, setCounters] = useState(statsCards.map(() => 0));

  useEffect(() => {
    const intervals = statsCards.map((_, i) => {
      return setInterval(() => {
        setCounters(prev => {
          const next = [...prev];
          if (next[i] < 100) next[i] += 2;
          return next;
        });
      }, 30);
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">Overview of your rental business performance</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className={`glass-card p-5 border ${stat.border} bg-gradient-to-br ${stat.color}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${stat.textColor}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScrollReveal delay={0.1}>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Device Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2}>
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/5">
                    <th className="text-left py-3 px-2">Booking</th>
                    <th className="text-left py-3 px-2">Customer</th>
                    <th className="text-left py-3 px-2">Device</th>
                    <th className="text-left py-3 px-2 hidden sm:table-cell">Qty</th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">Days</th>
                    <th className="text-left py-3 px-2">Total</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleBookings.slice(0, 6).map((b) => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 text-accent-cyan font-mono text-xs">{b.id}</td>
                      <td className="py-3 px-2 text-white">{b.customer}</td>
                      <td className="py-3 px-2 text-gray-300 text-xs">{b.device}</td>
                      <td className="py-3 px-2 text-gray-300 hidden sm:table-cell">{b.quantity}</td>
                      <td className="py-3 px-2 text-gray-300 hidden md:table-cell">{b.days}</td>
                      <td className="py-3 px-2 text-white font-medium">${b.total}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Device Inventory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/5">
                    <th className="text-left py-3 px-2">Device</th>
                    <th className="text-left py-3 px-2">Category</th>
                    <th className="text-left py-3 px-2 hidden sm:table-cell">Price/Day</th>
                    <th className="text-left py-3 px-2">Rating</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <img src={d.image} alt={d.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-white text-xs">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-300 text-xs">{d.category}</td>
                      <td className="py-3 px-2 text-gray-300 hidden sm:table-cell">${d.pricePerDay}</td>
                      <td className="py-3 px-2">
                        <span className="text-yellow-400 text-xs">★ {d.rating}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {d.available ? 'Available' : 'Rented'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
