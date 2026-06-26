import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-dark-bg flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-4xl font-bold shadow-2xl shadow-accent-cyan/30">
                R
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold mb-2"
            >
              <span className="gradient-text">Rent</span>
              <span className="text-white">Ease</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-gray-400 text-sm"
            >
              Loading premium experience...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ delay: 0.6, duration: 1.4, ease: 'easeInOut' }}
              className="h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-blue rounded-full mt-6 mx-auto"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
