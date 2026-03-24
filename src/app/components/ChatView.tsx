import { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { MessageInput, initialsFromSender, messageKey } from './MessageInput';

type ChatViewProps = {
  messages: Message[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  focusMessageId: string | null;
  onFocusHandled: () => void;
  senderColorByName: Map<string, string>;
};

export function ChatView({ messages, draft, onDraftChange, onSend, focusMessageId, onFocusHandled, senderColorByName }: ChatViewProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const suppressAutoScrollRef = useRef(false);

  useEffect(() => {
    if (!threadRef.current) return;
    if (focusMessageId || suppressAutoScrollRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages.length, focusMessageId]);

  useEffect(() => {
    if (!focusMessageId) return;
    const thread = threadRef.current;
    if (!thread) return;

    let attempts = 0;
    const tryFocus = () => {
      const target = rowRefs.current.get(focusMessageId);
      if (target) {
        suppressAutoScrollRef.current = true;
        const nextTop = target.offsetTop - thread.clientHeight / 2 + target.clientHeight / 2;
        thread.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
        setHighlightedMessageId(focusMessageId);
        window.setTimeout(() => {
          setHighlightedMessageId((current) => (current === focusMessageId ? null : current));
          suppressAutoScrollRef.current = false;
          onFocusHandled();
        }, 1000);
        return;
      }

      attempts += 1;
      if (attempts > 12) {
        thread.scrollTop = thread.scrollHeight;
        suppressAutoScrollRef.current = false;
        onFocusHandled();
        return;
      }
      requestAnimationFrame(tryFocus);
    };

    requestAnimationFrame(tryFocus);
  }, [focusMessageId, onFocusHandled]);

  return (
    <section className="chat-view">
      <div className="chat-view-header">
        <h2>Team Conversation</h2>
        <p>{messages.length} messages in this session</p>
      </div>
      <div className="chat-thread" ref={threadRef}>
        {messages.map((message) => {
          const isSelf = message.sender === 'Jack';
          return (
            <article
              key={messageKey(message)}
              className={`chat-row ${isSelf ? 'self' : ''} ${highlightedMessageId === message.id ? 'highlighted' : ''}`}
              ref={(element) => {
                if (element) rowRefs.current.set(message.id, element);
                else rowRefs.current.delete(message.id);
              }}
            >
              {!isSelf && (
                <div className="chat-avatar" style={{ backgroundColor: senderColorByName.get(message.sender) ?? '#2f6bff' }}>
                  {initialsFromSender(message.sender)}
                </div>
              )}
              <div className="chat-body">
                <div className="chat-meta">
                  <span className="chat-sender">{message.sender}</span>
                  <span className="chat-time">{message.timestamp}</span>
                </div>
                <p className="chat-text">{message.text}</p>
              </div>
              {isSelf && (
                <div className="chat-avatar" style={{ backgroundColor: senderColorByName.get(message.sender) ?? '#2f6bff' }}>
                  {initialsFromSender(message.sender)}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <MessageInput value={draft} onChange={onDraftChange} onSend={onSend} placeholder="Message the team" />
    </section>
  );
}
