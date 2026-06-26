import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { HiArrowRight, HiStar, HiCheck, HiShieldCheck, HiTruck, HiRefresh, HiSupport } from 'react-icons/hi';
import ScrollReveal from '../components/ScrollReveal';
import FloatingParticles from '../components/FloatingParticles';
import { devices } from '../data/devices';
import { testimonials } from '../data/testimonials';
import { faqs } from '../data/faqs';

const stats = [
  { label: 'Total Devices', value: 2500, suffix: '+' },
  { label: 'Happy Customers', value: 15000, suffix: '+' },
  { label: 'Cities Covered', value: 50, suffix: '+' },
  { label: 'Avg. Rating', value: 4.8, suffix: '' },
];

const whyChooseUs = [
  { icon: HiShieldCheck, title: 'Premium Quality', desc: 'All equipment is thoroughly tested and sanitized before every rental.' },
  { icon: HiTruck, title: 'Free Delivery', desc: 'Complimentary delivery and pickup within city limits for orders above $50.' },
  { icon: HiRefresh, title: 'Easy Returns', desc: 'Hassle-free returns with our 24-hour grace period and instant refunds.' },
  { icon: HiSupport, title: '24/7 Support', desc: 'Round-the-clock customer support via chat, email, and phone.' },
];

const rentalSteps = [
  { step: '01', title: 'Browse Devices', desc: 'Explore our extensive catalog of premium electronics.' },
  { step: '02', title: 'Select & Book', desc: 'Choose your device, set duration, and book instantly.' },
  { step: '03', title: 'KYC Verification', desc: 'Quick and secure identity verification process.' },
  { step: '04', title: 'Get Delivered', desc: 'Equipment delivered to your doorstep on time.' },
  { step: '05', title: 'Use & Return', desc: 'Enjoy your rental and we\'ll handle the pickup.' },
];

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, i) => {
      const increment = stat.value / 60;
      return setInterval(() => {
        setCounters(prev => {
          const next = [...prev];
          next[i] = Math.min(prev[i] + increment, stat.value);
          return next;
        });
      }, 25);
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80"
          >
            <source src="https://cdn.coverr.co/videos/coverr-electronics-and-gadgets-on-a-wooden-table-5615/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/95 via-dark-bg/80 to-dark-bg/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
        </motion.div>

        <FloatingParticles count={12} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 rounded-full text-xs font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 mb-6">
              #1 Electronics Rental Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            <span className="gradient-text">Electronics Rental</span>
            <br />
            <span className="text-white">Booking System</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Rent Laptops, Cameras, Projectors, Tablets and More with Instant Booking
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/booking" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-4">
              Book Now <HiArrowRight />
            </Link>
            <Link to="/devices" className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-8 py-4">
              Explore Devices
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400"
          >
            <span className="flex items-center gap-2"><HiCheck className="text-green-400" /> No Hidden Fees</span>
            <span className="flex items-center gap-2"><HiCheck className="text-green-400" /> Instant Booking</span>
            <span className="flex items-center gap-2"><HiCheck className="text-green-400" /> Free Delivery</span>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-500 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-accent-cyan animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Featured Devices */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-accent-cyan text-sm font-medium uppercase tracking-wider">Our Collection</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Featured Devices</h2>
              <p className="text-gray-400 mt-3 max-w-lg mx-auto">Premium electronics available for rent at competitive prices</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {devices.slice(0, 8).map((device, i) => (
              <ScrollReveal key={device.id} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card glass-hover overflow-hidden group cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={device.image}
                      alt={device.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${device.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {device.available ? 'Available' : 'Rented'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-500 mb-1">{device.category}</p>
                    <h3 className="text-white font-semibold text-base mb-2 truncate">{device.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      <HiStar className="text-yellow-400 text-sm" />
                      <span className="text-yellow-400 text-sm font-medium">{device.rating}</span>
                      <span className="text-gray-500 text-xs">(120+ reviews)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-accent-cyan font-bold text-lg">${device.pricePerDay}</span>
                        <span className="text-gray-500 text-xs">/day</span>
                      </div>
                      <Link to="/booking" className="text-sm text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors">
                        Rent Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2}>
            <div className="text-center mt-10">
              <Link to="/devices" className="btn-secondary inline-flex items-center gap-2">
                View All Devices <HiArrowRight />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-accent-cyan/5 to-dark-bg pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-accent-purple text-sm font-medium uppercase tracking-wider">Why RentEase</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Why Choose Us</h2>
              <p className="text-gray-400 mt-3 max-w-lg mx-auto">We make electronics rental simple, reliable, and affordable</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 text-center group"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="text-accent-cyan text-2xl" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Process Timeline */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-accent-cyan text-sm font-medium uppercase tracking-wider">How It Works</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Rental Process</h2>
              <p className="text-gray-400 mt-3 max-w-lg mx-auto">Get your electronics in 5 simple steps</p>
            </div>
          </ScrollReveal>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-cyan/50 via-accent-purple/50 to-transparent hidden lg:block" />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
              {rentalSteps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="text-center relative">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/20 flex items-center justify-center mb-4 relative z-10">
                      <span className="gradient-text font-bold text-lg">{step.step}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Counter */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 via-accent-purple/10 to-accent-blue/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-8 text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                    {Math.round(counters[i])}{stat.suffix}
                  </div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-accent-purple text-sm font-medium uppercase tracking-wider">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">What Our Customers Say</h2>
              <p className="text-gray-400 mt-3 max-w-lg mx-auto">Trusted by thousands of satisfied customers worldwide</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 h-full"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <HiStar
                        key={s}
                        className={`text-sm ${s < t.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-white font-medium text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-accent-purple/5 to-dark-bg pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-accent-cyan text-sm font-medium uppercase tracking-wider">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Frequently Asked Questions</h2>
              <p className="text-gray-400 mt-3">Everything you need to know about renting electronics</p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.id} delay={i * 0.05}>
                <motion.div
                  className={`glass-card overflow-hidden cursor-pointer transition-all duration-300 ${activeFaq === faq.id ? 'border-accent-cyan/30' : ''}`}
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                >
                  <div className="p-5 flex items-center justify-between">
                    <h3 className="text-white font-medium text-sm sm:text-base pr-4">{faq.question}</h3>
                    <motion.div
                      animate={{ rotate: activeFaq === faq.id ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0"
                    >
                      <HiArrowRight className="text-accent-cyan text-sm" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {activeFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
