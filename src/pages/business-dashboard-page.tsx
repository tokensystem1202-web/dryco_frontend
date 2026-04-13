import { ArrowUpRight, Bike, Clock3, Package, Wallet } from 'lucide-react';
import { dashboardMetrics } from '../services/api';
import { useAuth } from '../features/auth/auth-store';

export function BusinessDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="business-mobile-dashboard page-stack">
      <section className="business-mobile-hero">
        <div>
          <p className="eyebrow">Business Partner</p>
          <h2>{user?.name || 'business'}</h2>
          <span>Real orders, riders, and payouts will appear after onboarding.</span>
        </div>
        <div className="business-status-pill">No live business data yet</div>
      </section>

      <section className="mobile-metrics-grid business-metrics-grid">
        {dashboardMetrics.business.map((metric) => (
          <article key={metric.label} className={`mini-stat-card tone-${metric.tone ?? 'green'}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.trend}</small>
          </article>
        ))}
      </section>

      <section className="quick-actions-grid">
        <button className="quick-action-card" type="button">
          <span className="icon-badge tone-green-light">
            <Package size={16} />
          </span>
          <strong>Manage Orders</strong>
          <small>Create real orders to manage workflow</small>
        </button>
        <button className="quick-action-card" type="button">
          <span className="icon-badge tone-blue-light">
            <Bike size={16} />
          </span>
          <strong>Rider Queue</strong>
          <small>Add rider entries from the backend</small>
        </button>
      </section>

      <section className="mobile-section-card business-earnings-card">
        <div className="section-row">
          <div>
            <h3>Payout Snapshot</h3>
            <p>Values will populate from completed deliveries</p>
          </div>
          <span className="earnings-chip">
            <ArrowUpRight size={14} />
            0%
          </span>
        </div>
        <div className="earnings-grid">
          <div>
            <span>Collected</span>
            <strong>₹0</strong>
          </div>
          <div>
            <span>Pending</span>
            <strong>₹0</strong>
          </div>
        </div>
      </section>

      <section className="mobile-section-card">
        <div className="section-row">
          <div className="section-title-wrap">
            <span className="icon-badge tone-orange-light">
              <Clock3 size={16} />
            </span>
            <div>
              <h3>Live Order Queue</h3>
              <p>Realtime business operations feed</p>
            </div>
          </div>
        </div>
        <div className="mobile-order-list">
          <article className="mobile-order-card business-order-card empty-state-card">
            <div>
              <strong>No order queue yet</strong>
              <p>Incoming customer orders will appear here automatically.</p>
              <small>Add services and approve business onboarding first.</small>
            </div>
            <div className="order-side-meta">
              <strong>0 records</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="mobile-section-card ops-ticker-card">
        <div className="ops-ticker-item">
          <Wallet size={16} />
          <span>No settlement scheduled yet</span>
        </div>
        <div className="ops-ticker-item">
          <Bike size={16} />
          <span>Rider utilization appears after real assignments</span>
        </div>
      </section>
    </div>
  );
}
