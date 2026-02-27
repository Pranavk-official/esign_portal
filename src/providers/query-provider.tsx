'use client';

import { 
  QueryClient, 
  QueryClientProvider, 
  MutationCache, 
} from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppError } from '@/lib/errors';

// Extend React Query's Meta type to include our custom options
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
    mutationMeta: {
      suppressErrorToast?: boolean;
    }
  }
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // 1. Check if this specific mutation requested to hide the toast
        if (mutation.meta?.suppressErrorToast) {
          return; 
        }

        // 2. Otherwise, show the global toast
        // The error message is already formatted by our Axios Interceptor
        toast.error(error.message);
      },
    }),

    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, 
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
