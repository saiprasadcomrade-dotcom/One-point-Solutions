import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 w-full">
        <ScrollReveal>
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-2xl font-bold mb-4">
                R
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                {isLogin ? 'Sign in to your RentEase account' : 'Start your rental journey'}
              </p>
            </div>

            <form className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" className="input-field" />
                </div>
              )}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input type="email" placeholder="your@email.com" className="input-field" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" />
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary w-full text-center py-3"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-400 hover:text-accent-cyan text-sm transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
