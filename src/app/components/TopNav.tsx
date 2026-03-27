import { useEffect, useRef, useState } from 'react';

type TopNavProps = {
  currentView: 'chat' | 'map' | 'operator';
  onChangeView: (view: 'chat' | 'map' | 'operator') => void;
  sessionLabel: string;
  realtimeStatus: 'connecting' | 'connected' | 'disconnected';
  onLogout: () => void;
};

export function TopNav({ currentView, onChangeView, sessionLabel, realtimeStatus, onLogout }: TopNavProps) {
  const sessionInitial = sessionLabel.trim().charAt(0).toUpperCase() || 'U';
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <header className="top-nav">
      <div className="nav-left-cluster">
        <button className={`nav-tab ${currentView === 'chat' ? 'active' : ''}`} onClick={() => onChangeView('chat')}>
          Chat View
        </button>
        <button className={`nav-tab ${currentView === 'map' ? 'active' : ''}`} onClick={() => onChangeView('map')}>
          Map View
        </button>
        <button className={`nav-tab ${currentView === 'operator' ? 'active' : ''}`} onClick={() => onChangeView('operator')}>
          Facilitator
        </button>
      </div>
      <div className="nav-right">
        <div className="nav-account-wrap" ref={accountRef}>
          <button
            type="button"
            className="nav-account-cluster"
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="nav-account-avatar" aria-hidden="true">
              {sessionInitial}
            </span>
            <span className="nav-account-meta">
              <span className="nav-session-name" title={sessionLabel}>
                {sessionLabel}
              </span>
            </span>
          </button>
          {menuOpen ? (
            <div className="nav-account-menu" role="menu">
              <button
                type="button"
                className="nav-account-menu-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
