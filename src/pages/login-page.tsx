import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Shield, Store, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/auth-store';
import { AppRole } from '../services/api';

const roles: AppRole[] = ['customer', 'business', 'admin'];
const roleIcons = {
  customer: User,
  business: Store,
  admin: Shield,
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppRole>('customer');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register({
              name,
              email,
              phone,
              password,
              role,
              city: city || undefined,
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
        <h1>{mode === 'login' ? 'Login to your real WashFlow account.' : 'Create a real WashFlow account.'}</h1>

        <div className="role-switcher role-card-switcher">
          <button
            className={mode === 'login' ? 'role-option role-option-active' : 'role-option'}
            type="button"
            onClick={() => setMode('login')}
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

        {mode === 'register' ? (
          <label>
            <span>Full name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        ) : null}

        <label>
          <span>Email</span>
          <input
            type="email"
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

        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <label>
          <span>Role</span>
          <div className="role-switcher role-card-switcher">
            {roles.map((item) => (
              (() => {
                const Icon = roleIcons[item];
                return (
                  <button
                    key={item}
                    className={role === item ? 'role-option role-option-active' : 'role-option'}
                    type="button"
                    onClick={() => setRole(item)}
                  >
                    <Icon size={18} />
                    <span>{item}</span>
                  </button>
                );
              })()
            ))}
          </div>
        </label>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <button className="primary-button" type="submit">
          {isSubmitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Login'
              : 'Create account'}
        </button>
      </form>
    </div>
  );
}
