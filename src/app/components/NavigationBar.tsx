import { Search, Bell, ChevronDown } from 'lucide-react';

export function NavigationBar() {
  return (
    <div 
      className="h-[72px] flex items-center justify-between px-8"
      style={{ 
        backgroundColor: '#1A2335',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Left Section */}
      <div 
        className="font-semibold"
        style={{ 
          fontSize: '18px',
          color: '#E6EDF7'
        }}
      >
        Dev Team Group Chat
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* View Toggle */}
        <div className="flex items-center gap-6">
          <button 
            className="font-medium relative"
            style={{ 
              fontSize: '14px',
              color: '#A7B3C9'
            }}
          >
            Chat View
          </button>
          <button 
            className="font-medium relative"
            style={{ 
              fontSize: '14px',
              color: '#FFFFFF'
            }}
          >
            Map View
            <div 
              className="absolute bottom-[-8px] left-0 right-0 h-[2px]"
              style={{ backgroundColor: '#3B82F6' }}
            />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* Icons */}
        <div className="flex items-center gap-5">
          <button>
            <Search size={18} style={{ color: '#A7B3C9' }} />
          </button>
          <button>
            <Bell size={18} style={{ color: '#A7B3C9' }} />
          </button>
          <button className="flex items-center gap-1">
            <span style={{ fontSize: '14px', color: '#A7B3C9' }}>Filter</span>
            <ChevronDown size={14} style={{ color: '#A7B3C9' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
