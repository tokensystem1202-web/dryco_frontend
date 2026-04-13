import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, MapPin, Package, Sparkles } from 'lucide-react';
import { getProfileRequest, updateProfileRequest, UserProfile } from '../services/api';
import { useAuth } from '../features/auth/auth-store';

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

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
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
        const response = await getProfileRequest();
        setProfile(response);
        setName(response.name || '');
        setPhone(response.phone || '');
        setAddress(response.address || '');
        setCity(response.city || '');
        setPincode(response.pincode || '');
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void load();
  }, [user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setMessage('');

    try {
      const response = await updateProfileRequest({
        name,
        phone,
        address,
        city,
        pincode,
      });
      setProfile(response);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const addAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !newAddress.trim()) {
      return;
    }

    const nextAddresses = Array.from(new Set([newAddress.trim(), ...savedAddresses]));
    setSavedAddresses(nextAddresses);
    setNewAddress('');
    window.localStorage.setItem(getAddressKey(user.userId), JSON.stringify(nextAddresses));
  };

  return (
    <div className="page-stack">
      <section className="page-hero compact-hero customer-portal-hero">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Keep your details ready for faster bookings.</h2>
          <p className="hero-copy">Update contact and address info.</p>
        </div>
        <div className="profile-badge-card">
          <span className="role-pill role-pill-admin">{profile?.role ?? 'customer'}</span>
          <strong>{profile?.email ?? user?.email}</strong>
          <small>{savedAddresses.length} saved quick addresses</small>
        </div>
      </section>

      {message ? <p className="success-text">{message}</p> : null}
      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

      <section className="booking-layout">
        <form className="mobile-section-card booking-panel" onSubmit={(event) => void saveProfile(event)}>
          <div className="section-row">
            <div>
              <h3>Personal Details</h3>
              <p>Used for pickup and delivery.</p>
            </div>
          </div>

          <div className="form-grid compact-form-grid">
            <label>
              <span>Full name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              <span>Phone</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label>
              <span>City</span>
              <input value={city} onChange={(event) => setCity(event.target.value)} />
            </label>
            <label>
              <span>Pincode</span>
              <input value={pincode} onChange={(event) => setPincode(event.target.value)} />
            </label>
          </div>

          <label>
            <span>Primary address</span>
            <input value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>

          <button className="primary-button full-width-button" type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <article className="mobile-section-card booking-panel">
          <div className="section-row">
            <div>
              <h3>Saved Addresses</h3>
              <p>Pick faster next time.</p>
            </div>
            <MapPin size={18} />
          </div>

          <form className="inline-form-row" onSubmit={addAddress}>
            <input className="search-input" value={newAddress} onChange={(event) => setNewAddress(event.target.value)} placeholder="Add address shortcut" />
            <button className="secondary-button" type="submit">Add</button>
          </form>

          <div className="address-list-grid">
            {savedAddresses.length === 0 ? (
              <article className="mobile-order-card empty-state-card">
                <div>
                  <strong>No saved addresses yet</strong>
                  <p>Add your first address.</p>
                </div>
              </article>
            ) : (
              savedAddresses.map((item) => (
                <article key={item} className="address-card static-address-card">
                  <strong>{item}</strong>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="mobile-section-card booking-summary-panel">
          <div className="section-row">
            <div>
              <h3>Quick Access</h3>
              <p>Your common actions.</p>
            </div>
          </div>

          <Link className="portal-link-card" to="/book">
            <Sparkles size={18} />
            <span>Book a new pickup</span>
          </Link>
          <Link className="portal-link-card" to="/orders">
            <Package size={18} />
            <span>See order history</span>
          </Link>
          <Link className="portal-link-card" to="/rewards">
            <Gift size={18} />
            <span>Check loyalty rewards</span>
          </Link>
        </article>
      </section>
    </div>
  );
}