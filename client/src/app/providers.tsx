import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from "../features/auth/context/AuthContext";
export interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root provider wrapper for global app context (React Query, etc.).
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
  <AuthProvider>
    {children}
  </AuthProvider>
</QueryClientProvider>
    
  );
}
