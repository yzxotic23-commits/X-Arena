'use client';

import { useToast } from '@/lib/toast-context';
import { ToastContainer } from '@/components/ui/toast';

export function ToastContainerWrapper() {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

