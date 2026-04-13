import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ApprovedBusinessRoute } from '../components/approved-business-route';
import { AppShell } from '../components/app-shell';
import { ProtectedRoute } from '../components/protected-route';
import { AuthProvider } from '../features/auth/auth-store';
import { AdminDashboardPage } from '../pages/admin-dashboard-page';
import { BusinessRegistrationPage } from '../pages/business-registration-page';
import { BookPage } from '../pages/book-page';
import { BusinessDashboardPage } from '../pages/business-dashboard-page';
import { BusinessOffersPage } from '../pages/business-offers-page';
import { BusinessPricingPage } from '../pages/business-pricing-page';
import { BusinessesPage } from '../pages/businesses-page';
import { CustomerDashboardPage } from '../pages/customer-dashboard-page';
import { LandingPage } from '../pages/landing-page';
import { LoginPage } from '../pages/login-page';
import { NotFoundPage } from '../pages/not-found-page';
import { OrderTrackingPage } from '../pages/order-tracking-page';
import { OrdersPage } from '../pages/orders-page';
import { ProfilePage } from '../pages/profile-page';
import { RewardsPage } from '../pages/rewards-page';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/business/register" element={<BusinessRegistrationPage />} />
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
              element={<Navigate to="/business/dashboard" replace />}
            />
            <Route
              path="/business/dashboard"
              element={
                <ApprovedBusinessRoute>
                  <BusinessDashboardPage />
                </ApprovedBusinessRoute>
              }
            />
            <Route
              path="/business/pricing"
              element={
                <ApprovedBusinessRoute>
                  <BusinessPricingPage />
                </ApprovedBusinessRoute>
              }
            />
            <Route
              path="/business/offers"
              element={
                <ApprovedBusinessRoute>
                  <BusinessOffersPage />
                </ApprovedBusinessRoute>
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
              path="/book"
              element={
                <ProtectedRoute role="customer">
                  <BookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/businesses"
              element={
                <ProtectedRoute role="admin">
                  <BusinessesPage />
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
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute role="customer">
                  <OrderTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute role="customer">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute role="customer">
                  <RewardsPage />
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
