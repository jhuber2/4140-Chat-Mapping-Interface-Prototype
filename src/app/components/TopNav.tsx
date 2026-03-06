type TopNavProps = {
  currentView: 'chat' | 'map';
  onChangeView: (view: 'chat' | 'map') => void;
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
        <button className="icon-button" aria-label="Search">Search</button>
        <button className="icon-button" aria-label="Notifications">Alerts</button>
        <button className="icon-button" aria-label="Filter">Filter</button>
      </div>
    </header>
  );
}
