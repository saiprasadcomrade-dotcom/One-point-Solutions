import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LayoutDashboard, Box, Users, Calendar, AlertTriangle, 
  History, Settings, LogOut, Menu, X, Clock, Bell, Search, FileText
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // Real-time live clock updating every second and body scroll lock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Disable window body scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      clearInterval(timer);
      // Restore normal scrolling on unmount
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Devices', path: '/admin/devices', icon: Box },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Rentals', path: '/admin/rentals', icon: Calendar },
    { name: 'Rental Calendar', path: '/admin/calendar', icon: Calendar },
    { name: 'Damage Reports', path: '/admin/damages', icon: AlertTriangle },
    { name: 'Notification History', path: '/admin/notifications', icon: Bell },
    { name: 'Activity Logs', path: '/admin/logs', icon: History },
    { name: 'Reports & Export', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  // Format time and date nicely
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen overflow-hidden flex bg-slate-100 text-slate-800 font-sans">
      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#0B1120] text-slate-300 border-r border-slate-800 shrink-0 sticky top-0">
        {/* Sidebar Brand header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 mr-2.5">
            <span className="text-white font-black text-sm">ER</span>
          </div>
          <span className="text-lg font-black text-white tracking-tight">ERBS <span className="text-xs font-bold text-cyan-400">Admin</span></span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border-l-4 border-cyan-500' 
                    : 'hover:bg-slate-900 hover:text-white text-slate-400'
                }`}
              >
                <link.icon size={16} className={active ? 'text-cyan-400' : 'text-slate-500'} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Profile Info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40">
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                AD
              </div>
              <div className="ml-2.5 min-w-0">
                <p className="text-xs font-bold text-white truncate">Administrator</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between px-4 sm:px-6 md:px-8 border-b-2 border-cyan-500/40 shadow-md z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Welcome back</p>
              <p className="text-base font-black text-white mt-1 leading-none">Admin Panel</p>
            </div>
          </div>

          {/* Clock & Notifications & Search */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Clock Widget */}
            <div className="hidden md:flex flex-col items-end border-r border-slate-800 pr-5">
              <div className="flex items-center text-xs font-black text-cyan-400 tracking-wider">
                <Clock size={13} className="mr-1.5 animate-pulse" />
                {formatTime(time)}
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {formatDate(time)}
              </div>
            </div>

            {/* Notification Badge */}
            <button 
              onClick={() => navigate('/admin/notifications')}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer border border-slate-700/50"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
            </button>

            {/* Logout Shortcut */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Active Page Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden h-[calc(100vh-5rem)] scroll-smooth">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE DRAWER SIDEBAR ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          ></div>

          {/* Drawer panel */}
          <div className="relative flex flex-col w-64 max-w-xs bg-[#0B1120] text-slate-300 h-full border-r border-slate-800 animate-slide-in">
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-black text-sm">ER</span>
                </div>
                <span className="text-lg font-black text-white tracking-tight">ERBS</span>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border-l-4 border-cyan-500' 
                        : 'hover:bg-slate-900 hover:text-white text-slate-400'
                    }`}
                  >
                    <link.icon size={16} className={active ? 'text-cyan-400' : 'text-slate-500'} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40">
                <div className="flex items-center min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    AD
                  </div>
                  <div className="ml-2.5 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Administrator</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-red-400"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
