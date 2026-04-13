import axios from 'axios';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../features/auth/auth-store';
import {
  approveBusinessRequest,
  Business,
  createBusiness,
  createOrderRequest,
  createService,
  getAdminBusinesses,
  getApprovedBusinesses,
  getBusinessServices,
  getMyBusiness,
  removeService,
  ServiceItem,
} from '../services/api';

const pickupSlots = ['Morning (8AM-11AM)', 'Afternoon (12PM-3PM)', 'Evening (4PM-7PM)'];

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const errorPayload = error.response?.data as
      | { error?: { message?: string | string[] } | string; message?: string | string[] }
      | undefined;
    const message = errorPayload?.message ?? errorPayload?.error;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Request failed';
}

export function BusinessesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [adminBusinesses, setAdminBusinesses] = useState<Business[]>([]);
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    address: '',
    city: '',
    pincode: '',
    gstNumber: '',
  });
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'wash' as ServiceItem['category'],
    pricePerUnit: '0',
    unit: 'kg',
    description: '',
  });
  const [orderForm, setOrderForm] = useState({
    pickupSlot: pickupSlots[0],
    deliverySlot: pickupSlots[1],
    pickupDate: '',
    deliveryDate: '',
    couponCode: '',
    specialInstructions: '',
  });

  const hasSearchQuery = deferredQuery.trim().length > 0;
  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return businesses;
    }

    return businesses.filter((business) =>
      [business.businessName, business.city, business.address].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [businesses, deferredQuery]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        if (user.role === 'business') {
          const business = await getMyBusiness();
          setMyBusiness(business);
          if (business) {
            const catalog = await getBusinessServices(business.id);
            setServices(catalog);
          } else {
            setServices([]);
          }
          return;
        }

        if (user.role === 'admin') {
          const items = await getAdminBusinesses();
          setAdminBusinesses(items);
          return;
        }

        const items = await getApprovedBusinesses();
        setBusinesses(items);
        if (items.length > 0) {
          setSelectedBusiness(items[0]);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'customer' || !selectedBusiness) {
      return;
    }

    const loadServices = async () => {
      try {
        const catalog = await getBusinessServices(selectedBusiness.id);
        setServices(catalog);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void loadServices();
  }, [selectedBusiness, user]);

  const submitBusiness = async () => {
    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      const created = await createBusiness({
        businessName: businessForm.businessName,
        address: businessForm.address,
        city: businessForm.city,
        pincode: businessForm.pincode,
        gstNumber: businessForm.gstNumber || undefined,
      });
      setMyBusiness(created);
      setBusinessForm({ businessName: '', address: '', city: '', pincode: '', gstNumber: '' });
      setMessage('Business registered. Admin approval is required before customers can see it.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const submitService = async () => {
    if (!myBusiness) {
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      await createService({
        businessId: myBusiness.id,
        name: serviceForm.name,
        category: serviceForm.category,
        pricePerUnit: Number(serviceForm.pricePerUnit),
        unit: serviceForm.unit,
        description: serviceForm.description || undefined,
      });

      setServices(await getBusinessServices(myBusiness.id));
      setServiceForm({ name: '', category: 'wash', pricePerUnit: '0', unit: 'kg', description: '' });
      setMessage('Service added to your business catalog.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const deleteCatalogItem = async (id: string) => {
    if (!myBusiness) {
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      await removeService(id);
      setServices(await getBusinessServices(myBusiness.id));
      setMessage('Service removed from catalog.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const toggleApproval = async (business: Business, approved: boolean) => {
    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      await approveBusinessRequest(business.id, approved);
      setAdminBusinesses(await getAdminBusinesses());
      setMessage(`Business ${approved ? 'approved' : 'marked pending'} successfully.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const createOrder = async () => {
    if (!selectedBusiness) {
      return;
    }

    const selectedItems = services
      .filter((service) => (selectedQuantities[service.id] ?? 0) > 0)
      .map((service) => ({
        serviceId: service.id,
        itemName: service.name,
        category: service.category,
        quantity: selectedQuantities[service.id],
        pricePerUnit: Number(service.pricePerUnit),
      }));

    if (selectedItems.length === 0) {
      setErrorMessage('Select at least one service item before checkout.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      await createOrderRequest({
        businessId: selectedBusiness.id,
        pickupSlot: orderForm.pickupSlot,
        deliverySlot: orderForm.deliverySlot,
        pickupDate: orderForm.pickupDate,
        deliveryDate: orderForm.deliveryDate,
        couponCode: orderForm.couponCode || undefined,
        specialInstructions: orderForm.specialInstructions || undefined,
        items: selectedItems,
      });

      setSelectedQuantities({});
      setMessage('Order created successfully. Check the Orders tab for tracking.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="page-stack"><section className="mobile-section-card"><p>Loading live data...</p></section></div>;
  }

  if (user?.role === 'business') {
    return (
      <div className="page-stack">
        <section className="mobile-section-card catalog-hero-card">
          <div className="section-row">
            <div>
              <h3>Pricing Catalog</h3>
              <p>Register your store and manage live wash, dry clean, and iron services.</p>
            </div>
            <button className="icon-button" type="button" aria-label="Search services">
              <Search size={18} />
            </button>
          </div>
          {myBusiness ? (
            <div className="inline-form-card">
              <strong>{myBusiness.businessName}</strong>
              <p>
                {myBusiness.city} • {myBusiness.address}
              </p>
              <span className={myBusiness.isApproved ? 'status-pill status-approved' : 'status-pill status-requested'}>
                {myBusiness.isApproved ? 'approved' : 'pending approval'}
              </span>
            </div>
          ) : (
            <div className="form-grid compact-form-grid">
              <input
                placeholder="Business name"
                value={businessForm.businessName}
                onChange={(event) => setBusinessForm((current) => ({ ...current, businessName: event.target.value }))}
              />
              <input
                placeholder="Address"
                value={businessForm.address}
                onChange={(event) => setBusinessForm((current) => ({ ...current, address: event.target.value }))}
              />
              <input
                placeholder="City"
                value={businessForm.city}
                onChange={(event) => setBusinessForm((current) => ({ ...current, city: event.target.value }))}
              />
              <input
                placeholder="Pincode"
                value={businessForm.pincode}
                onChange={(event) => setBusinessForm((current) => ({ ...current, pincode: event.target.value }))}
              />
              <input
                placeholder="GST number (optional)"
                value={businessForm.gstNumber}
                onChange={(event) => setBusinessForm((current) => ({ ...current, gstNumber: event.target.value }))}
              />
              <button className="primary-button full-width-button" type="button" onClick={() => void submitBusiness()} disabled={busy}>
                Register business
              </button>
            </div>
          )}
          {message ? <p className="success-text">{message}</p> : null}
          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        </section>

        {myBusiness ? (
          <>
            <section className="mobile-section-card">
              <div className="section-row">
                <div>
                  <h3>Add service</h3>
                  <p>Create catalog entries customers can order.</p>
                </div>
              </div>
              <div className="form-grid compact-form-grid">
                <input
                  placeholder="Service name"
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))}
                />
                <select
                  className="form-select"
                  value={serviceForm.category}
                  onChange={(event) =>
                    setServiceForm((current) => ({ ...current, category: event.target.value as ServiceItem['category'] }))
                  }
                >
                  <option value="wash">Wash</option>
                  <option value="dry_clean">Dry Clean</option>
                  <option value="iron">Iron</option>
                  <option value="wash_iron">Wash + Iron</option>
                </select>
                <input
                  placeholder="Price"
                  type="number"
                  min="0"
                  value={serviceForm.pricePerUnit}
                  onChange={(event) => setServiceForm((current) => ({ ...current, pricePerUnit: event.target.value }))}
                />
                <input
                  placeholder="Unit"
                  value={serviceForm.unit}
                  onChange={(event) => setServiceForm((current) => ({ ...current, unit: event.target.value }))}
                />
                <input
                  placeholder="Description"
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))}
                />
                <button className="primary-button full-width-button" type="button" onClick={() => void submitService()} disabled={busy || !myBusiness.isApproved}>
                  Add service
                </button>
              </div>
              {!myBusiness.isApproved ? <p className="helper-text">Admin approval is required before your catalog goes live to customers.</p> : null}
            </section>

            <div className="catalog-list">
              {services.length === 0 ? (
                <article className="catalog-item-card empty-state-card">
                  <div>
                    <strong>No catalog items yet</strong>
                    <p>Business service entries will appear here after creation.</p>
                  </div>
                </article>
              ) : (
                services.map((service) => (
                  <article key={service.id} className="catalog-item-card">
                    <div>
                      <strong>{service.name}</strong>
                      <p>
                        {service.category} • Rs {service.pricePerUnit}/{service.unit}
                      </p>
                    </div>
                    <button className="secondary-button" type="button" onClick={() => void deleteCatalogItem(service.id)} disabled={busy}>
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="page-stack">
        <section className="mobile-section-card discover-hero-card">
          <div className="section-row">
            <div>
              <h3>Business Approvals</h3>
              <p>Approve or review partner businesses before they go live.</p>
            </div>
          </div>
          {message ? <p className="success-text">{message}</p> : null}
          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        </section>

        <div className="mobile-business-grid">
          {adminBusinesses.length === 0 ? (
            <article className="discover-card empty-state-card">
              <div>
                <strong>No business registrations yet</strong>
                <p>New partner registrations will appear here.</p>
              </div>
            </article>
          ) : (
            adminBusinesses.map((business) => (
              <article key={business.id} className="discover-card">
                <div>
                  <strong>{business.businessName}</strong>
                  <p>{business.city}</p>
                  <small>{business.address}</small>
                </div>
                <div className="stack-actions">
                  <span className={business.isApproved ? 'status-pill status-approved' : 'status-pill status-requested'}>
                    {business.isApproved ? 'approved' : 'pending'}
                  </span>
                  <button className="primary-button" type="button" onClick={() => void toggleApproval(business, !business.isApproved)} disabled={busy}>
                    {business.isApproved ? 'Mark pending' : 'Approve'}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="mobile-section-card discover-hero-card">
        <div className="section-row">
          <div>
            <h3>Select Items</h3>
            <p>Choose the best laundry partner near you</p>
          </div>
        </div>
        <input
          className="search-input"
          placeholder="Search city or service"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {message ? <p className="success-text">{message}</p> : null}
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
      </section>

      <div className="mobile-business-grid">
        {filteredBusinesses.length === 0 ? (
          <article className="discover-card empty-state-card">
            <div>
              <strong>{hasSearchQuery ? 'No matching businesses found' : 'No approved businesses yet'}</strong>
              <p>Customer app will show real businesses only after admin approval.</p>
            </div>
          </article>
        ) : (
          filteredBusinesses.map((business) => (
            <article key={business.id} className={selectedBusiness?.id === business.id ? 'discover-card discover-card-selected' : 'discover-card'}>
              <div>
                <strong>{business.businessName}</strong>
                <p>{business.city}</p>
                <small>{business.address}</small>
              </div>
              <button className="primary-button" type="button" onClick={() => setSelectedBusiness(business)}>
                {selectedBusiness?.id === business.id ? 'Selected' : 'Book now'}
              </button>
            </article>
          ))
        )}
      </div>

      {selectedBusiness ? (
        <section className="mobile-section-card">
          <div className="section-row">
            <div>
              <h3>{selectedBusiness.businessName}</h3>
              <p>Select services and create a live order.</p>
            </div>
          </div>

          <div className="catalog-list">
            {services.length === 0 ? (
              <article className="catalog-item-card empty-state-card">
                <div>
                  <strong>No services available yet</strong>
                  <p>This business has not added its live catalog.</p>
                </div>
              </article>
            ) : (
              services.map((service) => {
                const quantity = selectedQuantities[service.id] ?? 0;

                return (
                  <article key={service.id} className="catalog-item-card">
                    <div>
                      <strong>{service.name}</strong>
                      <p>
                        {service.category} • Rs {service.pricePerUnit}/{service.unit}
                      </p>
                    </div>
                    <div className="catalog-actions">
                      <button
                        className="qty-button"
                        type="button"
                        onClick={() => setSelectedQuantities((current) => ({ ...current, [service.id]: Math.max(0, quantity - 1) }))}
                      >
                        -
                      </button>
                      <strong>{quantity}</strong>
                      <button
                        className="qty-button qty-button-filled"
                        type="button"
                        onClick={() => setSelectedQuantities((current) => ({ ...current, [service.id]: quantity + 1 }))}
                      >
                        +
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="form-grid compact-form-grid order-form-grid">
            <select className="form-select" value={orderForm.pickupSlot} onChange={(event) => setOrderForm((current) => ({ ...current, pickupSlot: event.target.value }))}>
              {pickupSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
            <select className="form-select" value={orderForm.deliverySlot} onChange={(event) => setOrderForm((current) => ({ ...current, deliverySlot: event.target.value }))}>
              {pickupSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
            <input type="date" value={orderForm.pickupDate} onChange={(event) => setOrderForm((current) => ({ ...current, pickupDate: event.target.value }))} />
            <input type="date" value={orderForm.deliveryDate} onChange={(event) => setOrderForm((current) => ({ ...current, deliveryDate: event.target.value }))} />
            <input placeholder="Coupon code (optional)" value={orderForm.couponCode} onChange={(event) => setOrderForm((current) => ({ ...current, couponCode: event.target.value }))} />
            <input placeholder="Special instructions" value={orderForm.specialInstructions} onChange={(event) => setOrderForm((current) => ({ ...current, specialInstructions: event.target.value }))} />
            <button className="primary-button full-width-button" type="button" onClick={() => void createOrder()} disabled={busy}>
              Place live order
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
