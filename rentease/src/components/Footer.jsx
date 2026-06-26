import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const quickLinks = [
  { name: 'Devices', path: '/devices' },
  { name: 'Book Rental', path: '/booking' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'KYC Upload', path: '/kyc' },
  { name: 'Return Management', path: '/returns' },
  { name: 'Contact Us', path: '/contact' },
];

const supportLinks = [
  { name: 'Help Center', path: '#' },
  { name: 'Terms of Service', path: '#' },
  { name: 'Privacy Policy', path: '#' },
  { name: 'Damage Claims', path: '/claims' },
  { name: 'Repair Tracker', path: '/repair' },
  { name: 'Corporate Rental', path: '/corporate' },
];

export default function Footer() {
  return (
    <footer className="relative bg-dark-card border-t border-white/5 pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center font-bold text-lg">
                R
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Rent</span>
                <span className="text-white">Ease</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Premium electronics rental platform offering laptops, cameras, projectors, 
              gaming consoles and more. Rent with confidence and ease.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-lg hover:shadow-accent-cyan/20 transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-accent-cyan text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-accent-cyan text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>123 Tech Park Avenue</p>
              <p>San Francisco, CA 94105</p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                support@rentease.com
              </p>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RentEase. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-accent-cyan transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-cyan transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent-cyan transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
