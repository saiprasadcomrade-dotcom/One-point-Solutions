import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';

const repairStatuses = [
  { id: 'RPR-001', device: 'Canon EOS R5', issue: 'Lens mount issue', status: 'In Progress', date: '2026-06-10' },
  { id: 'RPR-002', device: 'MacBook Pro M3', issue: 'Keyboard replacement', status: 'Diagnosing', date: '2026-06-12' },
  { id: 'RPR-003', device: 'DJI Mavic 3 Pro', issue: 'Gimbal calibration', status: 'Completed', date: '2026-06-08' },
];

const statusColors = {
  'In Progress': 'bg-yellow-500/20 text-yellow-300',
  'Diagnosing': 'bg-accent-cyan/20 text-accent-cyan',
  'Completed': 'bg-green-500/20 text-green-300',
};

export default function Repair() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Repair Tracker</h1>
            <p className="text-gray-400 mt-3">Track the status of your device repairs</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card p-6">
            <div className="space-y-4">
              {repairStatuses.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      r.status === 'Completed' ? 'bg-green-400' :
                      r.status === 'In Progress' ? 'bg-yellow-400' : 'bg-accent-cyan'
                    }`} />
                    <div>
                      <p className="text-white font-medium text-sm">{r.device}</p>
                      <p className="text-gray-500 text-xs">{r.id} - {r.issue}</p>
                      <p className="text-gray-500 text-xs">Reported: {r.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[r.status]}`}>
                    {r.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Submit a Repair Request</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Booking ID" className="input-field flex-1" />
              <input type="text" placeholder="Describe the issue" className="input-field flex-1" />
              <button className="btn-primary !py-2.5">Submit</button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
