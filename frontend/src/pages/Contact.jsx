import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Support', message: '' });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: 'Support', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen py-8 bg-grid-pattern">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-cyan-500/20">Connect</span>
          <h1 className="text-4xl font-black text-white tracking-tight">Contact <span className="text-gradient">RentEase</span></h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">Have questions about corporate rentals, claims, or custom devices? We are here to help 24/7.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-4 lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white mb-2">Our Office</h2>
              <div className="flex gap-4">
                <MapPin className="text-cyan-400 shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">RentEase Corporate Office</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    101, Tech Park Avenue, Block C,<br />
                    Vasant Kunj, New Delhi, 110070
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Mail className="text-purple-400 shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Email Us</p>
                  <p className="text-xs text-slate-400 mt-1">support@rentease.com</p>
                  <p className="text-xs text-slate-400">corporate@rentease.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="text-blue-400 shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Call Us</p>
                  <p className="text-xs text-slate-400 mt-1">+91 11 4055 9088</p>
                  <p className="text-xs text-slate-400">+91 98110 54321</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="text-cyan-400 shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Working Hours</p>
                  <p className="text-xs text-slate-400 mt-1">Mon - Sat: 9:00 AM - 8:00 PM</p>
                  <p className="text-xs text-slate-400">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><MessageSquare size={16} className="text-cyan-400" /> WhatsApp Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">Ping us on WhatsApp for lightning fast responses regarding active delivery orders.</p>
              <a href="https://wa.me/919811054321" target="_blank" rel="noreferrer" className="inline-block text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Start Chat →</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Thank you for reaching out. A RentEase support representative will respond to your query within 2-4 hours.</p>
                  <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Full Name *</label>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors" placeholder="John Doe" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Email Address *</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors" placeholder="john@example.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Phone Number</label>
                      <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors" placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Topic *</label>
                      <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors">
                        <option value="Support">Technical Support</option>
                        <option value="Billing">Billing & Invoice</option>
                        <option value="Corporate">Corporate Bulk Booking</option>
                        <option value="Claims">Damage Claim Dispute</option>
                        <option value="Other">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Your Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors resize-none" placeholder="Describe your query in detail..." />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-55">
                    {submitting ? 'Sending...' : <><Send size={14} /> Send Message</>}
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

export default Contact;
