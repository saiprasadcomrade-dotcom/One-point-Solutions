import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info as InfoIcon } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Dismiss exactly after 2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Overlay Container */}
      <div className="fixed bottom-8 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgStyle = 'bg-slate-900 border-slate-800 text-slate-100';
            let Icon = InfoIcon;
            let iconColor = 'text-cyan-400';

            if (toast.type === 'success') {
              bgStyle = 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/20';
              Icon = CheckCircle;
              iconColor = 'text-emerald-400';
            } else if (toast.type === 'error') {
              bgStyle = 'bg-red-950/90 border-red-500/30 text-red-100 shadow-red-950/20';
              Icon = XCircle;
              iconColor = 'text-red-400';
            } else if (toast.type === 'warning') {
              bgStyle = 'bg-amber-950/90 border-amber-500/30 text-amber-100 shadow-amber-950/20';
              Icon = AlertTriangle;
              iconColor = 'text-amber-400';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => removeToast(toast.id)}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl ${bgStyle} cursor-pointer`}
              >
                <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
