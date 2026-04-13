import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Gift, MapPin, Package, ShieldCheck, Sparkles, Truck, Zap } from 'lucide-react';
import { dashboardMetrics, getCustomerOrders, getProfileRequest, OrderListItem, UserProfile } from '../services/api';
import { useAuth } from '../features/auth/auth-store';

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(payload?.message)) {
      return payload.message.join(', ');
    }
    if (typeof payload?.message === 'string') {
      return payload.message;
    }
  }

  return 'Request failed';
}

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [orderItems, profileResponse] = await Promise.all([
          getCustomerOrders(),
          getProfileRequest(),
        ]);
        setOrders(orderItems);
        setProfile(profileResponse);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void load();
  }, []);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status));
    const deliveredOrders = orders.filter((order) => order.status === 'delivered');
    const monthlySpend = deliveredOrders.reduce((total, order) => total + Number(order.totalAmount), 0);

    return [
      { label: 'Active Orders', value: String(activeOrders.length), trend: 'In progress', tone: 'blue' as const },
      { label: 'Completed', value: String(deliveredOrders.length), trend: 'Delivered', tone: 'green' as const },
      { label: 'Total Spend', value: `Rs ${monthlySpend.toFixed(0)}`, trend: 'All time', tone: 'purple' as const },
      { label: 'Rewards', value: '240', trend: 'Points', tone: 'orange' as const },
    ];
  }, [orders]);

  const metricsToShow = metrics.length ? metrics : dashboardMetrics.customer;

  return (
    <div className="customer-home page-stack">
      <section className="customer-hero">
        <div className="customer-hero-meta">
          <span className="hero-location-chip">
            <MapPin size={14} />
            {profile?.city || 'Set location'}
          </span>
          <Link className="icon-button icon-button-inverse" to="/profile" aria-label="Profile">
            <Award size={18} />
            <span className="alert-dot" />
          </Link>
        </div>

        <div className="customer-greeting">
          <h2>Hello, {user?.name || 'customer'}!</h2>
          <p>Schedule pickup in seconds.</p>
        </div>

        <Link className="primary-pill success-pill" to="/book">
          <Zap size={18} />
          Book Pickup
        </Link>
      </section>

      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="customer-stats-grid">
        {metricsToShow.map((metric) => (
          <article key={metric.label} className={`mini-stat-card tone-${metric.tone ?? 'blue'}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.trend}</small>
          </article>
        ))}
      </section>

      <section className="customer-tag-row" aria-label="Customer highlights">
        <span className="customer-tag-pill">
          <ShieldCheck size={14} />
          Verified
        </span>
        <span className="customer-tag-pill">
          <Truck size={14} />
          Free Pickup
        </span>
        <span className="customer-tag-pill">
          <Sparkles size={14} />
          Live Tracking
        </span>
      </section>

      <section className="customer-section customer-section-card offer-card-block">
        <div className="section-headline">
          <h3>Offer</h3>
        </div>
        <article className="promo-card">
          <span className="promo-chip">Launch Offer</span>
          <strong>Free pickup with WELCOME10</strong>
          <p>Save on your first order.</p>
        </article>
      </section>

      <section className="customer-section customer-shortcuts">
        <div className="section-headline section-headline-compact">
          <h3>Shortcuts</h3>
          <Link className="text-link-button" to="/rewards">Rewards</Link>
        </div>
        <div className="customer-shortcut-row">
          <Link className="portal-link-card customer-shortcut-card" to="/orders">
            <Package size={18} />
            <span>Orders</span>
          </Link>
          <Link className="portal-link-card customer-shortcut-card" to="/rewards">
            <Gift size={18} />
            <span>Rewards</span>
          </Link>
        </div>
      </section>

      <section className="customer-section">
        <div className="section-headline section-headline-compact">
          <h3>Recent Orders</h3>
          <Link className="text-link-button" to="/orders">View all</Link>
        </div>
        <div className="mobile-order-list">
          {orders.length === 0 ? (
            <article className="mobile-order-card empty-state-card compact-empty-state">
              <span className="icon-badge tone-blue-light">
                <Package size={16} />
              </span>
              <div className="empty-state-copy">
                <strong>No orders yet</strong>
                <p>Start your first booking.</p>
              </div>
              <Link className="secondary-button empty-state-action" to="/book">
                Book Pickup
              </Link>
            </article>
          ) : (
            orders.slice(0, 3).map((order) => (
              <article key={order.id} className="mobile-order-card">
                <div>
                  <strong>{order.orderNumber}</strong>
                  <p>{order.pickupDate}</p>
                </div>
                <div className="order-side-meta">
                  <strong>Rs {order.totalAmount}</strong>
                  <Link className="text-link-button" to={`/orders/${order.id}`}>
                    Track
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
