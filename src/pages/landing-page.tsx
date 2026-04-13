import { ArrowRight, Shield, Store, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Fresh Laundry, Delivered</p>
          <h1>WashFlow makes laundry feel like a premium mobile product.</h1>
          <p className="hero-copy">
            Customer bookings, business operations, and admin control ko ek hi polished
            ecosystem me run karo with realtime visibility and cleaner design.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/login">
              Launch demo
              <ArrowRight size={16} />
            </Link>
            <a className="secondary-link" href="#capabilities">
              Explore modules
            </a>
          </div>
        </div>

        <div className="hero-matrix">
          <div className="matrix-card accent-card">
            <span className="icon-badge tone-blue-light">
              <Zap size={16} />
            </span>
            <strong>Socket-based order tracking</strong>
          </div>
          <div className="matrix-card">
            <span className="icon-badge tone-green-light">
              <Store size={16} />
            </span>
            <strong>Razorpay and Stripe ready</strong>
          </div>
          <div className="matrix-card">
            <span className="icon-badge tone-purple-light">
              <Shield size={16} />
            </span>
            <strong>JWT access and refresh flows</strong>
          </div>
          <div className="matrix-card accent-card-soft">
            <span className="icon-badge tone-orange-light">
              <Truck size={16} />
            </span>
            <strong>Push + email delivery hooks</strong>
          </div>
        </div>
      </section>

      <section className="showcase" id="capabilities">
        <div className="section-heading">
          <p className="eyebrow">Platform Modules</p>
          <h2>Real businesses and orders appear here after backend entries exist</h2>
        </div>

        <div className="business-grid">
          <article className="business-card">
            <span>Customer App</span>
            <h3>Bookings and order tracking</h3>
            <p>Shows real businesses, real orders, and subscription data only.</p>
          </article>
          <article className="business-card">
            <span>Business Portal</span>
            <h3>Pricing, riders, and dispatch</h3>
            <p>All operational cards remain empty until actual entries are added.</p>
          </article>
          <article className="business-card">
            <span>Admin Panel</span>
            <h3>Approvals, commissions, analytics</h3>
            <p>Dashboard metrics populate only from live database records.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
