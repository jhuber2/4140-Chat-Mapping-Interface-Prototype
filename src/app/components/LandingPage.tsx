import { Link } from 'react-router';
import { ThemeToggle } from './ThemeToggle';

export function LandingPage() {
  return (
    <div className="auth-shell landing-page">
      <ThemeToggle className="theme-toggle-floating" />
      <div className="auth-backdrop" aria-hidden />
      <svg className="landing-graph" viewBox="0 0 800 520" aria-hidden="true">
        <path d="M120 170C190 120 260 120 320 170S450 245 520 208 650 145 720 188" />
        <path d="M90 320C165 270 255 274 320 332S462 394 536 342 650 274 718 312" />
        <path d="M210 110C250 175 262 242 238 316" />
        <path d="M390 148C420 204 432 264 420 332" />
        <path d="M596 152C560 214 552 272 566 336" />
        <circle cx="120" cy="170" r="12" />
        <circle cx="220" cy="132" r="10" />
        <circle cx="320" cy="170" r="14" />
        <circle cx="438" cy="220" r="10" />
        <circle cx="520" cy="208" r="13" />
        <circle cx="640" cy="156" r="10" />
        <circle cx="720" cy="188" r="12" />
        <circle cx="90" cy="320" r="10" />
        <circle cx="210" cy="290" r="12" />
        <circle cx="320" cy="332" r="14" />
        <circle cx="432" cy="378" r="10" />
        <circle cx="536" cy="342" r="13" />
        <circle cx="640" cy="292" r="10" />
        <circle cx="718" cy="312" r="12" />
      </svg>
      <div className="landing-inner">
        <h1 className="landing-title">MapChat</h1>
        <p className="landing-lead">Explore conversations as connected topics - not just a chat log.</p>
        <div className="landing-actions">
          <Link className="btn-primary-lg" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
