import { Message } from '../types';

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
};

export function MessageInput({ value, onChange, onSend, placeholder = 'Write a message...' }: MessageInputProps) {
  const canSend = value.trim().length > 0;

  return (
    <div className="message-input-wrap">
      <input
        className="message-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSend();
          }
        }}
      />
      <button className="send-button" onClick={onSend} aria-label="Send message" type="button" disabled={!canSend}>
        <svg
          className="send-button-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 20V5M12 5l-5 5M12 5l5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function initialsFromSender(sender: string) {
  return sender.slice(0, 1).toUpperCase();
}

export function messageKey(message: Message) {
  return `${message.id}-${message.timestamp}`;
}
