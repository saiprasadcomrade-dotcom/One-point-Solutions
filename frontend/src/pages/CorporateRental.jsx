import { useState } from 'react';
import { Building, ShieldCheck, Headphones, Percent, CheckCircle, Send, Award, Users } from 'lucide-react';

const CorporateRental = () => {
  const [form, setForm] = useState({ company: '', contact: '', email: '', phone: '', qty: '5-10', duration: '30', notes: '' });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const perks = [
    { icon: Percent, title: 'Volume Discounts', desc: 'Save up to 45% on rentals extending beyond 30 days or on bulk batches exceeding 10 units.' },
    { icon: ShieldCheck, title: 'Full Damage Waiver', desc: 'No-deposit business onboarding. Add complete damage waivers covering accidentals and replacements.' },
    { icon: Headphones, title: '24/7 Priority Support', desc: 'Get a dedicated Account Manager and on-site repair/swap support within 4 hours in metro locations.' },
    { icon: Award, title: 'Flexible Tech Upgrades', desc: 'Swap or upgrade your rented laptops, workstations, or tablets mid-contract as project specs change.' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setForm({ company: '', contact: '', email: '', phone: '', qty: '5-10', duration: '30', notes: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen py-8 bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-cyan-500/20">B2B Portal</span>
          <h1 className="text-4xl font-black text-white tracking-tight">Enterprise & <span className="text-gradient">Corporate Rentals</span></h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">Get custom workstation configuration, bulk laptops for employee onboarding, and full logistics management.</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {perks.map((p, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 text-cyan-400">
                <p.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{p.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 bg-slate-900/40 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Building size={18} className="text-cyan-400" /> Corporate Onboarding</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                RentEase coordinates with IT teams to configure devices with pre-installed enterprise software profiles and security protocols.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 text-xs font-bold">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Submit Specs</h4>
                    <p className="text-[10px] text-slate-400">Describe your machine specs, counts, and duration.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 text-xs font-bold">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Receive Proposal</h4>
                    <p className="text-[10px] text-slate-400">Get a custom bulk quote and terms sheet in 4 hours.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 text-xs font-bold">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Doorstep Delivery</h4>
                    <p className="text-[10px] text-slate-400">Devices pre-imaged and delivered directly to your offices.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 text-center">
                <p className="text-[11px] text-slate-500 font-medium">Join 200+ companies leasing with RentEase.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-white mb-5">Corporate Account Inquiry</h2>
              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
                  <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Inquiry Received</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    A B2B solutions manager has been assigned to your request and will reach out with a custom quote within 4 business hours.
                  </p>
                  <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all">Submit New Inquiry</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Company Name *</label>
                      <input type="text" required value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Contact Person Name *</label>
                      <input type="text" required value={form.contact} onChange={e => setForm({...form, contact: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="Sarah Jenkins" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Work Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="sarah@company.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Contact Phone *</label>
                      <input type="text" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white" placeholder="+91 99999 88888" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Device Count Estimate</label>
                      <select value={form.qty} onChange={e => setForm({...form, qty: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white">
                        <option value="1-4">1 - 4 Units</option>
                        <option value="5-10">5 - 10 Units</option>
                        <option value="11-25">11 - 25 Units</option>
                        <option value="26-100">26 - 100 Units</option>
                        <option value="100+">100+ Units (Enterprise)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Rental Lease Duration</label>
                      <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white">
                        <option value="7">Short term (1 - 7 Days)</option>
                        <option value="30">Monthly (30 Days)</option>
                        <option value="90">Quarterly (90 Days)</option>
                        <option value="365">Annual Lease (1 Year+)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Device Requirements & Custom Configs</label>
                    <textarea rows={4} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white resize-none" 
                      placeholder="e.g. 10x M4 MacBook Pro with 64GB RAM, preinstalled Docker environment..." />
                  </div>

                  <button type="submit" disabled={submitting || !form.company || !form.contact || !form.email}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-40">
                    {submitting ? 'Submitting...' : <><Send size={14} /> Submit Inquiry</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateRental;
