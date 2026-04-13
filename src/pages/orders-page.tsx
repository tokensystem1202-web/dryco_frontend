import axios from 'axios';
import { Check, CircleDashed } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-store';
import {
  getAdminOrders,
  getBusinessOrders,
  getCustomerOrders,
  getOrderDetails as getOrderDetailsRequest,
  OrderDetails,
  OrderListItem,
  updateBusinessOrderStatus,
} from '../services/api';

const nextStatusMap: Partial<Record<OrderListItem['status'], OrderListItem['status']>> = {
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

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: { message?: string | string[] } | string; message?: string | string[] }
      | undefined;
    const message = payload?.message ?? payload?.error;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Request failed';
}

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const items =
          user.role === 'customer'
            ? await getCustomerOrders()
            : user.role === 'business'
              ? await getBusinessOrders()
              : await getAdminOrders();

        setOrders(items);

        if (items[0] && user.role === 'business') {
          setSelectedOrder(await getOrderDetailsRequest(items[0].id));
        } else {
          setSelectedOrder(null);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  const timeline = useMemo(() => {
    const order = selectedOrder;
    const flow = ['requested', 'accepted', 'picked_up', 'cleaning', 'out_for_delivery', 'delivered'];

    return flow.map((status) => {
      const matched = order?.timeline.find((entry) => entry.status === status);
      const currentIndex = order ? flow.indexOf(order.status) : -1;
      const stepIndex = flow.indexOf(status);

      return {
        label: formatStatus(status),
        done: currentIndex > stepIndex || status === 'delivered' && order?.status === 'delivered',
        active: order?.status === status,
        time: matched?.at ? new Date(matched.at).toLocaleString() : '',
      };
    });
  }, [selectedOrder]);

  const refreshOrders = async () => {
    if (!user) {
      return;
    }

    setBusy(true);
    setErrorMessage('');

    try {
      const items =
        user.role === 'customer'
          ? await getCustomerOrders()
          : user.role === 'business'
            ? await getBusinessOrders()
            : await getAdminOrders();
      setOrders(items);
      if (selectedOrder) {
        const refreshed = items.find((item) => item.id === selectedOrder.id);
        if (refreshed && user.role === 'business') {
          setSelectedOrder(await getOrderDetailsRequest(refreshed.id));
        }
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const advanceOrderStatus = async (order: OrderListItem) => {
    if (!user) {
      return;
    }

    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) {
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      await updateBusinessOrderStatus(order.id, nextStatus);
      await refreshOrders();
      setMessage(`Order moved to ${formatStatus(nextStatus)}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return null;
  }

  if (user.role === 'customer') {
    return (
      <div className="page-stack">
        <section className="page-hero compact-hero customer-portal-hero">
          <div>
            <p className="eyebrow">Orders</p>
            <h2>Track all your orders in one place.</h2>
            <p className="hero-copy">View status, pricing, and tracking.</p>
          </div>
          <Link className="primary-button" to="/book">Book Pickup</Link>
        </section>

        {message ? <p className="success-text">{message}</p> : null}
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <section className="mobile-section-card booking-panel">
          <div className="section-row">
            <div>
              <h3>Order History</h3>
              <p>{orders.length} order{orders.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="mobile-order-list">
            {orders.length === 0 ? (
              <article className="mobile-order-card empty-state-card">
                <div>
                  <strong>No orders yet</strong>
                  <p>Start your first booking.</p>
                </div>
              </article>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="mobile-order-card customer-history-card">
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <p>{order.pickupDate}</p>
                    <span className={getStatusClass(order.status)}>{formatStatus(order.status)}</span>
                    <small>{order.pickupSlot} • {order.deliverySlot}</small>
                  </div>
                  <div className="order-side-meta">
                    <strong>Rs {order.totalAmount}</strong>
                    <Link className="text-link-button" to={`/orders/${order.id}`}>Track order</Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="page-stack">
        <section className="tracking-header-card">
          <div>
            <p className="eyebrow">Order Tracking</p>
            <h2>{selectedOrder ? selectedOrder.orderNumber : 'No active order'}</h2>
          </div>
          <span className={getStatusClass(selectedOrder?.status ?? 'requested')}>
            {selectedOrder ? formatStatus(selectedOrder.status) : 'pending'}
          </span>
        </section>

        {message ? <p className="success-text">{message}</p> : null}
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <section className="mobile-section-card timeline-card">
          {timeline.map((step, index) => (
            <div key={step.label} className="timeline-row">
              <div className="timeline-rail">
                <span
                  className={
                    step.done
                      ? 'timeline-dot timeline-dot-done'
                      : step.active
                        ? 'timeline-dot timeline-dot-active'
                        : 'timeline-dot timeline-dot-pending'
                  }
                >
                  {step.done ? <Check size={12} /> : <CircleDashed size={12} />}
                </span>
                {index !== timeline.length - 1 ? (
                  <span className={step.done ? 'timeline-line timeline-line-done' : 'timeline-line'} />
                ) : null}
              </div>
              <div className="timeline-content-block">
                <strong>{step.label}</strong>
                <span>{step.time || (loading ? 'Loading...' : 'Waiting')}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="mobile-section-card order-summary-card">
          <div className="section-row">
            <div>
              <h3>Order Summary</h3>
              <p>{selectedOrder ? `${selectedOrder.items.length} line items in this order.` : 'Summary will appear after a real order is created.'}</p>
            </div>
            <strong>Rs {selectedOrder?.totalAmount ?? 0}</strong>
          </div>
          {selectedOrder?.items?.length ? (
            <div className="mobile-order-list">
              {selectedOrder.items.map((item) => (
                <article key={item.id} className="mobile-order-card">
                  <div>
                    <strong>{item.itemName}</strong>
                    <p>
                      Qty {item.quantity} • Rs {item.pricePerUnit}
                    </p>
                  </div>
                  <div className="order-side-meta">
                    <strong>Rs {item.totalPrice}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        {user.role === 'business' ? (
          <section className="mobile-section-card">
            <div className="section-row">
              <div>
                <h3>Business queue</h3>
                <p>Advance orders as they move through pickup and delivery.</p>
              </div>
              <button className="text-link-button" type="button" onClick={() => void refreshOrders()} disabled={busy}>
                Refresh
              </button>
            </div>
            <div className="mobile-order-list">
              {orders.length === 0 ? (
                <article className="mobile-order-card empty-state-card">
                  <div>
                    <strong>No live business orders yet</strong>
                    <p>Customer orders will appear here automatically.</p>
                  </div>
                </article>
              ) : (
                orders.map((order) => (
                  <article key={order.id} className="mobile-order-card business-order-card">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{order.pickupDate}</p>
                      <span className={getStatusClass(order.status)}>{formatStatus(order.status)}</span>
                    </div>
                    <div className="order-side-meta">
                      <strong>Rs {order.totalAmount}</strong>
                      {nextStatusMap[order.status] ? (
                        <button className="primary-button" type="button" onClick={() => void advanceOrderStatus(order)} disabled={busy}>
                          Move to {nextStatusMap[order.status] ? formatStatus(nextStatusMap[order.status] as string) : ''}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Orders</p>
          <h2>Unified order view for active, historical, and flagged records.</h2>
        </div>
      </section>

      <article className="panel">
        <div className="panel-header">
          <h3>Order ledger</h3>
          <span>{orders.length} rows</span>
        </div>
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        {orders.length === 0 ? (
          <div className="list-row">
            <div>
              <strong>No platform orders yet</strong>
              <p>Admin ledger populates from live order records only.</p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="list-row">
              <div>
                <strong>{order.orderNumber}</strong>
                <p>
                  {formatStatus(order.status)} • {order.pickupDate} • Business {order.businessId.slice(0, 8)}
                </p>
              </div>
              <strong>Rs {order.totalAmount}</strong>
            </div>
          ))
        )}
      </article>
    </div>
  );
}
