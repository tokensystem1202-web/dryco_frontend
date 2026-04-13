import { Navigate } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import { useAuth } from '../features/auth/auth-store';
import { AppRole } from '../services/api';

export function ProtectedRoute({
  role,
  children,
}: PropsWithChildren<{ role?: AppRole }>) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}
