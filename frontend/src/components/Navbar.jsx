import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Menu, X, ShoppingCart, User, LogOut, ChevronDown,
  Home, Box, Calendar, LayoutDashboard, Info, Phone, LogIn, Package
} from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Devices', path: '/devices', icon: Box },
    { name: 'Book Rental', path: '/book-rental', icon: Calendar },
    ...(isAdmin ? [{ name: 'Dashboard', path: '/admin', icon: LayoutDashboard }] : []),
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-nav-solid py-2' : 'glass-nav py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow duration-300">
                <Zap size={18} className="text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-white tracking-tight leading-none">
                  Rent<span className="text-cyan-400">Ease</span>
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none hidden sm:block">
                  Electronics Rental
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-cyan-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              {user && !isAdmin && (
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-cyan-500 text-slate-900 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              )}

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black shadow-md">
                      {(user.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="hidden md:block text-xs font-semibold text-slate-300 max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown size={12} className={`text-slate-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-56 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/5">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                          <span className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {isAdmin ? 'Admin' : 'Customer'}
                          </span>
                        </div>
                        <div className="p-2">
                          <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <User size={14} /> My Profile
                          </Link>
                          {!isAdmin && (
                            <Link to="/my-bookings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                              <Package size={14} /> My Orders
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-95"
                >
                  <LogIn size={14} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#111827]/98 backdrop-blur-2xl border-l border-white/5 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-white fill-current" />
                  </div>
                  <span className="text-base font-extrabold text-white">
                    Rent<span className="text-cyan-400">Ease</span>
                  </span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.path)
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <link.icon size={18} />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                {user && !isAdmin && (
                  <>
                    <div className="h-px bg-white/5 my-3" />
                    <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Services</p>
                    {[
                      { name: 'My Orders', path: '/my-bookings' },
                      { name: 'KYC Upload', path: '/kyc-upload' },
                      { name: 'Returns Center', path: '/return-management' },
                      { name: 'Damage Claims', path: '/damage-claims' },
                      { name: 'Repair Tracker', path: '/repair-tracker' },
                      { name: 'Corporate Portal', path: '/corporate' },
                    ].map((link, idx) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`block px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive(link.path)
                            ? 'text-cyan-400 bg-cyan-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </>
                )}

                {isAdmin && (
                  <>
                    <div className="h-px bg-white/5 my-3" />
                    <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin</p>
                    {[
                      { name: 'Manage Inventory', path: '/devices' },
                      { name: 'Customers', path: '/admin/customers' },
                      { name: 'Payments', path: '/admin/payments' },
                      { name: 'Damage Claims', path: '/admin/claims' },
                    ].map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`block px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive(link.path)
                            ? 'text-cyan-400 bg-cyan-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click-away for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
