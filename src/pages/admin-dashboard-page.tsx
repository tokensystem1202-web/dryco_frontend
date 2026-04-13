import { StatsCard } from '../components/stats-card';
import { dashboardMetrics } from '../services/api';

export function AdminDashboardPage() {
  return (
    <div className="page-stack">
      <section className="page-hero admin-hero-card">
        <div>
          <p className="eyebrow">Super Admin Workspace</p>
          <h2>Track GMV, approve businesses, and control platform health.</h2>
        </div>
        <div className="highlight-box admin-highlight-box">
          <span>Governance</span>
          <strong>Live approvals and disputes appear after real activity</strong>
        </div>
      </section>

      <section className="stats-grid">
        {dashboardMetrics.admin.map((metric) => (
          <StatsCard key={metric.label} {...metric} />
        ))}
      </section>

      <article className="panel">
        <div className="panel-header">
          <h3>Top businesses</h3>
          <span>Live revenue leaders</span>
        </div>
        <div className="list-row">
          <div>
            <strong>No business rankings yet</strong>
            <p>Top businesses will show after real delivered orders accumulate.</p>
          </div>
        </div>
      </article>
    </div>
  );
}
