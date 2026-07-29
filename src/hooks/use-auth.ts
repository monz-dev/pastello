import { useContext } from 'react';
import { AuthContext, type AuthState } from '@/components/providers/auth-provider';

/**
 * useAuth — returns the AuthProvider context. Throws when used outside an
 * `<AuthProvider>`, which surfaces wiring mistakes (e.g. a route rendered
 * without the root layout) as a clear early-bound error instead of a silent
 * undefined dereference downstream.
 */
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}