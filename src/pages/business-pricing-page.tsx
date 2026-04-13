import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  ServiceItem,
  createService,
  getBusinessServices,
  getMyBusiness,
  removeService,
  updateServiceRequest,
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

const defaultForm = {
  id: '',
  name: '',
  category: 'wash' as ServiceItem['category'],
  pricePerUnit: '0',
  unit: 'piece',
  description: '',
};

export function BusinessPricingPage() {
  const [businessId, setBusinessId] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const refreshServices = async (nextBusinessId?: string) => {
    const targetBusinessId = nextBusinessId ?? businessId;
    if (!targetBusinessId) {
      return;
    }

    setServices(await getBusinessServices(targetBusinessId));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const business = await getMyBusiness();
        if (!business) {
          return;
        }

        setBusinessId(business.id);
        await refreshServices(business.id);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void load();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!businessId) {
      return;
    }

    setBusy(true);
    setMessage('');
    setErrorMessage('');

    try {
      if (form.id) {
        await updateServiceRequest(form.id, {
          name: form.name,
          category: form.category,
          pricePerUnit: Number(form.pricePerUnit),
          unit: form.unit,
          description: form.description,
        });
        setMessage('Pricing item updated.');
      } else {
        await createService({
          businessId,
          name: form.name,
          category: form.category,
          pricePerUnit: Number(form.pricePerUnit),
          unit: form.unit,
          description: form.description,
        });
        setMessage('Pricing item created.');
      }

      setForm(defaultForm);
      await refreshServices();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const edit = (service: ServiceItem) => {
    setForm({
      id: service.id,
      name: service.name,
      category: service.category,
      pricePerUnit: String(service.pricePerUnit),
      unit: service.unit,
      description: service.description ?? '',
    });
  };

  const remove = async (id: string) => {
    setBusy(true);
    setMessage('');
    setErrorMessage('');

    try {
      await removeService(id);
      await refreshServices();
      setMessage('Pricing item deleted.');
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
          <p className="eyebrow">Pricing Management</p>
          <h2>Add, edit, and delete your item pricing from one mobile-ready screen.</h2>
          <p className="hero-copy">Each price you set here flows directly into customer booking and order totals.</p>
        </div>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="business-portal-layout">
        <form className="mobile-section-card booking-panel" onSubmit={(event) => void submit(event)}>
          <div className="section-row">
            <div>
              <h3>{form.id ? 'Edit item' : 'Add item'}</h3>
              <p>Set item names and prices per unit.</p>
            </div>
          </div>

          <div className="form-grid compact-form-grid">
            <label>
              <span>Item name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              <span>Category</span>
              <select className="form-select" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ServiceItem['category'] }))}>
                <option value="wash">Wash</option>
                <option value="dry_clean">Dry Clean</option>
                <option value="iron">Iron</option>
                <option value="wash_iron">Wash + Iron</option>
              </select>
            </label>
            <label>
              <span>Price per item</span>
              <input type="number" min="0" step="0.01" value={form.pricePerUnit} onChange={(event) => setForm((current) => ({ ...current, pricePerUnit: event.target.value }))} required />
            </label>
            <label>
              <span>Unit</span>
              <input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} required />
            </label>
          </div>

          <label>
            <span>Description</span>
            <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>

          <div className="admin-action-row">
            <button className="primary-button" type="submit" disabled={busy}>
              {form.id ? 'Update item' : 'Add item'}
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
            <h3>Pricing Table</h3>
            <span>{services.length} items</span>
          </div>
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No pricing items yet.</td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.category.replace(/_/g, ' ')}</td>
                      <td>Rs {service.pricePerUnit}/{service.unit}</td>
                      <td>
                        <div className="table-action-row">
                          <button className="icon-button" type="button" onClick={() => edit(service)}>
                            <Pencil size={16} />
                          </button>
                          <button className="icon-button" type="button" onClick={() => void remove(service.id)} disabled={busy}>
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