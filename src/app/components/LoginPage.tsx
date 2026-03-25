import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';

export function LoginPage() {
  const { user, loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = loginWithCredentials(username, password);
    if (!ok) {
      setError('Invalid username or password.');
      return;
    }
    navigate('/app', { replace: true });
  };

  return (
    <div className="auth-shell login-page">
      <div className="auth-backdrop" aria-hidden />
      <div className="login-page-inner">
        <div className="login-title-row">
          <div className="login-title-row-lead">
            <Link className="auth-back-link" to="/">
              <svg
                className="auth-back-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"
                />
              </svg>
              <span>Back</span>
            </Link>
          </div>
          <h1 className="login-heading">Sign in</h1>
          <div className="login-title-row-trail" aria-hidden />
        </div>
        <p className="login-sub">Use your workspace username and password.</p>

        <div className="login-panel">
          <form className="login-form" onSubmit={onSubmit}>
            <label className="auth-label">
              Username
              <input
                className="auth-input"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </label>
            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            <button type="submit" className="btn-primary-block">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
