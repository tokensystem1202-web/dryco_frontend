import { Bell, ChevronRight, Gift, MapPin, Package, Zap } from 'lucide-react';
import { dashboardMetrics } from '../services/api';
import { useAuth } from '../features/auth/auth-store';

export function CustomerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="customer-home page-stack">
      <section className="customer-hero">
        <div className="customer-hero-top">
          <div className="location-block">
            <MapPin size={16} />
            <div>
              <span>Delivering to</span>
              <strong>Indiranagar, Bangalore</strong>
            </div>
          </div>

          <button className="icon-button icon-button-inverse" type="button" aria-label="Alerts">
            <Bell size={18} />
            <span className="alert-dot" />
          </button>
        </div>

        <div className="customer-greeting">
          <h2>Hello, {user?.name || 'customer'}!</h2>
          <p>Book your first real order after businesses are added.</p>
        </div>

        <button className="primary-pill success-pill" type="button">
          <Zap size={18} />
          Book Pickup Now
        </button>
      </section>

      <section className="mobile-metrics-grid">
        {dashboardMetrics.customer.map((metric) => (
          <article key={metric.label} className={`mini-stat-card tone-${metric.tone ?? 'blue'}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.trend}</small>
          </article>
        ))}
      </section>

      <section className="mobile-section-card offer-card-block">
        <div className="section-row">
          <div className="section-title-wrap">
            <span className="icon-badge tone-blue-light">
              <Gift size={16} />
            </span>
            <div>
              <h3>Offers for You</h3>
              <p>Picked for your weekly laundry runs</p>
            </div>
          </div>
          <div className="pagination-dots">
            <span className="dot dot-active" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>

        <article className="promo-card">
          <span className="promo-chip">No Live Offers</span>
          <strong>Offers appear only after admin creates promotions</strong>
          <p>Add coupons from the backend to display them here.</p>
        </article>
      </section>

      <section className="mobile-section-card subscription-card-modern">
        <div className="section-row">
          <div>
            <h3>Your Subscription</h3>
            <p>No active subscription found</p>
          </div>
          <span className="subscription-pill">0 active plans</span>
        </div>
        <div className="subscription-meta-row">
          <div>
            <span>Next step</span>
            <strong>Select a business plan</strong>
          </div>
          <div>
            <span>Savings</span>
            <strong>₹0</strong>
          </div>
        </div>
      </section>

      <section className="mobile-section-card">
        <div className="section-row">
          <div className="section-title-wrap">
            <span className="icon-badge tone-blue-light">
              <Package size={16} />
            </span>
            <div>
              <h3>Recent Orders</h3>
              <p>Track live pickup and delivery updates</p>
            </div>
          </div>
        </div>
        <div className="mobile-order-list">
          <article className="mobile-order-card empty-state-card">
            <div>
              <strong>No orders yet</strong>
              <p>Real orders will appear here after checkout is completed.</p>
              <small>Create entries from the app or backend.</small>
            </div>
            <div className="order-side-meta">
              <strong>0 records</strong>
              <button className="text-link-button" type="button">
                Refresh <ChevronRight size={14} />
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
