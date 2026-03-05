interface BranchDetailPanelProps {
  title: string;
  summary: string;
  firstDiscussed: string;
  lastActive: string;
  totalMessages: number;
}

export function BranchDetailPanel({
  title,
  summary,
  firstDiscussed,
  lastActive,
  totalMessages,
}: BranchDetailPanelProps) {
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

      {/* Metadata */}
      <div className="space-y-1">
        <div style={{ fontSize: '13px', color: '#9FB0CC' }}>
          First Discussed: {firstDiscussed}
        </div>
        <div style={{ fontSize: '13px', color: '#9FB0CC' }}>
          Last Active: {lastActive}
        </div>
        <div style={{ fontSize: '13px', color: '#9FB0CC' }}>
          Total Messages: {totalMessages}
        </div>
      </div>
    </div>
  );
}
