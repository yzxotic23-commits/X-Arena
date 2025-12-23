'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

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

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/50',
    icon: 'text-green-400',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/10',
    border: 'border-red-500/50',
    icon: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/50',
    icon: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/50',
    icon: 'text-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
  },
};

export function ToastItem({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type];
  const style = toastStyles[toast.type];
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
      className={`relative ${style.bg} ${style.border} border-2 rounded-xl p-4 min-w-[320px] max-w-[420px] backdrop-blur-md ${style.glow}`}
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
          <p className="text-sm font-semibold text-white leading-relaxed">
            {toast.message}
          </p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-full ${style.bg.replace('/20', '/60')}`}
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

