import ScrollReveal from '../components/ScrollReveal';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiTrendingUp, HiHeart, HiGlobe } from 'react-icons/hi';

const values = [
  { icon: HiShieldCheck, title: 'Trust & Reliability', desc: 'Every device is tested and certified before rental.' },
  { icon: HiTrendingUp, title: 'Innovation First', desc: 'Always stocking the latest technology for our customers.' },
  { icon: HiHeart, title: 'Customer Centric', desc: 'Your satisfaction is our top priority, always.' },
  { icon: HiGlobe, title: 'Sustainability', desc: 'Promoting circular economy through device sharing.' },
];

const team = [
  { name: 'Alex Rivera', role: 'CEO & Founder', avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Sophia Chen', role: 'CTO', avatar: 'https://i.pravatar.cc/150?img=13' },
  { name: 'Marcus Johnson', role: 'Head of Operations', avatar: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Priya Patel', role: 'Customer Experience', avatar: 'https://i.pravatar.cc/150?img=17' },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">About RentEase</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We are on a mission to make premium electronics accessible to everyone through affordable rental solutions.
              Founded in 2024, RentEase has grown to serve thousands of customers across 50+ cities.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <ScrollReveal>
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                What started as a small rental service for college students has evolved into a comprehensive 
                electronics rental platform serving individuals and businesses across the country.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We believe in the power of access over ownership. Why buy expensive equipment you only need 
                for a short time? RentEase makes it simple, affordable, and convenient to rent the latest 
                electronics whenever you need them.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
                alt="Team"
                className="rounded-2xl w-full h-[300px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 backdrop-blur flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold gradient-text">2K+</p>
                  <p className="text-gray-400 text-xs">Devices</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <h2 className="text-2xl font-bold text-white text-center mb-10">Our Values</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {values.map((v, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-4">
                  <v.icon className="text-accent-cyan text-xl" />
                </div>
                <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm">{v.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <h2 className="text-2xl font-bold text-white text-center mb-10">Leadership Team</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 text-center">
                <img src={m.avatar} alt={m.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                <h3 className="text-white font-semibold">{m.name}</h3>
                <p className="text-gray-400 text-sm">{m.role}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
