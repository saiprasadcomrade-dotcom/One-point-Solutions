import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleResolveReject, setGoogleResolveReject] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('erbs_admin_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then((res) => {
          setUser({ ...res.data, role: 'admin' });
        })
        .catch((err) => {
          console.error('Session restore failed:', err.message);
          localStorage.removeItem('erbs_admin_token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('erbs_admin_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('erbs_admin_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const loginWithGoogle = () => {
    setShowGoogleModal(true);
    return new Promise((resolve, reject) => {
      setGoogleResolveReject({ resolve, reject });
    });
  };

  const handleGoogleSelect = async (payload) => {
    try {
      const res = await api.post('/auth/google', payload);
      const { token, user: userData } = res.data;
      
      localStorage.setItem('erbs_admin_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setShowGoogleModal(false);
      if (googleResolveReject) googleResolveReject.resolve(userData);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Google login failed.';
      setShowGoogleModal(false);
      if (googleResolveReject) googleResolveReject.reject(new Error(errorMsg));
    }
  };

  const logout = async () => {
    localStorage.removeItem('erbs_admin_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loginWithGoogle, changePassword, loading }}>
      {children}
      {showGoogleModal && (
        <GoogleModalOverlay
          onSelect={handleGoogleSelect}
          onClose={() => {
            setShowGoogleModal(false);
            if (googleResolveReject) googleResolveReject.reject(new Error('Google sign-in cancelled.'));
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

const GoogleModalOverlay = ({ onSelect, onClose }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const accounts = [
    { name: 'One Point Solutions', email: 'onepointsolutions16@gmail.com', googleId: 'google-1001', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
    { name: 'Guest Admin', email: 'admin.guest@onepointsolutions.com', googleId: 'google-1002', avatarUrl: '' }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    onSelect({
      name: customName || 'Google User',
      email: customEmail,
      googleId: 'google-' + Math.floor(Math.random() * 100000),
      avatarUrl: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 transition-all transform scale-100 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-5">
          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-white border border-gray-100 rounded-full shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.79 5.79 0 0 1 8.2 12.74a5.79 5.79 0 0 1 5.79-5.79c1.498 0 2.861.567 3.905 1.5l3.051-3.05A9.95 9.95 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.3 0 9.61-3.8 9.61-9.61 0-.61-.06-1.22-.16-1.785H12.24Z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Sign in with Google</h2>
          <p className="text-xs text-gray-500 mt-0.5">to continue to <span className="font-semibold text-indigo-600">One Point Solutions</span></p>
        </div>

        {!customMode ? (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Choose an account</p>
            <div className="space-y-1.5 mb-5 max-h-56 overflow-y-auto pr-1">
              {accounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(acc)}
                  className="w-full flex items-center p-2.5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all text-left group"
                >
                  {acc.avatarUrl ? (
                    <img src={acc.avatarUrl} alt={acc.name} className="w-8 h-8 rounded-full object-cover mr-2.5 border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-2.5">
                      {acc.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-indigo-600 transition-colors">{acc.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{acc.email}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCustomMode(true)}
              className="w-full py-2 px-3 text-xs font-medium text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50/20 rounded-xl transition-all border border-dashed border-gray-200 hover:border-indigo-200 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Use another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Simulate Google Profile</p>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Full Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Email Address</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs transition-all"
              />
            </div>
            <div className="flex gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="flex-1 py-2 px-3 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                Authorize
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
