import { Link } from 'react-router';

export function LandingPage() {
  return (
    <div className="auth-shell landing-page">
      <div className="auth-backdrop" aria-hidden />
      <div className="landing-inner">
        <p className="landing-eyebrow">Team workspace</p>
        <h1 className="landing-title">Group Project Planning</h1>
        <p className="landing-lead">
          One conversation, two views: follow the thread in chat and explore the same discussion as a live topic map—organized, linked, and easy to navigate.
        </p>
        <div className="landing-actions">
          <Link className="btn-primary-lg" to="/login">
            Sign in
          </Link>
        </div>
        <p className="landing-footnote">Your session is kept on this browser until you sign out.</p>
      </div>
    </div>
  );
}
