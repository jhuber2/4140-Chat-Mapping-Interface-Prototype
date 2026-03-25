type TopNavProps = {
  currentView: 'chat' | 'map' | 'operator';
  onChangeView: (view: 'chat' | 'map' | 'operator') => void;
  sessionLabel: string;
  onLogout: () => void;
};

export function TopNav({ currentView, onChangeView, sessionLabel, onLogout }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="nav-left-cluster">
        <h1 className="app-title">Group Project Planning</h1>
        {sessionLabel ? (
          <>
            <span className="nav-session-divider" aria-hidden="true" />
            <span className="nav-session-name" title={sessionLabel}>
              {sessionLabel}
            </span>
          </>
        ) : null}
      </div>
      <div className="nav-right">
        <button className={`nav-tab ${currentView === 'chat' ? 'active' : ''}`} onClick={() => onChangeView('chat')}>
          Chat View
        </button>
        <button className={`nav-tab ${currentView === 'map' ? 'active' : ''}`} onClick={() => onChangeView('map')}>
          Map View
        </button>
        <button className={`nav-tab ${currentView === 'operator' ? 'active' : ''}`} onClick={() => onChangeView('operator')}>
          Facilitator
        </button>
        <button type="button" className="nav-logout" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
