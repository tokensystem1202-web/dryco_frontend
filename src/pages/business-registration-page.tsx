import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileBadge,
  MapPinned,
  Store,
} from 'lucide-react';
import { submitBusinessRegistrationRequest } from '../services/api';

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

  return 'Registration failed';
}

export function BusinessRegistrationPage() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [businessType, setBusinessType] = useState<'laundry' | 'dry_clean'>('laundry');
  const [idProof, setIdProof] = useState<File | null>(null);
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!idProof || !shopImage) {
      setErrorMessage('Upload both ID proof and shop image before submitting.');
      return;
    }

    setBusy(true);
    setErrorMessage('');

    try {
      const response = await submitBusinessRegistrationRequest({
        businessName,
        ownerName,
        phone,
        address,
        serviceArea,
        businessType,
        idProof,
        shopImage,
      });

      setSubmittedName(response.name);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (submittedName) {
    return (
      <div className="auth-page business-register-page">
        <section className="auth-card business-register-card business-confirmation-card">
          <span className="confirmation-mark">
            <CheckCircle2 size={28} />
          </span>
          <p className="eyebrow">Business Onboarding</p>
          <h1>Your request has been sent for admin verification</h1>
          <p className="hero-copy">
            {submittedName} has been added with pending status. The DryCo admin team can now review your request and approve it for the partner dashboard flow.
          </p>
          <div className="marketing-hero-actions">
            <Link className="primary-button" to="/">
              Back to Home
            </Link>
            <Link className="secondary-link" to="/login">
              Existing partner login
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-page business-register-page">
      <form className="auth-card business-register-card" onSubmit={handleSubmit}>
        <div className="business-register-hero">
          <div>
            <p className="eyebrow">Partner With DryCo</p>
            <h1>Join as a Business</h1>
            <p className="hero-copy">
              Send your laundry or dry-clean business details for admin verification. Once approved, you can move into the existing business dashboard and catalog flow.
            </p>
          </div>
          <div className="business-register-badges">
            <span><Building2 size={16} /> Pending review</span>
            <span><MapPinned size={16} /> Service area captured</span>
            <span><Store size={16} /> Clean onboarding</span>
          </div>
        </div>

        <div className="form-grid compact-form-grid">
          <label>
            <span>Business name</span>
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
          </label>
          <label>
            <span>Owner name</span>
            <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required />
          </label>
          <label>
            <span>Phone</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </label>
          <label>
            <span>Service area</span>
            <input value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} placeholder="Indiranagar, Koramangala, HSR" required />
          </label>
        </div>

        <label>
          <span>Address</span>
          <input value={address} onChange={(event) => setAddress(event.target.value)} required />
        </label>

        <label>
          <span>Business type</span>
          <div className="role-switcher two-column-switcher">
            <button
              className={businessType === 'laundry' ? 'role-option role-option-active role-option-compact' : 'role-option role-option-compact'}
              type="button"
              onClick={() => setBusinessType('laundry')}
            >
              <Store size={18} />
              <span>Laundry</span>
            </button>
            <button
              className={businessType === 'dry_clean' ? 'role-option role-option-active role-option-compact' : 'role-option role-option-compact'}
              type="button"
              onClick={() => setBusinessType('dry_clean')}
            >
              <FileBadge size={18} />
              <span>Dry Clean</span>
            </button>
          </div>
        </label>

        <div className="form-grid compact-form-grid">
          <label className="upload-field-card">
            <span>ID proof</span>
            <input type="file" accept="image/*,.pdf" onChange={(event) => setIdProof(event.target.files?.[0] ?? null)} required />
            <small>{idProof?.name ?? 'Upload government ID or business proof'}</small>
          </label>
          <label className="upload-field-card">
            <span>Shop image</span>
            <input type="file" accept="image/*" onChange={(event) => setShopImage(event.target.files?.[0] ?? null)} required />
            <small>{shopImage?.name ?? 'Upload storefront or work area image'}</small>
          </label>
        </div>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <div className="marketing-hero-actions">
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Submitting...' : 'Submit for Verification'}
            <ArrowRight size={16} />
          </button>
          <Link className="secondary-link" to="/">
            Back to Landing Page
          </Link>
        </div>
      </form>
    </div>
  );
}