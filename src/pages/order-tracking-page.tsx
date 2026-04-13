import axios from 'axios';
import { Check, CircleDashed, MessageCircle, Phone, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelOrderRequest, getOrderDetails, OrderDetails } from '../services/api';

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

function formatStatus(value: string) {
  return value.replace(/_/g, ' ');
}

function getStatusClass(value: string) {
  return `status-pill status-${value}`;
}

function extractInfo(notes?: string | null) {
  if (!notes) {
    return { address: '', phone: '', instructions: '' };
  }

  const parts = notes.split(' | ');
  return {
    address: parts.find((item) => item.startsWith('Pickup Address:'))?.replace('Pickup Address:', '').trim() ?? '',
    phone: parts.find((item) => item.startsWith('Contact Phone:'))?.replace('Contact Phone:', '').trim() ?? '',
    instructions: parts.filter((item) => !item.startsWith('Pickup Address:') && !item.startsWith('Contact Phone:')).join(' | '),
  };
}

export function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const load = async () => {
      try {
        setOrder(await getOrderDetails(id));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void load();
  }, [id]);

  const timeline = useMemo(() => {
    const flow = ['requested', 'accepted', 'picked_up', 'cleaning', 'out_for_delivery', 'delivered'];
    return flow.map((status) => {
      const matched = order?.timeline.find((entry) => entry.status === status);
      const currentIndex = order ? flow.indexOf(order.status) : -1;
      const stepIndex = flow.indexOf(status);

      return {
        label: formatStatus(status),
        done: currentIndex > stepIndex || (status === 'delivered' && order?.status === 'delivered'),
        active: order?.status === status,
        time: matched?.at ? new Date(matched.at).toLocaleString() : '',
      };
    });
  }, [order]);

  const details = extractInfo(order?.specialInstructions);

  const cancelOrder = async () => {
    if (!order) {
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      await cancelOrderRequest(order.id);
      setOrder(await getOrderDetails(order.id));
      setMessage('Order cancelled successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="tracking-header-card">
        <div>
          <p className="eyebrow">Live Tracking</p>
          <h2>{order?.orderNumber ?? 'Loading order...'}</h2>
          <p>{details.address || 'Pickup details will appear here.'}</p>
        </div>
        <span className={getStatusClass(order?.status ?? 'requested')}>
          {order ? formatStatus(order.status) : 'pending'}
        </span>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="mobile-section-card timeline-card">
        {timeline.map((step, index) => (
          <div key={step.label} className="timeline-row">
            <div className="timeline-rail">
              <span className={step.done ? 'timeline-dot timeline-dot-done' : step.active ? 'timeline-dot timeline-dot-active' : 'timeline-dot timeline-dot-pending'}>
                {step.done ? <Check size={12} /> : <CircleDashed size={12} />}
              </span>
              {index !== timeline.length - 1 ? <span className={step.done ? 'timeline-line timeline-line-done' : 'timeline-line'} /> : null}
            </div>
            <div className="timeline-content-block">
              <strong>{step.label}</strong>
              <span>{step.time || 'Waiting'}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="booking-layout">
        <article className="mobile-section-card booking-panel">
          <div className="section-row">
            <div>
              <h3>Order Summary</h3>
              <p>{order?.items.length ?? 0} item{(order?.items.length ?? 0) === 1 ? '' : 's'}</p>
            </div>
            <strong>Rs {order?.totalAmount ?? 0}</strong>
          </div>

          <div className="mobile-order-list">
            {order?.items.map((item) => (
              <article key={item.id} className="mobile-order-card">
                <div>
                  <strong>{item.itemName}</strong>
                  <p>Qty {item.quantity} • Rs {item.pricePerUnit}</p>
                </div>
                <div className="order-side-meta">
                  <strong>Rs {item.totalPrice}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="mobile-section-card booking-panel rider-card-modern">
          <div className="rider-identity">
            <div className="rider-avatar">R</div>
            <div>
              <strong>{order?.riderId ? `Rider ${order.riderId.slice(0, 6)}` : 'Dispatch team pending'}</strong>
              <p>{details.instructions || 'Call or WhatsApp support.'}</p>
            </div>
          </div>

          <div className="contact-actions-row">
            <a className="circle-action success-action" href={`tel:${details.phone || '+919999999999'}`}>
              <Phone size={16} />
            </a>
            <a className="circle-action" href={`https://wa.me/${(details.phone || '919999999999').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} />
            </a>
            <button className="circle-action" type="button">
              <Truck size={16} />
            </button>
          </div>

          {order && ['requested', 'accepted'].includes(order.status) ? (
            <button className="secondary-button full-width-button" type="button" onClick={() => void cancelOrder()} disabled={busy}>
              Cancel order
            </button>
          ) : null}

          <Link className="secondary-button full-width-button" to="/orders">
            Back to history
          </Link>
        </article>
      </section>
    </div>
  );
}