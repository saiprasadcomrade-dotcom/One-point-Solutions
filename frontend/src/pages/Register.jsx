import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err.message !== 'Google sign-in cancelled.') {
        setError(err.message || 'Google sign-up failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) { 
      setError('Please fill in all fields'); 
      return; 
    }
    if (password !== confirm) { 
      setError('Passwords do not match'); 
      return; 
    }
    if (password.length < 6) { 
      setError('Password must be at least 6 characters'); 
      return; 
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again');
    } finally { 
      setSubmitting(false); 
    }
  };

  if (success) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <CheckCircle className="text-emerald-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-slate-400 mb-6">Welcome to ERBS. Redirecting to Dashboard...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-between py-12 font-sans">
      <div className="flex justify-center z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap size={22} className="text-white fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">ERBS</span>
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 z-10">
        <div className="w-full max-w-[400px]">
          <div className="glass-card rounded-[2rem] border-slate-800 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <h1 className="text-2xl font-bold text-white mb-1">Create Admin Account</h1>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">Register as an administrator to manage device inventories and bookings.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all pr-10" 
                    placeholder="Full name" 
                  />
                  <User size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all pr-10" 
                    placeholder="you@example.com" 
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
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all pr-10" 
                    placeholder="Min. 6 characters" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? 'text' : 'password'} 
                    required 
                    value={confirm} 
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none transition-all pr-10" 
                    placeholder="Repeat password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 items-center">
                  <AlertCircle className="text-red-400 shrink-0" size={14} />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#0B1120] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">Or</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSignUp} 
              disabled={googleLoading}
              className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.79 5.79 0 0 1 8.2 12.74a5.79 5.79 0 0 1 5.79-5.79c1.498 0 2.861.567 3.905 1.5l3.051-3.05A9.95 9.95 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.3 0 9.61-3.8 9.61-9.61 0-.61-.06-1.22-.16-1.785H12.24Z" />
              </svg>
              {googleLoading ? 'Signing up...' : 'Sign up with Google'}
            </button>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:underline font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-600 z-10">
        <p className="text-[9px] uppercase tracking-wider font-semibold">&copy; 2026 One Point Solutions. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Register;
