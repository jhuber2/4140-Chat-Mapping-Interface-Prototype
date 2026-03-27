import { Message, MapNodeData } from '../types';
import { initialsFromSender } from './MessageInput';

type NodeDetailPanelProps = {
  node: MapNodeData | undefined;
  messages: Message[];
  messagesVisible: boolean;
  senderColorByName: Map<string, string>;
  onToggleMessages: () => void;
  onViewInChat: (messageId: string) => void;
};

export function NodeDetailPanel({ node, messages, messagesVisible, senderColorByName, onToggleMessages, onViewInChat }: NodeDetailPanelProps) {
  if (!node || node.id === '0') {
    return (
      <aside className="detail-panel empty">
        <h3>Topic Details</h3>
        <p>Select a topic to inspect summary, decisions, and messages in this topic.</p>
      </aside>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <aside className="detail-panel">
      <div className="detail-panel-card">
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
      </div>

      {hasMessages ? (
        <button className="supporting-button" onClick={onToggleMessages}>
          {messagesVisible ? 'Hide Messages' : 'Show Messages'}
        </button>
      ) : null}

      {hasMessages && messagesVisible ? (
        <div className="detail-messages-section">
          {messages.map((message) => (
            <article key={message.id} className="detail-message-item">
              <div className="chat-avatar" style={{ backgroundColor: senderColorByName.get(message.sender) ?? '#2f6bff' }}>
                {initialsFromSender(message.sender)}
              </div>
              <div className="detail-message-body">
                <div className="chat-meta">
                  <span className="chat-sender">{message.sender}</span>
                  <span className="chat-time">{message.timestamp}</span>
                </div>
                <p className="chat-text">{message.text}</p>
                <button className="modal-jump-button" onClick={() => onViewInChat(message.id)} aria-label={`View message from ${message.sender} in chat`}>
                  View in chat <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
