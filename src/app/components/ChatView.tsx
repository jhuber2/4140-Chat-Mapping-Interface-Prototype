import { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { MessageInput, initialsFromSender, messageKey } from './MessageInput';

type ChatViewProps = {
  messages: Message[];
  selfSenderLabel: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  focusMessageId: string | null;
  onFocusHandled: () => void;
  senderColorByName: Map<string, string>;
  chatEntryIntent: 'startup' | 'tab' | 'focus' | null;
  onChatEntryIntentHandled: () => void;
};

export function ChatView({
  messages,
  selfSenderLabel,
  draft,
  onDraftChange,
  onSend,
  focusMessageId,
  onFocusHandled,
  senderColorByName,
  chatEntryIntent,
  onChatEntryIntentHandled,
}: ChatViewProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const suppressAutoScrollRef = useRef(false);
  const previousMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;

    if (chatEntryIntent === 'startup' || chatEntryIntent === 'tab') {
      if (!focusMessageId && !suppressAutoScrollRef.current) {
        thread.scrollTop = thread.scrollHeight;
      }
      onChatEntryIntentHandled();
      return;
    }

    if (chatEntryIntent === 'focus') {
      onChatEntryIntentHandled();
      return;
    }
  }, [chatEntryIntent, focusMessageId, onChatEntryIntentHandled]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;

    const previousCount = previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    const didAppendMessage = messages.length > previousCount;
    if (!didAppendMessage) return;
    if (focusMessageId || suppressAutoScrollRef.current) return;
      thread.scrollTop = thread.scrollHeight;
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
        <h2>Team 3 CPSC 4140</h2>
        <p>{messages.length} messages</p>
      </div>
      <div className="chat-thread" ref={threadRef}>
        {messages.map((message) => {
          const isSelf = message.sender === selfSenderLabel;
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
