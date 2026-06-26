import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to admin dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Handle prefill if redirected with ?demo=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'true') {
      setEmail('onepointsolutions16@gmail.com');
      setPassword('admin@123');
      showToast('Demo credentials prefilled. Click Sign In to launch!', 'info');
    }
  }, [location.search, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('Logged in successfully via Google!', 'success');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err.message !== 'Google sign-in cancelled.') {
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-between py-12 relative overflow-hidden font-sans">
      {/* Background visual glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Brand */}
      <div className="flex justify-center z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/35 transition-all duration-300">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ERBS</span>
        </button>
      </div>

      {/* Main login card */}
      <div className="flex items-center justify-center px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] glass-card rounded-[2rem] border-slate-800 p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Administrator Access</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Please sign in with authorized Gmail to manage rental stock and bookings.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all pr-10"
                />
                <Mail size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Signing In...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-[#0B1120] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">Or</span>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.79 5.79 0 0 1 8.2 12.74a5.79 5.79 0 0 1 5.79-5.79c1.498 0 2.861.567 3.905 1.5l3.051-3.05A9.95 9.95 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.3 0 9.61-3.8 9.61-9.61 0-.61-.06-1.22-.16-1.785H12.24Z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-500 mt-5">
            Don't have an admin account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Register
            </button>
          </p>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-slate-600 z-10">
        <p className="text-[9px] uppercase tracking-wider font-semibold">&copy; 2026 One Point Solutions. Admin Portal.</p>
      </div>
    </div>
  );
};

export default Login;
