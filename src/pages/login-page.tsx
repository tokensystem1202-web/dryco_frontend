import axios from 'axios';
import { FormEvent, useState } from 'react';
import { KeyRound, Shield, Store, User } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-store';
import { AppRole, sendOtpRequest } from '../services/api';

const roles: AppRole[] = ['customer', 'business', 'admin'];
const roleIcons = {
  customer: User,
  business: Store,
  admin: Shield,
};

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithOtp, register, registerWithOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<AppRole>('customer');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminLogin = mode === 'login' && role === 'admin';
  const loginTitle =
    role === 'admin'
      ? 'Login to the admin workspace.'
      : role === 'business'
        ? 'Login to your business account.'
        : 'Login to your real WashFlow account.';

  const recipient = mode === 'login' ? email : email || phone;

  useEffect(() => {
    const portal = searchParams.get('portal');
    if (portal === 'admin') {
      setMode('login');
      setRole('admin');
      setAuthMethod('password');
    }
  }, [searchParams]);

  const sendOtp = async () => {
    if (!recipient.trim()) {
      setErrorMessage('Enter your email before requesting OTP.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setOtpMessage('');

    try {
      await sendOtpRequest({
        recipient,
        channel: recipient.includes('@') ? 'email' : 'phone',
      });
      setOtpMessage('OTP sent. Use the code delivered by the backend for verification.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Unable to send OTP');
      } else {
        setErrorMessage('Unable to send OTP');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setOtpMessage('');
    setIsSubmitting(true);

    try {
      const user =
        authMethod === 'password'
          ? mode === 'login'
            ? await login(email, password)
            : await register({
                name,
                email,
                phone,
                password,
                role,
                city: city || undefined,
              })
          : mode === 'login'
            ? await loginWithOtp(email, otp)
            : await registerWithOtp({
                name,
                email,
                phone,
                password,
                role,
                city: city || undefined,
                recipient: email,
                otp,
              });

      navigate(`/${user.role}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Authentication failed');
      } else {
        setErrorMessage('Authentication failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">WashFlow</p>
        <h1>{mode === 'login' ? loginTitle : 'Create a real WashFlow account.'}</h1>

        <div className="role-switcher role-card-switcher two-column-switcher">
          <button
            className={authMethod === 'password' ? 'role-option role-option-active role-option-compact' : 'role-option role-option-compact'}
            type="button"
            onClick={() => setAuthMethod('password')}
          >
            <KeyRound size={18} />
            <span>Password</span>
          </button>
          <button
            className={authMethod === 'otp' ? 'role-option role-option-active role-option-compact' : 'role-option role-option-compact'}
            type="button"
            onClick={() => {
              if (!isAdminLogin) {
                setAuthMethod('otp');
              }
            }}
            disabled={isAdminLogin}
          >
            <User size={18} />
            <span>OTP</span>
          </button>
        </div>

        <div className="role-switcher role-card-switcher">
          <button
            className={mode === 'login' ? 'role-option role-option-active' : 'role-option'}
            type="button"
            onClick={() => {
              setMode('login');
              if (role === 'admin') {
                setAuthMethod('password');
              }
            }}
          >
            <span>Login</span>
          </button>
          <button
            className={mode === 'register' ? 'role-option role-option-active' : 'role-option'}
            type="button"
            onClick={() => setMode('register')}
          >
            <span>Register</span>
          </button>
        </div>

        <label>
          <span>{mode === 'login' ? 'Login portal' : 'Role'}</span>
          <div className="role-switcher role-card-switcher">
            {roles.map((item) => (
              (() => {
                const Icon = roleIcons[item];
                return (
                  <button
                    key={item}
                    className={role === item ? 'role-option role-option-active' : 'role-option'}
                    type="button"
                    onClick={() => {
                      setRole(item);
                      if (mode === 'login' && item === 'admin') {
                        setAuthMethod('password');
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span>{item}</span>
                  </button>
                );
              })()
            ))}
          </div>
        </label>

        {isAdminLogin ? <p className="helper-text">Admin access uses password login.</p> : null}

        {mode === 'register' ? (
          <label>
            <span>Full name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        ) : null}

        <label>
          <span>{authMethod === 'otp' && mode === 'login' ? 'Email or phone' : 'Email'}</span>
          <input
            type={authMethod === 'otp' && mode === 'login' ? 'text' : 'email'}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {mode === 'register' ? (
          <label>
            <span>Phone</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </label>
        ) : null}

        {mode === 'register' ? (
          <label>
            <span>City</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
        ) : null}

        {mode === 'register' || authMethod === 'password' ? (
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required={authMethod === 'password' || mode === 'register'}
            />
          </label>
        ) : null}

        {authMethod === 'otp' ? (
          <div className="otp-card">
            <div className="otp-row">
              <label>
                <span>OTP code</span>
                <input value={otp} onChange={(event) => setOtp(event.target.value)} required />
              </label>
              <button className="secondary-button" type="button" onClick={() => void sendOtp()} disabled={isSubmitting}>
                Send OTP
              </button>
            </div>
            {otpMessage ? <p className="helper-text">{otpMessage}</p> : null}
          </div>
        ) : null}

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <button className="primary-button" type="submit">
          {isSubmitting
            ? 'Please wait...'
            : mode === 'login'
              ? authMethod === 'otp'
                ? `${role[0].toUpperCase()}${role.slice(1)} Login with OTP`
                : `${role[0].toUpperCase()}${role.slice(1)} Login`
              : authMethod === 'otp'
                ? 'Create account with OTP'
                : 'Create account'}
        </button>
      </form>
    </div>
  );
}
