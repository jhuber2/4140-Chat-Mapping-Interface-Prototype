import { Message } from '../types';
import { initialsFromSender } from './MessageInput';

type SupportingMessagesModalProps = {
  isOpen: boolean;
  title: string;
  messages: Message[];
  onClose: () => void;
};

export function SupportingMessagesModal({ isOpen, title, messages, onClose }: SupportingMessagesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Supporting Messages</h3>
            <p>{title}</p>
          </div>
          <button aria-label="Close modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-messages">
          {messages.map((message) => (
            <article key={message.id} className="modal-message-row">
              <div className="chat-avatar">{initialsFromSender(message.sender)}</div>
              <div className="modal-message-body">
                <div className="chat-meta">
                  <span className="chat-sender">{message.sender}</span>
                  <span className="chat-time">{message.timestamp}</span>
                </div>
                <p className="chat-text">{message.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
