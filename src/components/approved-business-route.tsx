import { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-store';
import { getMyBusiness } from '../services/api';

export function ApprovedBusinessRoute({ children }: PropsWithChildren) {
  const { isLoading, user } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'business') {
      return;
    }

    void getMyBusiness()
      .then((business) => setIsApproved(Boolean(business?.isApproved && business.isActive)))
      .catch(() => setIsApproved(false));
  }, [user]);

  if (isLoading || (user?.role === 'business' && isApproved === null)) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'business') {
    return <Navigate to={`/${user.role}`} replace />;
  }

  if (!isApproved) {
    return <Navigate to="/businesses" replace />;
  }

  return <>{children}</>;
}