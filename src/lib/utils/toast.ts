import { toast } from '@zerodevx/svelte-toast';

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.push(message, {
    theme: {
      '--toastBackground': type === 'success' ? '#4F46E5' : '#EF4444',
      '--toastColor': 'white',
    }
  });
}