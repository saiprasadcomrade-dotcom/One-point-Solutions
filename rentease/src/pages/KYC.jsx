import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';

export default function KYC() {
  const [form, setForm] = useState({
    fullName: '', dob: '', idType: 'passport', idNumber: '', address: '', city: '', zip: '',
  });
  const [files, setFiles] = useState({ idFront: null, idBack: null, selfie: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('KYC documents submitted for verification. You will be notified once verified.');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">KYC Verification</h1>
            <p className="text-gray-400 mt-3">Complete your identity verification to start renting</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                <input type="text" required value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="As on ID proof" className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Date of Birth</label>
                <input type="date" required value={form.dob}
                  onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                  className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">ID Type</label>
                <select value={form.idType}
                  onChange={e => setForm(p => ({ ...p, idType: e.target.value }))}
                  className="input-field">
                  <option value="passport">Passport</option>
                  <option value="drivers-license">Driver&apos;s License</option>
                  <option value="national-id">National ID</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">ID Number</label>
                <input type="text" required value={form.idNumber}
                  onChange={e => setForm(p => ({ ...p, idNumber: e.target.value }))}
                  placeholder="Enter ID number" className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">ID Front</label>
                <input type="file" accept="image/*" required
                  onChange={e => setFiles(p => ({ ...p, idFront: e.target.files[0] }))}
                  className="input-field text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent-cyan/10 file:text-accent-cyan file:text-xs" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">ID Back</label>
                <input type="file" accept="image/*" required
                  onChange={e => setFiles(p => ({ ...p, idBack: e.target.files[0] }))}
                  className="input-field text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent-cyan/10 file:text-accent-cyan file:text-xs" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Selfie</label>
                <input type="file" accept="image/*" required
                  onChange={e => setFiles(p => ({ ...p, selfie: e.target.files[0] }))}
                  className="input-field text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent-cyan/10 file:text-accent-cyan file:text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Address</label>
                <input type="text" required value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Street address" className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">ZIP Code</label>
                <input type="text" required value={form.zip}
                  onChange={e => setForm(p => ({ ...p, zip: e.target.value }))}
                  placeholder="ZIP" className="input-field" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full text-center py-3"
            >
              Submit for Verification
            </motion.button>
          </form>
        </ScrollReveal>
      </div>
    </div>
  );
}
