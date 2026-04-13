import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Requested route not found.</h1>
        <Link className="primary-button" to="/">
          Return home
        </Link>
      </div>
    </div>
  );
}
