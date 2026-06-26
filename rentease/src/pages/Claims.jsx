import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';

export default function Claims() {
  const [form, setForm] = useState({ bookingId: '', device: '', issue: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Damage claim submitted successfully. Our team will review it within 24 hours.');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Damage Claims</h1>
            <p className="text-gray-400 mt-3">Report any damage or issues with rented equipment</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Booking ID</label>
                <input type="text" required value={form.bookingId}
                  onChange={e => setForm(p => ({ ...p, bookingId: e.target.value }))}
                  placeholder="e.g. BKN-001" className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Device</label>
                <input type="text" required value={form.device}
                  onChange={e => setForm(p => ({ ...p, device: e.target.value }))}
                  placeholder="Device name" className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Issue Type</label>
              <select value={form.issue} onChange={e => setForm(p => ({ ...p, issue: e.target.value }))} required className="input-field">
                <option value="">Select issue type</option>
                <option value="physical-damage">Physical Damage</option>
                <option value="malfunction">Device Malfunction</option>
                <option value="missing-parts">Missing Parts/Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea rows="4" required value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe the issue in detail..." className="input-field min-h-[120px]" />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full text-center py-3"
            >
              Submit Claim
            </motion.button>
          </form>
        </ScrollReveal>
      </div>
    </div>
  );
}
