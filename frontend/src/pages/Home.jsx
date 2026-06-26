import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Clock, TrendingUp, Monitor, CheckCircle, 
  Mail, Phone, MapPin, ArrowRight, Laptop, Camera, ShieldAlert, FileSpreadsheet
} from 'lucide-react';
import FloatingParticles from '../components/FloatingParticles';
import ScrollReveal from '../components/ScrollReveal';

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-[#0B1120] text-slate-100 min-h-screen relative overflow-hidden font-sans pb-12">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[60vh] right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Floating Particles in Hero */}
      <FloatingParticles count={25} />

      {/* ─── NAVBAR SECTION ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap size={18} className="text-white fill-current" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">ERBS <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">SaaS</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login?demo=true')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-cyan-400 text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-1.5"
        >
          <Zap size={12} className="animate-pulse" /> Premium Electronics Management
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl"
        >
          Centralized Control for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
            Electronics Rentals
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-xl mt-6 leading-relaxed"
        >
          Ditch manuals and spreadsheets. Track high-value devices, manage customers, prevent double bookings, and view diagnostics in one state-of-the-art dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <button 
            onClick={() => navigate('/login')}
            className="px-7 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            Admin Login
          </button>
          <button 
            onClick={() => navigate('/login?demo=true')}
            className="px-7 py-3 bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            Launch Live Demo <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>

      {/* ─── FEATURE SECTION ─── */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900/60">
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Full-Suite Features</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Everything required to operate an electronics rental workspace efficiently.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Laptop, title: 'Device Fleet Control', desc: 'Track condition, status, purchase history, barcodes, and details for each individual serial number.' },
            { icon: Shield, title: 'Double Booking Prevention', desc: 'Advanced reservation engine blocks calendar conflicts, keeping rental dates secure.' },
            { icon: ShieldAlert, title: 'Damage Logs & Fees', desc: 'File diagnostics, document faults, set severities, and generate repair payment claims.' },
            { icon: Clock, title: 'Live Activity Tracking', desc: 'Detailed audit trail logs admin logins, creation, edits, restorations, and exports.' },
            { icon: FileSpreadsheet, title: 'CSV & PDF Reports', desc: 'Generate printable schedules and revenue spreadsheets with your brand logo dynamically.' },
            { icon: Zap, title: 'Automatic Notifications', desc: 'Email alerts powered by EmailJS, future-ready SMS & WhatsApp integration setups.' }
          ].map((feat, idx) => (
            <ScrollReveal key={idx}>
              <div className="glass-card p-6 rounded-2xl border-slate-800 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
                  <feat.icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{feat.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ─── */}
      <section className="py-12 bg-slate-950/40 border-y border-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white">SaaS Admin Dashboard</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Log in and gain instant access to your rental business performance. Our custom dashboard features real-time clock synchronization, live count cards, monthly trends, and charts built with Recharts.
              </p>
              <div className="space-y-3">
                {['Real-time inventory counters', 'Device status tracking', 'Monthly revenue line charts', 'Automatic late-fee warnings'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300 font-bold">
                    <CheckCircle size={14} className="text-cyan-400 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative glass-card border-slate-800 rounded-3xl p-4 sm:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
              {/* Fake dashboard visual mockup */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Live Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Revenue</p>
                  <p className="text-base font-black text-white mt-1">₹1,24,000</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Active Rentals</p>
                  <p className="text-base font-black text-cyan-400 mt-1">12 Devices</p>
                </div>
              </div>
              <div className="h-28 bg-slate-900/40 rounded-xl border border-slate-800/85 flex items-center justify-center">
                <div className="w-4/5 h-2/3 flex items-end justify-between gap-2.5 px-3">
                  {[40, 65, 35, 80, 55, 95, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How It Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">A simple, transparent process for administrators.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          {[
            { step: '01', title: 'Add Devices', desc: 'Input brand, model, condition, and details to list items in active stock.' },
            { step: '02', title: 'Register Customers', desc: 'Create customer profiles with government ID numbers and document proofs.' },
            { step: '03', title: 'Rent & Verify', desc: 'Select dates and create rentals. The system checks overlap conflicts and alerts the client.' },
            { step: '04', title: 'Track Returns', desc: 'Handle return conditions, calculate late fees, log damage claims, and update stats.' }
          ].map((item, idx) => (
            <ScrollReveal key={idx}>
              <div className="glass-card p-6 rounded-2xl border-slate-800 relative">
                <span className="absolute -top-3 left-6 text-2xl font-black text-cyan-500/20">{item.step}</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-2">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="glass-card border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Get in Touch</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Have questions about setting up your electronics rental operations? Let’s connect.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <Mail size={16} className="text-cyan-400" />
                    <span>onepointsolutions16@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <Phone size={16} className="text-cyan-400" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <MapPin size={16} className="text-cyan-400" />
                    <span>Bangalore, India</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input 
                  type="text" 
                  required
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all"
                />
                <input 
                  type="email" 
                  required
                  placeholder="Your Email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all"
                />
                <textarea 
                  required
                  rows={3}
                  placeholder="Write message..." 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all resize-none"
                ></textarea>
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── FOOTER SECTION ─── */}
      <footer className="border-t border-slate-900/80 pt-8 text-center text-slate-600">
        <p className="text-[10px] uppercase tracking-widest font-semibold">
          &copy; 2026 One Point Solutions. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
