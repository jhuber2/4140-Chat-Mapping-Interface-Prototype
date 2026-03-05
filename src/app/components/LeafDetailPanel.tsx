import { MessageSquare } from 'lucide-react';

interface LeafDetailPanelProps {
  title: string;
  summary: string;
  decisions: string[];
  onViewMessages: () => void;
}

export function LeafDetailPanel({
  title,
  summary,
  decisions,
  onViewMessages,
}: LeafDetailPanelProps) {
  return (
    <div
      className="absolute right-8 top-[180px]"
      style={{
        width: '520px',
        backgroundColor: '#121C2F',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0px 20px 50px rgba(0,0,0,0.45)',
      }}
    >
      {/* Title */}
      <h2
        className="mb-5"
        style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#FFFFFF',
        }}
      >
        {title}
      </h2>

      {/* Summary Section */}
      <div className="mb-5">
        <h3
          className="mb-2"
          style={{
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8FA3C7',
          }}
        >
          Summary
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#D6E0F5',
            lineHeight: '22px',
          }}
        >
          {summary}
        </p>
      </div>

      {/* Divider */}
      <div
        className="mb-5"
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      />

      {/* Decisions Section */}
      <div className="mb-6">
        <h3
          className="mb-2"
          style={{
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8FA3C7',
          }}
        >
          Decisions
        </h3>
        <ul
          className="space-y-1"
          style={{
            fontSize: '14px',
            color: '#D6E0F5',
            lineHeight: '22px',
          }}
        >
          {decisions.map((decision, index) => (
            <li key={index}>• {decision}</li>
          ))}
        </ul>
      </div>

      {/* Bottom Button */}
      <button
        onClick={onViewMessages}
        className="w-full flex items-center justify-center gap-2"
        style={{
          height: '44px',
          borderRadius: '12px',
          backgroundColor: '#2F6BFF',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#3B82F6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2F6BFF';
        }}
      >
        <MessageSquare size={18} />
        View Supporting Messages
      </button>
    </div>
  );
}
