import { Message } from '../types';
import { MessageInput, initialsFromSender, messageKey } from './MessageInput';

type ChatViewProps = {
  messages: Message[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export function ChatView({ messages, draft, onDraftChange, onSend }: ChatViewProps) {
  const avatarClassForSender = (sender: string) => {
    const paletteIndex = sender.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
    return `avatar-color-${paletteIndex + 1}`;
  };

  return (
    <section className="chat-view">
      <div className="chat-view-header">
        <h2>Team Conversation</h2>
        <p>{messages.length} messages in this session</p>
      </div>
      <div className="chat-thread">
        {messages.map((message) => {
          const isSelf = message.sender === 'Jack';
          return (
            <article key={messageKey(message)} className={`chat-row ${isSelf ? 'self' : ''}`}>
              {!isSelf && <div className={`chat-avatar ${avatarClassForSender(message.sender)}`}>{initialsFromSender(message.sender)}</div>}
              <div className="chat-body">
                <div className="chat-meta">
                  <span className="chat-sender">{message.sender}</span>
                  <span className="chat-time">{message.timestamp}</span>
                </div>
                <p className="chat-text">{message.text}</p>
              </div>
              {isSelf && <div className={`chat-avatar ${avatarClassForSender(message.sender)}`}>{initialsFromSender(message.sender)}</div>}
            </article>
          );
        })}
      </div>
      <MessageInput value={draft} onChange={onDraftChange} onSend={onSend} placeholder="Message the team" />
    </section>
  );
}
