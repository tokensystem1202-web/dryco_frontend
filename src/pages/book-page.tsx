import axios from 'axios';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, MessageCircle, Phone, TicketPercent } from 'lucide-react';
import { useAuth } from '../features/auth/auth-store';
import {
  Business,
  createOrderRequest,
  getApprovedBusinesses,
  getBusinessServices,
  getProfileRequest,
  ServiceItem,
  UserProfile,
} from '../services/api';

const pickupSlots = ['Morning (8AM-11AM)', 'Afternoon (12PM-3PM)', 'Evening (4PM-7PM)'];

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

function getAddressKey(userId?: string) {
  return `washflow-addresses-${userId ?? 'guest'}`;
}

export function BookPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<'partner' | 'services' | 'address' | 'schedule' | 'summary'>('partner');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState(pickupSlots[0]);
  const [deliverySlot, setDeliverySlot] = useState(pickupSlots[1]);
  const [pickupAddress, setPickupAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const storedAddresses = window.localStorage.getItem(getAddressKey(user.userId));
    if (storedAddresses) {
      setSavedAddresses(JSON.parse(storedAddresses) as string[]);
    }

    const load = async () => {
      try {
        const [businessItems, profileResponse] = await Promise.all([
          getApprovedBusinesses(),
          getProfileRequest(),
        ]);

        setBusinesses(businessItems);
        setProfile(profileResponse);
        setContactPhone(profileResponse.phone || '');

        if (profileResponse.address) {
          setPickupAddress(profileResponse.address);
        }

        if (businessItems[0]) {
          setSelectedBusinessId(businessItems[0].id);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void load();
  }, [user]);

  useEffect(() => {
    if (!selectedBusinessId) {
      return;
    }

    const loadServices = async () => {
      try {
        setServices(await getBusinessServices(selectedBusinessId));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void loadServices();
  }, [selectedBusinessId]);

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;

  const selectedItems = useMemo(
    () =>
      services
        .filter((service) => (quantities[service.id] ?? 0) > 0)
        .map((service) => ({
          serviceId: service.id,
          itemName: service.name,
          category: service.category,
          quantity: quantities[service.id],
          pricePerUnit: Number(service.pricePerUnit),
          totalPrice: Number(service.pricePerUnit) * quantities[service.id],
        })),
    [quantities, services],
  );

  const pricing = useMemo(() => {
    const subtotal = selectedItems.reduce((total, item) => total + item.totalPrice, 0);
    const discountAmount = couponCode.trim().toUpperCase() === 'WELCOME10' ? Number((subtotal * 0.1).toFixed(2)) : 0;
    const deliveryCharge = 0;
    const taxAmount = Number(((subtotal - discountAmount + deliveryCharge) * 0.05).toFixed(2));
    const totalAmount = Number((subtotal - discountAmount + deliveryCharge + taxAmount).toFixed(2));

    return {
      subtotal,
      discountAmount,
      deliveryCharge,
      taxAmount,
      totalAmount,
    };
  }, [couponCode, selectedItems]);

  const updateQuantity = (serviceId: string, nextQuantity: number) => {
    setQuantities((current) => ({
      ...current,
      [serviceId]: Math.max(0, nextQuantity),
    }));
  };

  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAddress = newAddress.trim();
    if (!trimmedAddress || !user) {
      return;
    }

    const nextAddresses = Array.from(new Set([trimmedAddress, ...savedAddresses]));
    setSavedAddresses(nextAddresses);
    setPickupAddress(trimmedAddress);
    setNewAddress('');
    window.localStorage.setItem(getAddressKey(user.userId), JSON.stringify(nextAddresses));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupAddress(`Current location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
      },
      () => setErrorMessage('Unable to fetch current location.'),
    );
  };

  const placeOrder = async () => {
    if (!selectedBusiness) {
      setErrorMessage('Select a business before placing the order.');
      return;
    }

    if (!pickupAddress.trim()) {
      setErrorMessage('Select or enter a pickup address.');
      return;
    }

    if (!pickupDate || !deliveryDate || selectedItems.length === 0) {
      setErrorMessage('Choose dates and add at least one service item.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      const order = await createOrderRequest({
        businessId: selectedBusiness.id,
        pickupSlot,
        deliverySlot,
        pickupDate,
        deliveryDate,
        pickupAddress,
        contactPhone: contactPhone.trim() || profile?.phone || undefined,
        couponCode: couponCode.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        items: selectedItems.map(({ serviceId, itemName, category, quantity, pricePerUnit }) => ({
          serviceId,
          itemName,
          category,
          quantity,
          pricePerUnit,
        })),
      });

      setMessage('Order placed successfully. Opening live tracking.');
      navigate(`/orders/${order.id}`);
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
          <p className="eyebrow">Book Pickup</p>
          <h2>Book in five quick steps.</h2>
          <p className="hero-copy">Partner, items, address, schedule, summary.</p>
        </div>
        <div className="portal-hero-actions">
          <a className="secondary-button" href="tel:+919999999999">
            <Phone size={16} />
            Call Support
          </a>
          <a className="primary-button" href="https://wa.me/919999999999" target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="booking-step-list">
        <article className={activeStep === 'partner' ? 'booking-step booking-step-active' : 'booking-step'}>
          <button className="booking-step-head" type="button" onClick={() => setActiveStep('partner')}>
            <div>
              <span className="booking-step-kicker">Step 1</span>
              <h3>Select Partner</h3>
            </div>
            <ChevronDown size={18} className={activeStep === 'partner' ? 'step-chevron step-chevron-open' : 'step-chevron'} />
          </button>

          {activeStep === 'partner' ? <div className="booking-step-body"> 

          <div className="business-choice-grid">
            {businesses.length === 0 ? (
              <article className="mobile-order-card empty-state-card">
                <div>
                  <strong>No approved businesses yet</strong>
                  <p>Try again later.</p>
                </div>
              </article>
            ) : (
              businesses.map((business) => (
                <button
                  key={business.id}
                  className={selectedBusinessId === business.id ? 'address-card address-card-active' : 'address-card'}
                  type="button"
                  onClick={() => {
                    setSelectedBusinessId(business.id);
                    setActiveStep('services');
                  }}
                >
                  <strong>{business.businessName}</strong>
                  <span>{business.city}</span>
                  <small>{business.address}</small>
                </button>
              ))
            )}
          </div>
          </div> : null}
        </article>

        <article className={activeStep === 'services' ? 'booking-step booking-step-active' : 'booking-step'}>
          <button className="booking-step-head" type="button" onClick={() => setActiveStep('services')}>
            <div>
              <span className="booking-step-kicker">Step 2</span>
              <h3>Select Services</h3>
            </div>
            <ChevronDown size={18} className={activeStep === 'services' ? 'step-chevron step-chevron-open' : 'step-chevron'} />
          </button>

          {activeStep === 'services' ? <div className="booking-step-body">

          <div className="service-selector-grid">
            {services.length === 0 ? (
              <article className="mobile-order-card empty-state-card">
                <div>
                  <strong>No live services in this catalog</strong>
                  <p>No items available.</p>
                </div>
              </article>
            ) : (
              services.map((service) => (
                <article key={service.id} className="service-selector-card">
                  <div>
                    <strong>{service.name}</strong>
                    <p>{service.category.replace(/_/g, ' ')} • {service.unit}</p>
                  </div>
                  <div className="service-selector-footer">
                    <span>Rs {service.pricePerUnit}</span>
                    <div className="quantity-stepper">
                      <button className="qty-button" type="button" onClick={() => updateQuantity(service.id, (quantities[service.id] ?? 0) - 1)}>
                        -
                      </button>
                      <strong>{quantities[service.id] ?? 0}</strong>
                      <button className="qty-button" type="button" onClick={() => updateQuantity(service.id, (quantities[service.id] ?? 0) + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          </div> : null}
        </article>

        <article className={activeStep === 'address' ? 'booking-step booking-step-active' : 'booking-step'}>
          <button className="booking-step-head" type="button" onClick={() => setActiveStep('address')}>
            <div>
              <span className="booking-step-kicker">Step 3</span>
              <h3>Address</h3>
            </div>
            <ChevronDown size={18} className={activeStep === 'address' ? 'step-chevron step-chevron-open' : 'step-chevron'} />
          </button>

          {activeStep === 'address' ? <div className="booking-step-body">

          <div className="section-headline section-headline-inline">
            <h4>Pickup address</h4>
            <button className="text-link-button" type="button" onClick={useCurrentLocation}>
              <MapPin size={14} />
              Current
            </button>
          </div>

          <div className="address-list-grid">
            {profile?.address ? (
              <button className={pickupAddress === profile.address ? 'address-card address-card-active' : 'address-card'} type="button" onClick={() => setPickupAddress(profile.address ?? '')}>
                <strong>Profile address</strong>
                <span>{profile.address}</span>
                <small>{[profile.city, profile.pincode].filter(Boolean).join(' • ')}</small>
              </button>
            ) : null}

            {savedAddresses.map((address) => (
              <button key={address} className={pickupAddress === address ? 'address-card address-card-active' : 'address-card'} type="button" onClick={() => setPickupAddress(address)}>
                <strong>Saved address</strong>
                <span>{address}</span>
              </button>
            ))}
          </div>

          <form className="inline-form-row" onSubmit={saveAddress}>
            <input className="search-input" value={newAddress} onChange={(event) => setNewAddress(event.target.value)} placeholder="Add another pickup address" />
            <button className="secondary-button" type="submit">Save</button>
          </form>
          </div> : null}
        </article>

        <article className={activeStep === 'schedule' ? 'booking-step booking-step-active' : 'booking-step'}>
          <button className="booking-step-head" type="button" onClick={() => setActiveStep('schedule')}>
            <div>
              <span className="booking-step-kicker">Step 4</span>
              <h3>Schedule</h3>
            </div>
            <ChevronDown size={18} className={activeStep === 'schedule' ? 'step-chevron step-chevron-open' : 'step-chevron'} />
          </button>

          {activeStep === 'schedule' ? <div className="booking-step-body">

          <div className="form-grid compact-form-grid">
            <label>
              <span>Pickup date</span>
              <input type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
            </label>
            <label>
              <span>Delivery date</span>
              <input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
            </label>
            <label>
              <span>Pickup slot</span>
              <select className="form-select" value={pickupSlot} onChange={(event) => setPickupSlot(event.target.value)}>
                {pickupSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Delivery slot</span>
              <select className="form-select" value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)}>
                {pickupSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid compact-form-grid">
            <label>
              <span>Contact phone</span>
              <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="Enter pickup contact number" />
            </label>
            <label>
              <span>Coupon code</span>
              <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="WELCOME10" />
            </label>
          </div>

          <label>
            <span>Special instructions</span>
            <input value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} placeholder="Gate code, fabric notes, stain details" />
          </label>
          </div> : null}
        </article>

        <article className={activeStep === 'summary' ? 'booking-step booking-step-active booking-step-summary' : 'booking-step booking-step-summary'}>
          <button className="booking-step-head" type="button" onClick={() => setActiveStep('summary')}>
            <div>
              <span className="booking-step-kicker">Step 5</span>
              <h3>Summary</h3>
            </div>
            <ChevronDown size={18} className={activeStep === 'summary' ? 'step-chevron step-chevron-open' : 'step-chevron'} />
          </button>

          {activeStep === 'summary' ? <div className="booking-step-body booking-summary-sheet booking-summary-panel booking-summary-panel-sticky">
          <div className="section-row section-row-tight">
            <div>
              <h3>Total</h3>
              <p>{selectedItems.length} items</p>
            </div>
            <span className="booking-total-amount">Rs {pricing.totalAmount.toFixed(2)}</span>
          </div>

          <div className="price-line"><span>Subtotal</span><strong>Rs {pricing.subtotal.toFixed(2)}</strong></div>
          <div className="price-line"><span>Delivery charge</span><strong>{pricing.deliveryCharge === 0 ? 'Free' : `Rs ${pricing.deliveryCharge.toFixed(2)}`}</strong></div>
          <div className="price-line"><span>Discount</span><strong>{pricing.discountAmount ? `- Rs ${pricing.discountAmount.toFixed(2)}` : 'Rs 0.00'}</strong></div>
          <div className="price-line"><span>Tax</span><strong>Rs {pricing.taxAmount.toFixed(2)}</strong></div>
          <div className="price-line price-line-total"><span>Final total</span><strong>Rs {pricing.totalAmount.toFixed(2)}</strong></div>

          <div className="booking-summary-note">
            <TicketPercent size={16} />
            <span>Use WELCOME10.</span>
          </div>

          <div className="booking-action-stack">
            <button className="primary-button full-width-button" type="button" onClick={() => void placeOrder()} disabled={busy || businesses.length === 0}>
              {busy ? 'Placing...' : 'Confirm Order'}
            </button>

            <Link className="secondary-button full-width-button" to="/orders">
              View Orders
            </Link>
          </div>
          </div> : null}
        </article>
      </section>
    </div>
  );
}