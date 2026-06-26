import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';
import ScrollReveal from '../components/ScrollReveal';

const contactInfo = [
  { icon: HiMail, label: 'Email', value: 'support@rentease.com', desc: 'We reply within 24 hours' },
  { icon: HiPhone, label: 'Phone', value: '+1 (555) 123-4567', desc: 'Mon-Fri 9AM-6PM' },
  { icon: HiLocationMarker, label: 'Office', value: '123 Tech Park Ave, SF', desc: 'Visit us during business hours' },
  { icon: HiClock, label: 'Hours', value: 'Mon-Sat: 9AM - 8PM', desc: 'Sunday: Closed' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Get In Touch</h1>
            <p className="text-gray-400 mt-3">Have a question? We would love to hear from you</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {contactInfo.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="glass-card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-accent-cyan text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                    <p className="text-white font-medium text-sm">{item.value}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="lg:col-span-2">
            <ScrollReveal delay={0.1}>
              <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                    <input type="text" required value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                  <input type="text" required value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="How can we help?" className="input-field" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                  <textarea rows="5" required value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Write your message..." className="input-field min-h-[120px]" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary w-full text-center py-3"
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </motion.button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
