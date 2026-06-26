import { Shield, Sparkles, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    { icon: Zap, title: 'Instant Booking', desc: 'Secure the latest electronics in seconds with real-time stock management and instant booking confirmation.' },
    { icon: Shield, title: 'Damage Protection', desc: 'Rent with peace of mind. Our optional damage waivers cover accidental wear and tear so you can focus on creating.' },
    { icon: Truck, title: 'Express Delivery', desc: 'Same-day doorstep delivery and pickup service, or easy collection from one of our local hubs.' },
    { icon: Sparkles, title: 'Premium Fleet', desc: 'We only source brand-new, top-tier items: M4 Macs, Sony cinema cameras, PS5 Pros, and enterprise drones.' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto space-y-16 px-4">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-cyan-500/20">Our Story</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Pioneering On-Demand <span className="text-gradient">Electronics</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            RentEase is the premium electronics rental subscription platform designed for creators, developers, businesses, and gamers. We believe access beats ownership.
          </p>
        </div>

        {/* Visual Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-md">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Rent high-end tech. <br />
              <span className="text-purple-400">Return when finished.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Buying professional-grade equipment like RED cameras, flagship laptops, and server-grade displays represents a huge upfront expense. RentEase makes these accessible for short-term projects, testing, or events.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-black text-cyan-400">10k+</p>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Rentals Completed</p>
              </div>
              <div>
                <p className="text-3xl font-black text-purple-400">99.8%</p>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Uptime & Quality</p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <img 
              src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80" 
              alt="Premium devices layout" 
              className="relative rounded-2xl border border-slate-700/60 object-cover shadow-2xl"
            />
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Why RentEase?</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase mt-1">We build for quality and convenience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((val, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 hover:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-purple-500/25 border border-white/5 flex items-center justify-center mb-4">
                  <val.icon className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{val.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-card rounded-[2rem] p-8 md:p-12 text-center space-y-6 relative overflow-hidden border border-white/10 glow-cyan animate-pulse-slow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">Ready to lease your next equipment?</h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
            Sign up now to get corporate support, express deliveries, and early access to newly released gadgets.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/devices" className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 active:scale-95">
              Explore Catalog
            </Link>
            <Link to="/contact" className="px-6 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-xl text-xs uppercase tracking-wider transition-all duration-300">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
