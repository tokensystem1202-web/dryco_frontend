import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, Package, Tag, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../features/auth/auth-store';
import {
  Business,
  BusinessOrderListItem,
  BusinessStats,
  getBusinessOrders,
  getBusinessStatsRequest,
  getMyBusiness,
  updateBusinessOrderStatus,
} from '../services/api';

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

const nextStatusMap: Partial<Record<BusinessOrderListItem['status'], BusinessOrderListItem['status']>> = {
  requested: 'accepted',
  accepted: 'picked_up',
  picked_up: 'cleaning',
  cleaning: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

function formatStatus(value: string) {
  return value.replace(/_/g, ' ');
}

function getStatusClass(value: string) {
  return `status-pill status-${value}`;
}

export function BusinessDashboardPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [orders, setOrders] = useState<BusinessOrderListItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const load = async () => {
    try {
      const myBusiness = await getMyBusiness();
      setBusiness(myBusiness);

      if (!myBusiness) {
        return;
      }

      const [businessStats, businessOrders] = await Promise.all([
        getBusinessStatsRequest(myBusiness.id),
        getBusinessOrders(),
      ]);

      setStats(businessStats);
      setOrders(businessOrders);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const metrics = useMemo(
    () => [
      { label: 'Total Orders', value: String(stats?.totalOrders ?? 0), trend: 'All business orders', tone: 'blue' as const },
      { label: 'Total Revenue', value: `Rs ${Number(stats?.revenue ?? 0).toFixed(0)}`, trend: 'Delivered revenue', tone: 'green' as const },
      { label: 'Pending Orders', value: String(stats?.pendingOrders ?? 0), trend: 'Orders needing action', tone: 'orange' as const },
    ],
    [stats],
  );

  const updateStatus = async (order: BusinessOrderListItem) => {
    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) {
      return;
    }

    setBusy(true);
    setMessage('');
    setErrorMessage('');

    try {
      await updateBusinessOrderStatus(order.id, nextStatus);
      await load();
      setMessage(`Order moved to ${formatStatus(nextStatus)}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="business-mobile-dashboard page-stack">
      <section className="business-mobile-hero">
        <div>
          <p className="eyebrow">Business Partner</p>
          <h2>{business?.businessName || user?.name || 'business'}</h2>
          <span>Fast mobile workflow for approved dry cleaners.</span>
        </div>
        <div className="business-status-pill">{business?.isApproved ? 'approved business' : 'pending'}</div>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="mobile-metrics-grid business-metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className={`mini-stat-card tone-${metric.tone ?? 'green'}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.trend}</small>
          </article>
        ))}
      </section>

      <section className="quick-actions-grid">
        <Link className="quick-action-card" to="/business/pricing">
          <span className="icon-badge tone-green-light">
            <Package size={16} />
          </span>
          <strong>Pricing Management</strong>
          <small>Add, edit, and delete items</small>
        </Link>
        <Link className="quick-action-card" to="/business/offers">
          <span className="icon-badge tone-blue-light">
            <Tag size={16} />
          </span>
          <strong>Coupons & Offers</strong>
          <small>Create live discounts with expiry</small>
        </Link>
      </section>

      <section className="mobile-section-card business-earnings-card">
        <div className="section-row">
          <div>
            <h3>Payout Snapshot</h3>
            <p>Values update from real delivered orders</p>
          </div>
          <span className="earnings-chip">
            <ArrowUpRight size={14} />
            live
          </span>
        </div>
        <div className="earnings-grid">
          <div>
            <span>Collected</span>
            <strong>₹{Number(stats?.revenue ?? 0).toFixed(0)}</strong>
          </div>
          <div>
            <span>Pending</span>
            <strong>{stats?.pendingOrders ?? 0}</strong>
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
              <p>Accept and move orders through the cleaning workflow.</p>
            </div>
          </div>
        </div>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>No live orders yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerId.slice(0, 8)}</td>
                    <td>{order.items.map((item) => `${item.itemName} x${item.quantity}`).join(', ') || '-'}</td>
                    <td>Rs {order.totalAmount}</td>
                    <td>
                      <span className={getStatusClass(order.status)}>{formatStatus(order.status)}</span>
                    </td>
                    <td>
                      {nextStatusMap[order.status] ? (
                        <button className="primary-button table-button" type="button" onClick={() => void updateStatus(order)} disabled={busy}>
                          {order.status === 'requested' ? 'Accept order' : `Move to ${formatStatus(nextStatusMap[order.status] as string)}`}
                        </button>
                      ) : (
                        <span className="status-pill status-approved">done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mobile-section-card ops-ticker-card">
        <div className="ops-ticker-item">
          <Wallet size={16} />
          <span>{stats?.activeRiders ?? 0} active riders configured</span>
        </div>
        <div className="ops-ticker-item">
          <Clock3 size={16} />
          <span>{orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length} orders in progress</span>
        </div>
      </section>
    </div>
  );
}
