import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/app-shell';
import { ProtectedRoute } from '../components/protected-route';
import { AuthProvider } from '../features/auth/auth-store';
import { AdminDashboardPage } from '../pages/admin-dashboard-page';
import { BusinessDashboardPage } from '../pages/business-dashboard-page';
import { BusinessesPage } from '../pages/businesses-page';
import { CustomerDashboardPage } from '../pages/customer-dashboard-page';
import { LandingPage } from '../pages/landing-page';
import { LoginPage } from '../pages/login-page';
import { NotFoundPage } from '../pages/not-found-page';
import { OrdersPage } from '../pages/orders-page';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/customer"
              element={
                <ProtectedRoute role="customer">
                  <CustomerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business"
              element={
                <ProtectedRoute role="business">
                  <BusinessDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/businesses"
              element={
                <ProtectedRoute>
                  <BusinessesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
