import { NavLink, useLocation } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import {
  Bell,
  BookOpen,
  Building2,
  Home,
  LogOut,
  Package,
  Shield,
  ShoppingBag,
  Store,
  Zap,
} from 'lucide-react';
import { AppRole } from '../services/api';
import { useAuth } from '../features/auth/auth-store';

const navItems: Record<
  AppRole,
  Array<{ to: string; label: string; icon: typeof Home }>
> = {
  customer: [
    { to: '/customer', label: 'Home', icon: Home },
    { to: '/businesses', label: 'Book', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: Package },
  ],
  business: [
    { to: '/business', label: 'Dashboard', icon: Home },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/businesses', label: 'Catalog', icon: BookOpen },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: Shield },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/businesses', label: 'Businesses', icon: Building2 },
  ],
};

export function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <>{children}</>;
  }

  const pageTitle =
    navItems[user.role].find((item) => location.pathname.startsWith(item.to))?.label ??
    'WashFlow';

  if (user.role !== 'admin') {
    return (
      <div className={`app-shell mobile-shell role-${user.role}`}>
        <div className="mobile-stage">
          <div className="phone-frame">
            <div className="phone-shell">
              <div className="device-statusbar">
                <span>9:41</span>
                <div className="status-icons">
                  <span>LTE</span>
                  <span>100%</span>
                </div>
              </div>

              <header className="mobile-headerbar">
                <div className="mobile-brandmark">
                  <span className="logo-dot">
                    {user.role === 'customer' ? <Zap size={16} /> : <Store size={16} />}
                  </span>
                  <div>
                    <strong>{pageTitle}</strong>
                    <span>
                      {user.role === 'customer'
                        ? 'Fresh Laundry, Delivered'
                        : 'Business Portal'}
                    </span>
                  </div>
                </div>

                <button className="icon-button" type="button" aria-label="Notifications">
                  <Bell size={20} />
                </button>
              </header>

              <main className="mobile-content">{children}</main>

              <nav className="mobile-bottom-nav">
                {navItems[user.role].map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        isActive ? 'mobile-tab mobile-tab-active' : 'mobile-tab'
                      }
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          <button className="floating-logout" type="button" onClick={logout}>
            <LogOut size={16} />
            Exit demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar admin-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="logo-dot logo-dot-admin">
              <Shield size={16} />
            </span>
            <div>
              <strong>WashFlow Admin</strong>
              <span>Super Admin Panel</span>
            </div>
          </div>

          <nav className="nav-stack">
            {navItems[user.role].map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active admin-nav-link' : 'nav-link admin-nav-link'
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="profile-card admin-profile-card">
          <span className="role-pill role-pill-admin">{user.role}</span>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <button className="ghost-button admin-ghost-button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="desktop-header">
          <div>
            <p className="eyebrow">Control Center</p>
            <h1 className="desktop-title">{pageTitle}</h1>
          </div>
          <div className="desktop-userchip">
            <span className="avatar-chip">W</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>
        <main className="content admin-content">{children}</main>
      </div>
    </div>
  );
}
