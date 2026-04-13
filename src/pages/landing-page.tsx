import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Droplets,
  MapPinned,
  Phone,
  Package,
  Receipt,
  Shirt,
  Sparkles,
  Star,
  Truck,
  Wallet,
  WashingMachine,
  MessageCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'));

    if (!items.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -48px 0px',
      },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <div className="marketing-logo">
          <span className="marketing-logo-mark">D</span>
          <div>
            <strong>DryCo</strong>
            <span>Laundry & Dry Cleaning Platform</span>
          </div>
        </div>

        <nav className="marketing-nav">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <Link className="primary-button marketing-cta" to="/login">
            Book Pickup
          </Link>
        </nav>
      </header>

      <main className="marketing-main">
        <section className="marketing-hero reveal-on-scroll reveal-visible" id="home">
          <div className="marketing-hero-copy marketing-hero-copy-minimal">
            <p className="eyebrow">Doorstep Laundry Platform</p>
            <h1>Doorstep Dry Cleaning & Laundry</h1>
            <p>Pickup. Clean. Deliver - all in one tap.</p>

            <div className="marketing-hero-actions">
              <Link className="primary-button" to="/login">
                Book Pickup
                <ArrowRight size={16} />
              </Link>
              <a className="secondary-link" href="tel:+919000000000">
                <Phone size={16} />
                Call Now
              </a>
            </div>

            <div className="trust-badges">
              <span>
                <BadgeCheck size={16} />
                Fast
              </span>
              <span>
                <Wallet size={16} />
                Affordable
              </span>
              <span>
                <Star size={16} />
                Reliable
              </span>
            </div>
          </div>

          <div className="hero-visual-card marketing-hero-visual">
            <div className="hero-service-card hero-service-card-main floating-card-delay-1">
              <span className="service-chip">Live pickup</span>
              <strong>Pickup in 30 mins in selected zones</strong>
              <p>Fast turnaround with trusted garment care.</p>
            </div>

            <div className="hero-service-stack">
              <article className="hero-mini-card floating-card-delay-2">
                <Truck size={18} />
                <div>
                  <strong>Free Pickup</strong>
                  <span>Doorstep collection</span>
                </div>
              </article>
              <article className="hero-mini-card hero-mini-card-green floating-card-delay-3">
                <Sparkles size={18} />
                <div>
                  <strong>Fabric Safe Care</strong>
                  <span>Professional handling</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="marketing-action-bar reveal-on-scroll" aria-label="Quick actions">
          <Link className="marketing-action-chip" to="/login">
            <Sparkles size={18} />
            <div>
              <strong>Book Pickup</strong>
              <span>Schedule now</span>
            </div>
          </Link>
          <Link className="marketing-action-chip" to="/login">
            <Package size={18} />
            <div>
              <strong>Track Order</strong>
              <span>Live status</span>
            </div>
          </Link>
          <a className="marketing-action-chip" href="#services">
            <Receipt size={18} />
            <div>
              <strong>View Prices</strong>
              <span>See services</span>
            </div>
          </a>
          <a className="marketing-action-chip" href="#contact">
            <MessageCircle size={18} />
            <div>
              <strong>Contact</strong>
              <span>Talk to us</span>
            </div>
          </a>
        </section>

        <section className="marketing-section marketing-section-compact reveal-on-scroll">
          <div className="marketing-section-heading">
            <p className="eyebrow">Feature Highlights</p>
            <h2>Built to feel fast, premium, and effortless.</h2>
          </div>

          <div className="marketing-scroll-row" aria-label="Live feature highlights">
            <article className="marketing-scroll-card">
              <Clock3 size={20} />
              <strong>Pickup in 30 mins</strong>
              <span>Fast slot availability</span>
            </article>
            <article className="marketing-scroll-card">
              <Truck size={20} />
              <strong>Free Delivery</strong>
              <span>Doorstep drop-off</span>
            </article>
            <article className="marketing-scroll-card">
              <Droplets size={20} />
              <strong>Fabric Safe Care</strong>
              <span>Gentle cleaning workflow</span>
            </article>
            <article className="marketing-scroll-card">
              <Wallet size={20} />
              <strong>Affordable Pricing</strong>
              <span>Simple, transparent rates</span>
            </article>
          </div>
        </section>

        <section className="marketing-section reveal-on-scroll" id="services">
          <div className="marketing-section-heading">
            <p className="eyebrow">Services</p>
            <h2>Core services, easy to scan.</h2>
          </div>

          <div className="service-card-grid service-card-grid-compact">
            <article className="service-feature-card service-feature-card-compact">
              <span className="icon-badge tone-blue-light">
                <Shirt size={18} />
              </span>
              <h3>Dry Cleaning</h3>
              <p>Premium care for delicate wear.</p>
            </article>

            <article className="service-feature-card service-feature-card-compact">
              <span className="icon-badge tone-green-light">
                <WashingMachine size={18} />
              </span>
              <h3>Washing</h3>
              <p>Daily wear cleaned and folded fast.</p>
            </article>

            <article className="service-feature-card service-feature-card-compact">
              <span className="icon-badge tone-blue-light">
                <Sparkles size={18} />
              </span>
              <h3>Ironing</h3>
              <p>Wrinkle-free finishing for essentials.</p>
            </article>
          </div>
        </section>

        <section className="marketing-section reveal-on-scroll">
          <div className="marketing-section-heading">
            <p className="eyebrow">How It Works</p>
            <h2>Three simple steps.</h2>
          </div>

          <div className="how-flow" aria-label="How it works">
            <article className="how-card how-card-flow">
              <span className="how-step">01</span>
              <h3>Book Pickup</h3>
              <p>Choose service and time slot.</p>
            </article>
            <span className="how-flow-line" aria-hidden="true" />
            <article className="how-card how-card-flow">
              <span className="how-step">02</span>
              <h3>We Collect</h3>
              <p>Pickup from home or office.</p>
            </article>
            <span className="how-flow-line" aria-hidden="true" />
            <article className="how-card how-card-flow">
              <span className="how-step">03</span>
              <h3>Clean & Deliver</h3>
              <p>Fresh clothes delivered back fast.</p>
            </article>
          </div>
        </section>

        <section className="offer-banner-section reveal-on-scroll">
          <div className="offer-banner-card">
            <div>
              <p className="eyebrow offer-eyebrow">Launch Offer</p>
              <h2>Flat ₹100 Off on First Order</h2>
            </div>
            <div className="offer-actions">
              <Link className="primary-button" to="/login">
                Claim Offer
              </Link>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-compact reveal-on-scroll" id="contact">
          <div className="marketing-section-heading">
            <p className="eyebrow">Contact</p>
            <h2>Reach us instantly.</h2>
          </div>

          <div className="contact-action-grid">
            <a className="contact-action-card" href="tel:+919000000000">
              <Phone size={20} />
              <div>
                <strong>Call Now</strong>
                <span>Talk to support</span>
              </div>
            </a>
            <a className="contact-action-card" href="https://wa.me/919000000000" target="_blank" rel="noreferrer">
              <MessageCircle size={20} />
              <div>
                <strong>WhatsApp</strong>
                <span>Quick booking help</span>
              </div>
            </a>
            <a className="contact-action-card" href="https://maps.google.com/?q=DryCo+Laundry" target="_blank" rel="noreferrer">
              <MapPinned size={20} />
              <div>
                <strong>Get Directions</strong>
                <span>Open map</span>
              </div>
            </a>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="footer-grid footer-grid-compact">
          <div>
            <strong>About</strong>
            <p>DryCo helps customers book pickup, cleaning, and delivery in minutes.</p>
          </div>
          <div>
            <strong>Contact</strong>
            <p>support@dryco.app</p>
            <p>+91 90000 00000</p>
          </div>
          <div>
            <strong>Admin</strong>
            <Link className="footer-admin-link" to="/login?portal=admin">
              Admin
            </Link>
          </div>
          <div>
            <strong>Social</strong>
            <div className="footer-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
          <div>
            <strong>Join as Business</strong>
            <Link className="primary-button footer-join-button" to="/business/register">
              Join as a Business
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
