import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { StatsCard } from '../components/stats-card';
import { dashboardMetrics, getAdminBusinessRegistrations } from '../services/api';

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

export function AdminDashboardPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const registrations = await getAdminBusinessRegistrations();
        setPendingCount(registrations.filter((item) => item.status === 'pending').length);
        setApprovedCount(registrations.filter((item) => item.status === 'approved').length);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void load();
  }, []);

  const adminMetrics = useMemo(
    () => [
      { label: 'Pending Requests', value: String(pendingCount), trend: pendingCount ? 'Requires moderation' : 'No open requests', tone: 'orange' as const },
      { label: 'Approved Partners', value: String(approvedCount), trend: approvedCount ? 'Business portal enabled' : 'No approved registrations yet', tone: 'green' as const },
      dashboardMetrics.admin[0],
    ],
    [approvedCount, pendingCount],
  );

  return (
    <div className="page-stack">
      <section className="page-hero admin-hero-card">
        <div>
          <p className="eyebrow">Super Admin Workspace</p>
          <h2>Review business requests, approve registrations, and control platform access.</h2>
        </div>
        <div className="highlight-box admin-highlight-box">
          <span>Governance</span>
          <strong>{pendingCount ? `${pendingCount} partner request(s) waiting for review` : 'No pending partner requests'}</strong>
        </div>
      </section>

      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="stats-grid">
        {adminMetrics.map((metric) => (
          <StatsCard key={metric.label} {...metric} />
        ))}
      </section>

      <article className="panel">
        <div className="panel-header">
          <h3>Moderation Queue</h3>
          <Link className="text-link-button" to="/admin/businesses">
            Open requests
          </Link>
        </div>
        <div className="admin-moderation-grid">
          <article className="feature-strip-card">
            <Clock3 size={18} />
            <div>
              <strong>Pending verification</strong>
              <span>{pendingCount} request(s) are still waiting for admin action.</span>
            </div>
          </article>
          <article className="feature-strip-card">
            <CheckCircle2 size={18} />
            <div>
              <strong>Approved businesses</strong>
              <span>{approvedCount} request(s) already moved into the business portal flow.</span>
            </div>
          </article>
          <article className="feature-strip-card">
            <ShieldCheck size={18} />
            <div>
              <strong>Admin-only actions</strong>
              <span>Approve and reject endpoints are protected by the admin guard.</span>
            </div>
          </article>
          <article className="feature-strip-card">
            <Building2 size={18} />
            <div>
              <strong>Business login</strong>
              <span>Approved partners can use OTP login with their approved phone number.</span>
            </div>
          </article>
        </div>
      </article>
    </div>
  );
}
