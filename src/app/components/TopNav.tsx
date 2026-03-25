type TopNavProps = {
  currentView: 'chat' | 'map' | 'operator';
  onChangeView: (view: 'chat' | 'map' | 'operator') => void;
};

export function TopNav({ currentView, onChangeView }: TopNavProps) {
  return (
    <header className="top-nav">
      <h1 className="app-title">Group Project Planning</h1>
      <div className="nav-right">
        <button className={`nav-tab ${currentView === 'chat' ? 'active' : ''}`} onClick={() => onChangeView('chat')}>
          Chat View
        </button>
        <button className={`nav-tab ${currentView === 'map' ? 'active' : ''}`} onClick={() => onChangeView('map')}>
          Map View
        </button>
        <button className={`nav-tab ${currentView === 'operator' ? 'active' : ''}`} onClick={() => onChangeView('operator')}>
          Operator View
        </button>
      </div>
    </header>
  );
}
