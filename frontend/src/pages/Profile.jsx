import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, LogOut, Save, Camera, Check, Upload } from 'lucide-react';

const AVATAR_COLORS = [
  { name: 'Indigo', bg: '#1417e7' },
  { name: 'Red', bg: '#ef4444' },
  { name: 'Emerald', bg: '#10b981' },
  { name: 'Amber', bg: '#f59e0b' },
  { name: 'Violet', bg: '#7b5fbd' },
  { name: 'Pink', bg: '#ec4899' },
  { name: 'Cyan', bg: '#06b6d4' },
  { name: 'Lime', bg: '#84cc16' },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const uid = user?.uid || 'guest';
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState(
    localStorage.getItem(`user_name_${uid}`) || user?.name || ''
  );
  const [address, setAddress] = useState(
    localStorage.getItem(`user_address_${uid}`) || ''
  );
  const [avatarColor, setAvatarColor] = useState(
    localStorage.getItem(`user_avatar_${uid}`) || '#6366f1'
  );
  const [customAvatar, setCustomAvatar] = useState(
    localStorage.getItem(`user_avatar_img_${uid}`) || ''
  );
  const [saved, setSaved] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const avatarUrl = customAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || user?.name || '?')}&background=${avatarColor.replace('#', '')}&color=fff&size=128&bold=true`;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCustomAvatar(dataUrl);
      localStorage.setItem(`user_avatar_img_${uid}`, dataUrl);
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem(`user_name_${uid}`, displayName);
    localStorage.setItem(`user_address_${uid}`, address);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pickColor = (color) => {
    setAvatarColor(color);
    setCustomAvatar('');
    localStorage.setItem(`user_avatar_${uid}`, color);
    localStorage.removeItem(`user_avatar_img_${uid}`);
    setShowAvatarPicker(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="glass-card rounded-[2rem] p-6 lg:p-8 border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-16 h-16 rounded-xl shadow-sm object-cover border border-slate-700/60"
            />
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{displayName || user?.email}</h1>
            <p className="text-xs text-slate-400">
              {user?.role === 'admin' ? 'Administrator' : 'Customer'} &middot; {user?.email}
            </p>
          </div>
        </div>

        {showAvatarPicker && (
          <div className="mb-5 p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose Avatar</p>
            <div>
              <p className="text-[9px] text-slate-500 font-medium mb-2">Upload from computer</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-all"
              >
                <Upload size={13} /> Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-medium mb-2">Or pick a color</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.bg}
                    onClick={() => pickColor(c.bg)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: c.bg }}
                    title={c.name}
                  >
                    {avatarColor === c.bg && !customAvatar && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white placeholder:text-slate-600"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-500" size={14} />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white placeholder:text-slate-600 resize-none"
                placeholder="123 Main St, City, State, PIN"
              />
            </div>
            <p className="text-[10px] text-slate-500">Auto-filled in your booking forms.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-bold px-5 py-2 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/10"
          >
            <Save size={14} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 font-semibold px-5 py-2 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all text-xs border border-red-500/20"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
