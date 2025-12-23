'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const getToastStyles = (isDark: boolean) => ({
  success: {
    bg: isDark 
      ? 'bg-gradient-to-r from-primary/30 to-primary/20 dark:from-primary/40 dark:to-primary/30'
      : 'bg-gradient-to-r from-primary/20 to-primary/10',
    border: isDark
      ? 'border-primary/60 dark:border-primary/70'
      : 'border-primary/50',
    icon: isDark
      ? 'text-primary dark:text-primary'
      : 'text-primary',
    text: isDark
      ? 'text-white dark:text-white'
      : 'text-gray-900',
    glow: isDark
      ? 'shadow-[0_0_20px_rgba(220,38,38,0.4)] dark:shadow-[0_0_20px_rgba(220,38,38,0.5)]'
      : 'shadow-[0_0_20px_rgba(220,38,38,0.3)]',
  },
  error: {
    bg: isDark
      ? 'bg-gradient-to-r from-red-500/30 to-red-600/20 dark:from-red-500/40 dark:to-red-600/30'
      : 'bg-gradient-to-r from-red-500/20 to-red-600/15',
    border: isDark
      ? 'border-red-500/60 dark:border-red-500/70'
      : 'border-red-500/50',
    icon: isDark
      ? 'text-red-400 dark:text-red-300'
      : 'text-red-600',
    text: isDark
      ? 'text-white dark:text-white'
      : 'text-gray-900',
    glow: isDark
      ? 'shadow-[0_0_20px_rgba(239,68,68,0.4)] dark:shadow-[0_0_20px_rgba(239,68,68,0.5)]'
      : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  },
  info: {
    bg: isDark
      ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/20 dark:from-blue-500/40 dark:to-blue-600/30'
      : 'bg-gradient-to-r from-blue-500/20 to-blue-600/15',
    border: isDark
      ? 'border-blue-500/60 dark:border-blue-500/70'
      : 'border-blue-500/50',
    icon: isDark
      ? 'text-blue-400 dark:text-blue-300'
      : 'text-blue-600',
    text: isDark
      ? 'text-white dark:text-white'
      : 'text-gray-900',
    glow: isDark
      ? 'shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
      : 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  warning: {
    bg: isDark
      ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/20 dark:from-yellow-500/40 dark:to-amber-500/30'
      : 'bg-gradient-to-r from-yellow-500/20 to-amber-500/15',
    border: isDark
      ? 'border-yellow-500/60 dark:border-yellow-500/70'
      : 'border-yellow-500/50',
    icon: isDark
      ? 'text-yellow-400 dark:text-yellow-300'
      : 'text-yellow-600',
    text: isDark
      ? 'text-white dark:text-white'
      : 'text-gray-900',
    glow: isDark
      ? 'shadow-[0_0_20px_rgba(234,179,8,0.4)] dark:shadow-[0_0_20px_rgba(234,179,8,0.5)]'
      : 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
  },
});

export function ToastItem({ toast, onClose }: ToastProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = toastIcons[toast.type];
  const style = getToastStyles(isDark)[toast.type];
  const duration = toast.duration || 4000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`relative ${style.bg} ${style.border} border-2 rounded-xl p-4 min-w-[320px] max-w-[420px] backdrop-blur-md ${style.glow} ${
        isDark ? 'bg-gray-900/95' : 'bg-white/95'
      }`}
    >
      {/* Animated border glow */}
      <div className={`absolute inset-0 rounded-xl ${style.bg} opacity-50 blur-xl -z-10 animate-pulse`} />
      
      {/* Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${style.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.text} leading-relaxed`}>
            {toast.message}
          </p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => onClose(toast.id)}
          className={`flex-shrink-0 transition-colors p-1 rounded-lg ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-white/10' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden ${
        isDark ? 'bg-black/20' : 'bg-gray-200/50'
      }`}>
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-full ${style.bg.replace('/20', '/60').replace('/30', '/70').replace('/40', '/80')}`}
        />
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

