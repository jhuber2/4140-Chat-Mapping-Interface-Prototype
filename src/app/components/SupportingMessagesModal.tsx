import { Message } from '../types';
import { initialsFromSender } from './MessageInput';

type SupportingMessagesModalProps = {
  isOpen: boolean;
  title: string;
  messages: Message[];
  onClose: () => void;
  senderColorByName: Map<string, string>;
  onViewInChat: (messageId: string) => void;
};

export function SupportingMessagesModal({ isOpen, title, messages, onClose, senderColorByName, onViewInChat }: SupportingMessagesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Messages in Topic</h3>
            <p>{title}</p>
          </div>
          <button aria-label="Close modal" onClick={onClose}>x</button>
        </div>

        <div className="modal-messages">
          {messages.map((message) => (
            <article key={message.id} className="modal-message-row">
              <div className="chat-avatar" style={{ backgroundColor: senderColorByName.get(message.sender) ?? '#2f6bff' }}>
                {initialsFromSender(message.sender)}
              </div>
              <div className="modal-message-body">
                <div className="chat-meta">
                  <span className="chat-sender">{message.sender}</span>
                  <span className="chat-time">{message.timestamp}</span>
                </div>
                <p className="chat-text">{message.text}</p>
                <button className="modal-jump-button" onClick={() => onViewInChat(message.id)}>
                  View in chat
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
