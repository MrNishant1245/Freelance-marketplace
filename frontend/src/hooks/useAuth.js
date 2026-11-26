// Re-export from context for convenience + add derived helpers
export { useAuth } from '../context/AuthContext';

import { useAuth } from '../context/AuthContext';

export const useIsFreelancer = () => {
  const { user } = useAuth();
  return user?.role === 'freelancer';
};

export const useIsClient = () => {
  const { user } = useAuth();
  return user?.role === 'client';
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

export const useEmailVerified = () => {
  const { user } = useAuth();
  return user?.isEmailVerified ?? false;
};
