type TopNavProps = {
  currentView: 'chat' | 'map' | 'operator';
  onChangeView: (view: 'chat' | 'map' | 'operator') => void;
  sessionLabel: string;
  realtimeStatus: 'connecting' | 'connected' | 'disconnected';
  onLogout: () => void;
};

export function TopNav({ currentView, onChangeView, sessionLabel, realtimeStatus, onLogout }: TopNavProps) {
  const connectionLabel = realtimeStatus === 'connected' ? 'Connected' : realtimeStatus === 'connecting' ? 'Connecting' : 'Disconnected';

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
        <span className={`nav-connection-status ${realtimeStatus}`} title={`Realtime: ${connectionLabel}`}>
          {connectionLabel}
        </span>
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
