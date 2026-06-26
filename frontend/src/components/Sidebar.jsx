import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Box, Calendar, Users, CreditCard,
  UserCircle, Zap, ShieldAlert, X, ShoppingCart,
  Package, Headphones, Camera, Monitor, Smartphone, Gamepad2, ShieldCheck, Truck, Wrench, Building
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Manage Inventory', icon: Box, path: '/devices' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Damage Claims', icon: ShieldAlert, path: '/admin/claims' },
  ];

  const customerMenu = [
    { name: 'Devices Catalog', icon: Box, path: '/devices' },
    { name: 'Book Rental', icon: Calendar, path: '/book-rental' },
    { name: 'My Orders', icon: Package, path: '/my-bookings' },
    { name: 'KYC Upload', icon: ShieldCheck, path: '/kyc-upload' },
    { name: 'Damage Claims', icon: ShieldAlert, path: '/damage-claims' },
    { name: 'Returns Center', icon: Truck, path: '/return-management' },
    { name: 'Repair Tracker', icon: Wrench, path: '/repair-tracker' },
    { name: 'Corporate Portal', icon: Building, path: '/corporate' },
  ];

  const categories = [
    { name: 'Laptops', icon: Monitor, path: '/devices?search=Laptop' },
    { name: 'Cameras', icon: Camera, path: '/devices?search=Camera' },
    { name: 'Audio', icon: Headphones, path: '/devices?search=Audio' },
    { name: 'Gaming', icon: Gamepad2, path: '/devices?search=Gaming' },
    { name: 'Phones', icon: Smartphone, path: '/devices?search=Smartphone' },
  ];

  const menuItems = isAdmin ? adminMenu : customerMenu;
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-[#111827]/95 backdrop-blur-lg border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col pt-16`}>
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto mt-2">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{isAdmin ? 'Admin Console' : 'Customer Workspace'}</p>
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              isActive(item.path) 
                ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium'
            }`}
          >
            <item.icon size={15} className={isActive(item.path) ? 'text-cyan-400' : 'text-slate-500'} />
            {item.name}
          </Link>
        ))}
        {!isAdmin && (
          <>
            <div className="h-px bg-slate-800/80 mx-3 my-4" />
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Filter Category</p>
            {categories.map((cat) => (
              <Link key={cat.name} to={cat.path} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800/40 hover:text-white font-medium transition-all"
              >
                <cat.icon size={14} className="text-slate-500" />
                {cat.name}
              </Link>
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-3 px-2">
          {(() => {
            const uid = user?.uid;
            const customImg = uid ? localStorage.getItem(`user_avatar_img_${uid}`) : null;
            const avatarColor = localStorage.getItem(`user_avatar_${uid}`) || '#06B6D4';
            const avatarUrl = customImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '?')}&background=${avatarColor.replace('#', '')}&color=fff&size=64&bold=true`;
            return <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-700/60" />;
          })()}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{user?.name || 'Guest'}</p>
            <p className="text-[9px] text-slate-500 truncate uppercase tracking-wider font-bold">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
