import { Message } from '../types';

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
};

export function MessageInput({ value, onChange, onSend, placeholder = 'Write a message...' }: MessageInputProps) {
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
      <button className="send-button" onClick={onSend}>
        Send
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
