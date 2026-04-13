import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  CouponInput,
  CouponItem,
  createCouponRequest,
  getCouponsRequest,
  removeCouponRequest,
  updateCouponRequest,
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

const defaultForm: CouponInput & { id?: string } = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderValue: 0,
  maxDiscount: 0,
  usageLimit: 100,
  validFrom: new Date().toISOString().slice(0, 16),
  validTill: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
};

export function BusinessOffersPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async () => {
    setCoupons(await getCouponsRequest());
  };

  useEffect(() => {
    void refresh().catch((error) => setErrorMessage(getErrorMessage(error)));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrorMessage('');

    try {
      const payload: CouponInput = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        maxDiscount: Number(form.maxDiscount) || undefined,
        usageLimit: Number(form.usageLimit) || undefined,
        validFrom: new Date(form.validFrom).toISOString(),
        validTill: new Date(form.validTill).toISOString(),
      };

      if (form.id) {
        await updateCouponRequest(form.id, payload);
        setMessage('Coupon updated.');
      } else {
        await createCouponRequest(payload);
        setMessage('Coupon created.');
      }

      setForm(defaultForm);
      await refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const edit = (coupon: CouponItem) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderValue: Number(coupon.minOrderValue),
      maxDiscount: Number(coupon.maxDiscount ?? 0),
      usageLimit: Number(coupon.usageLimit ?? 0),
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validTill: new Date(coupon.validTill).toISOString().slice(0, 16),
    });
  };

  const remove = async (id: string) => {
    setBusy(true);
    setMessage('');
    setErrorMessage('');
    try {
      await removeCouponRequest(id);
      await refresh();
      setMessage('Coupon removed.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-hero compact-hero customer-portal-hero">
        <div>
          <p className="eyebrow">Coupons & Offers</p>
          <h2>Create and manage discount codes directly from the business portal.</h2>
          <p className="hero-copy">Offer logic here is live and tied to customer checkout validation.</p>
        </div>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="business-portal-layout">
        <form className="mobile-section-card booking-panel" onSubmit={(event) => void submit(event)}>
          <div className="section-row">
            <div>
              <h3>{form.id ? 'Edit offer' : 'Create offer'}</h3>
              <p>Configure discount values and expiry windows.</p>
            </div>
          </div>

          <div className="form-grid compact-form-grid">
            <label>
              <span>Coupon code</span>
              <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} required />
            </label>
            <label>
              <span>Discount type</span>
              <select className="form-select" value={form.discountType} onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value as CouponItem['discountType'] }))}>
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </label>
            <label>
              <span>Discount value</span>
              <input type="number" min="0" step="0.01" value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: Number(event.target.value) }))} required />
            </label>
            <label>
              <span>Minimum order</span>
              <input type="number" min="0" step="0.01" value={form.minOrderValue} onChange={(event) => setForm((current) => ({ ...current, minOrderValue: Number(event.target.value) }))} required />
            </label>
            <label>
              <span>Max discount</span>
              <input type="number" min="0" step="0.01" value={form.maxDiscount} onChange={(event) => setForm((current) => ({ ...current, maxDiscount: Number(event.target.value) }))} />
            </label>
            <label>
              <span>Usage limit</span>
              <input type="number" min="0" value={form.usageLimit} onChange={(event) => setForm((current) => ({ ...current, usageLimit: Number(event.target.value) }))} />
            </label>
            <label>
              <span>Valid from</span>
              <input type="datetime-local" value={form.validFrom} onChange={(event) => setForm((current) => ({ ...current, validFrom: event.target.value }))} required />
            </label>
            <label>
              <span>Valid till</span>
              <input type="datetime-local" value={form.validTill} onChange={(event) => setForm((current) => ({ ...current, validTill: event.target.value }))} required />
            </label>
          </div>

          <div className="admin-action-row">
            <button className="primary-button" type="submit" disabled={busy}>
              {form.id ? 'Update coupon' : 'Create coupon'}
            </button>
            {form.id ? (
              <button className="secondary-button" type="button" onClick={() => setForm(defaultForm)}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <article className="panel admin-detail-panel">
          <div className="panel-header">
            <h3>Offers Table</h3>
            <span>{coupons.length} active records</span>
          </div>
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No coupons created yet.</td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td>{coupon.code}</td>
                      <td>{coupon.discountType === 'flat' ? `Rs ${coupon.discountValue}` : `${coupon.discountValue}%`}</td>
                      <td>{new Date(coupon.validTill).toLocaleDateString()}</td>
                      <td>
                        <div className="table-action-row">
                          <button className="icon-button" type="button" onClick={() => edit(coupon)}>
                            <Pencil size={16} />
                          </button>
                          <button className="icon-button" type="button" onClick={() => void remove(coupon.id)} disabled={busy}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}