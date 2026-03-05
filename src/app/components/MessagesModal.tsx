import { X } from 'lucide-react';

interface Message {
  author: string;
  initials: string;
  avatarColor: string;
  timestamp: string;
  content: string;
}

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

export function MessagesModal({ isOpen, onClose, messages }: MessagesModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          maxHeight: '700px',
          backgroundColor: '#121C2F',
          borderRadius: '16px',
          boxShadow: '0px 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#FFFFFF',
            }}
          >
            Supporting Messages
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} style={{ color: '#A7B3C9' }} />
          </button>
        </div>

        {/* Messages - Scrollable */}
        <div
          className="overflow-y-auto px-7 py-6"
          style={{
            maxHeight: '600px',
          }}
        >
          <div className="space-y-5">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: message.avatarColor,
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                >
                  {message.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#E6EDF7' }}>
                      {message.author}
                    </span>
                    <span style={{ fontSize: '13px', color: '#8FA3C7' }}>
                      {message.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#C7D2E6', lineHeight: '21px' }}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
