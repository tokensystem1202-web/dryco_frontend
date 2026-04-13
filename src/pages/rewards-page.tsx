import { Gift, Medal, Sparkles, TicketPercent } from 'lucide-react';

const rewardCards = [
  { title: 'Points', value: '240', detail: 'Available now' },
  { title: 'Pickup streak', value: '4 weeks', detail: 'Weekly orders' },
  { title: 'Referral', value: 'Rs 150', detail: 'Next unlock' },
];

const upcomingPerks = [
  '300 points unlocks a free express pickup slot.',
  '500 points unlocks Rs 200 off on your next dry-clean order.',
  '750 points unlocks premium garment care support.',
];

export function RewardsPage() {
  return (
    <div className="page-stack">
      <section className="page-hero compact-hero customer-portal-hero">
        <div>
          <p className="eyebrow">Rewards</p>
          <h2>Points, referrals, and perks.</h2>
          <p className="hero-copy">Everything in one place.</p>
        </div>
        <div className="profile-badge-card">
          <Gift size={22} />
          <strong>Rewards wallet active</strong>
          <small>240 points available</small>
        </div>
      </section>

      <section className="mobile-metrics-grid rewards-grid">
        {rewardCards.map((card) => (
          <article key={card.title} className="mini-stat-card tone-green">
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </section>

      <section className="booking-layout">
        <article className="mobile-section-card booking-panel">
          <div className="section-row">
            <div>
              <h3>Upcoming Milestones</h3>
              <p>What unlocks next.</p>
            </div>
            <Medal size={18} />
          </div>

          <div className="perk-list">
            {upcomingPerks.map((perk) => (
              <article key={perk} className="portal-link-card">
                <Sparkles size={18} />
                <span>{perk}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="mobile-section-card booking-summary-panel">
          <div className="section-row">
            <div>
              <h3>Best Ways to Earn</h3>
              <p>Simple ways to earn more.</p>
            </div>
            <TicketPercent size={18} />
          </div>
          <div className="perk-list">
            <article className="portal-link-card"><span>Complete an order and rate the service partner.</span></article>
            <article className="portal-link-card"><span>Book subscription-friendly weekly pickups.</span></article>
            <article className="portal-link-card"><span>Refer a friend and have them complete their first order.</span></article>
          </div>
        </article>
      </section>
    </div>
  );
}