import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { HiBriefcase, HiUserGroup, HiChartBar, HiShieldCheck } from 'react-icons/hi';

const benefits = [
  { icon: HiBriefcase, title: 'Bulk Discounts', desc: 'Special pricing for corporate orders of 10+ devices.' },
  { icon: HiUserGroup, title: 'Dedicated Manager', desc: 'A dedicated account manager for your organization.' },
  { icon: HiChartBar, title: 'Flexible Billing', desc: 'Monthly invoicing with net-30 payment terms.' },
  { icon: HiShieldCheck, title: 'Enterprise Support', desc: 'Priority 24/7 support with on-site replacement.' },
];

export default function CorporateRental() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Corporate Rental Portal</h1>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Tailored rental solutions for businesses of all sizes. Equip your team with the latest technology.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-center">
          <ScrollReveal>
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Why Go Corporate?</h2>
              <div className="space-y-6">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                      <b.icon className="text-accent-cyan text-xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{b.title}</h3>
                      <p className="text-gray-400 text-sm">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Request a Quote</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Company Name" className="input-field" />
                  <input type="email" placeholder="Work Email" className="input-field" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Phone" className="input-field" />
                  <input type="number" placeholder="Devices Needed" className="input-field" />
                </div>
                <textarea rows="4" placeholder="Tell us about your requirements..." className="input-field min-h-[100px]" />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  type="submit"
                  className="btn-primary w-full text-center py-3"
                >
                  Submit Request
                </motion.button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Trusted by Industry Leaders</h2>
            <p className="text-gray-400 mb-8">Join 500+ companies that trust RentEase for their equipment needs</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              {['TechCorp', 'InnovateInc', 'GlobalSys', 'NextGen'].map((name, i) => (
                <div key={i} className="text-gray-500 font-bold text-xl tracking-widest">{name}</div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
