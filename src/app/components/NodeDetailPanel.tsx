import { MapNodeData } from '../types';

type NodeDetailPanelProps = {
  node: MapNodeData | undefined;
  onViewMessages: () => void;
};

export function NodeDetailPanel({ node, onViewMessages }: NodeDetailPanelProps) {
  if (!node || node.id === 'root-group-project') {
    return (
      <aside className="detail-panel empty">
        <h3>Topic Details</h3>
        <p>Select a topic to inspect summary, decisions, and messages in this topic.</p>
      </aside>
    );
  }

  return (
    <aside className="detail-panel">
      <h2>{node.title}</h2>

      <p className="section-title">SUMMARY</p>
      <p className="summary-text">{node.summary}</p>

      <div className="metadata-list">
        {node.metadata.firstDiscussed ? <p><span>First Discussed</span>{node.metadata.firstDiscussed}</p> : null}
        {node.metadata.lastActive ? <p><span>Last Active</span>{node.metadata.lastActive}</p> : null}
        {typeof node.metadata.totalMessages === 'number' ? <p><span>Total Messages</span>{node.metadata.totalMessages}</p> : null}
      </div>

      {node.decisions && node.decisions.length > 0 ? (
        <>
          <p className="section-title">DECISIONS</p>
          <ul className="decision-list">
            {node.decisions.map((decision) => (
              <li key={decision}>{decision}</li>
            ))}
          </ul>
        </>
      ) : null}

      {node.supportingMessageIds.length > 0 ? (
        <button className="supporting-button" onClick={onViewMessages}>
          View Messages in This Topic
        </button>
      ) : null}
    </aside>
  );
}
