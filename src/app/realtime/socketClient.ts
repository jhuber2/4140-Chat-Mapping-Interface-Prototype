import type { ClientToServerMessage, ServerToClientMessage } from './protocol';
import { isServerToClientMessage } from './protocol';

type Handlers = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
  onMessage?: (message: ServerToClientMessage) => void;
};

export class RealtimeSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Handlers = {};
  private reconnectTimer: number | null = null;
  private closedByUser = false;
  private reconnectDelayMs = 1200;
  private readonly maxReconnectDelayMs = 8000;

  constructor(private readonly url: string) {}

  setHandlers(handlers: Handlers) {
    this.handlers = handlers;
  }

  connect() {
    this.closedByUser = false;
    this.openSocket();
  }

  disconnect() {
    this.closedByUser = true;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: ClientToServerMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(message));
  }

  private openSocket() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      this.reconnectDelayMs = 1200;
      this.handlers.onOpen?.();
    });

    this.ws.addEventListener('close', () => {
      this.handlers.onClose?.();
      this.ws = null;
      if (this.closedByUser) return;
      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        this.openSocket();
      }, this.reconnectDelayMs);
      this.reconnectDelayMs = Math.min(this.maxReconnectDelayMs, this.reconnectDelayMs * 1.6);
    });

    this.ws.addEventListener('error', () => {
      this.handlers.onError?.();
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const parsed = JSON.parse(String(event.data));
        if (!isServerToClientMessage(parsed)) return;
        this.handlers.onMessage?.(parsed);
      } catch {
        // Ignore malformed payloads.
      }
    });
  }
}
