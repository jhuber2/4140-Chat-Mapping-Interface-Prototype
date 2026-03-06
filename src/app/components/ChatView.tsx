import { Message } from '../types';
import { MessageInput, initialsFromSender, messageKey } from './MessageInput';

type ChatViewProps = {
  messages: Message[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export function ChatView({ messages, draft, onDraftChange, onSend }: ChatViewProps) {
  return (
    <section className="chat-view">
      <div className="chat-view-header">
        <h2>Team Conversation</h2>
        <p>{messages.length} messages in this session</p>
      </div>
      <div className="chat-thread">
        {messages.map((message) => (
          <article key={messageKey(message)} className="chat-row">
            <div className="chat-avatar">{initialsFromSender(message.sender)}</div>
            <div className="chat-body">
              <div className="chat-meta">
                <span className="chat-sender">{message.sender}</span>
                <span className="chat-time">{message.timestamp}</span>
              </div>
              <p className="chat-text">{message.text}</p>
            </div>
          </article>
        ))}
      </div>
      <MessageInput value={draft} onChange={onDraftChange} onSend={onSend} placeholder="Message the team" />
    </section>
  );
}
