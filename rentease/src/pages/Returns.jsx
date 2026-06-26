import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { sampleBookings } from '../data/bookings';

export default function Returns() {
  const activeBookings = sampleBookings.filter(b => b.status === 'Active');

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Return Management</h1>
            <p className="text-gray-400 mt-3">Schedule returns for your rented equipment</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card p-6">
            {activeBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active rentals to return</p>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-4"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">{b.device}</p>
                      <p className="text-gray-500 text-xs">Booking: {b.id} | Qty: {b.quantity}</p>
                      <p className="text-gray-500 text-xs">Customer: {b.customer}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-300`}>
                        Due: {b.date}
                      </span>
                      <button className="btn-primary !py-2 !px-4 text-xs">
                        Schedule Return
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Return Policy</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>• Equipment must be returned in the same condition as received.</p>
              <p>• A 24-hour grace period is provided for late returns.</p>
              <p>• Late returns beyond 24 hours will incur additional charges.</p>
              <p>• All accessories and packaging must be included with the return.</p>
              <p>• Our team will inspect the equipment upon return pickup.</p>
              <p>• Security deposits are refunded within 5-7 business days after inspection.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
