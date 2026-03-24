type TopNavProps = {
  currentView: 'chat' | 'map' | 'search' | 'alerts' | 'filter';
  onChangeView: (view: 'chat' | 'map' | 'search' | 'alerts' | 'filter') => void;
};

export function TopNav({ currentView, onChangeView }: TopNavProps) {
  return (
    <header className="top-nav">
      <h1 className="app-title">Dev Team Group Chat</h1>
      <div className="nav-right">
        <button className={`nav-tab ${currentView === 'chat' ? 'active' : ''}`} onClick={() => onChangeView('chat')}>
          Chat View
        </button>
        <button className={`nav-tab ${currentView === 'map' ? 'active' : ''}`} onClick={() => onChangeView('map')}>
          Map View
        </button>
        <button className={`icon-button ${currentView === 'search' ? 'active' : ''}`} aria-label="Search" onClick={() => onChangeView('search')}>
          Search
        </button>
        <button className={`icon-button ${currentView === 'alerts' ? 'active' : ''}`} aria-label="Notifications" onClick={() => onChangeView('alerts')}>
          Alerts
        </button>
        <button className={`icon-button ${currentView === 'filter' ? 'active' : ''}`} aria-label="Filter" onClick={() => onChangeView('filter')}>
          Filter
        </button>
      </div>
    </header>
  );
}
