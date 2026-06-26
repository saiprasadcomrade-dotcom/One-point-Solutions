import { Link } from 'react-router-dom';
import { Zap, Code2, X, ExternalLink, Camera, Mail, ArrowUpRight, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Careers', path: '#' },
        { name: 'Blog', path: '#' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Device Catalog', path: '/devices' },
        { name: 'Book Rental', path: '/book-rental' },
        { name: 'Corporate Portal', path: '/corporate' },
        { name: 'KYC Upload', path: '/kyc-upload' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Returns Center', path: '/return-management' },
        { name: 'Damage Claims', path: '/damage-claims' },
        { name: 'Repair Tracker', path: '/repair-tracker' },
        { name: 'FAQs', path: '/#faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', path: '#' },
        { name: 'Terms of Service', path: '#' },
        { name: 'Refund Policy', path: '#' },
        { name: 'Rental Agreement', path: '#' },
      ],
    },
  ];

  const socials = [
    { icon: Code2, href: '#', label: 'GitHub' },
    { icon: X, href: '#', label: 'X / Twitter' },
    { icon: ExternalLink, href: '#', label: 'LinkedIn' },
    { icon: Camera, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="relative mt-auto bg-[#080D1A] border-t border-white/5">
      {/* Gradient Top Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/15">
                <Zap size={18} className="text-white fill-current" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Rent<span className="text-cyan-400">Ease</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">
              Premium electronics rental platform for creators, developers, businesses, and gamers. Access beats ownership.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stay Updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-colors">
                  <Mail size={14} />
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2 mt-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all duration-300"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {quickLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors duration-200"
                    >
                      {link.name}
                      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-600 text-center sm:text-left">
            © {currentYear} RentEase by One Point Solutions. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-600 flex items-center gap-1">
            Crafted with <Heart size={10} className="text-red-500 fill-current" /> for premium rentals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
