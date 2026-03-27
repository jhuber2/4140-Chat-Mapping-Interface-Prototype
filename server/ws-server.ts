import { WebSocketServer, type WebSocket } from 'ws';
import type { ClientToServerMessage, ServerToClientMessage, WorkspaceEvent, WorkspaceSnapshot } from '../src/app/realtime/protocol';
import { isClientToServerMessage } from '../src/app/realtime/protocol';
import { applyNodeDeletionSnapshot } from '../src/app/workspaceApplyNodeDelete';
import { GENERAL_TOPIC_NODE_ID } from '../src/app/mockData';

type RoomState = {
  snapshot: WorkspaceSnapshot | null;
  clients: Set<WebSocket>;
};

const PORT = 8080;
const rooms = new Map<string, RoomState>();
const clientRoom = new Map<WebSocket, string>();

function getOrCreateRoom(roomId: string): RoomState {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  const next: RoomState = {
    snapshot: null,
    clients: new Set<WebSocket>(),
  };
  rooms.set(roomId, next);
  return next;
}

function send(ws: WebSocket, message: ServerToClientMessage) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(message));
}

function applyEventToSnapshot(current: WorkspaceSnapshot, event: WorkspaceEvent): WorkspaceSnapshot {
  if (event.type === 'chat.message.created') {
    return {
      ...current,
      messages: current.messages.concat(event.payload.message),
    };
  }

  if (event.type === 'message.assigned') {
    return {
      ...current,
      messages: current.messages.map((message) =>
        message.id === event.payload.messageId
          ? {
              ...message,
              nodeIds: [event.payload.nodeId],
              assignedManually: true,
              autoMapped: false,
            }
          : message
      ),
      unassignedMessageIds: current.unassignedMessageIds.filter((id) => id !== event.payload.messageId),
      assignmentLog: [{ messageId: event.payload.messageId, nodeId: event.payload.nodeId, mode: 'manual', at: event.payload.at }, ...current.assignmentLog],
    };
  }

  if (event.type === 'node.created') {
    return {
      ...current,
      nodes: current.nodes
        .map((node) => (node.id === event.payload.parentId ? { ...node, childrenIds: [...node.childrenIds, event.payload.node.id] } : node))
        .concat(event.payload.node),
    };
  }

  if (event.type === 'node.deleted') {
    const generalId = event.payload.generalNodeId ?? GENERAL_TOPIC_NODE_ID;
    return applyNodeDeletionSnapshot(current, event.payload.nodeId, generalId);
  }

  return event.payload.snapshot;
}

function broadcastToRoom(roomId: string, message: ServerToClientMessage, except?: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.clients.forEach((client) => {
    if (client === except) return;
    send(client, message);
  });
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(String(raw));
    } catch {
      send(ws, { kind: 'error', message: 'Invalid JSON payload.' });
      return;
    }

    if (!isClientToServerMessage(parsed)) {
      send(ws, { kind: 'error', message: 'Invalid message envelope.' });
      return;
    }

    const message = parsed as ClientToServerMessage;

    if (message.kind === 'room.join') {
      const room = getOrCreateRoom(message.roomId);
      room.clients.add(ws);
      clientRoom.set(ws, message.roomId);

      if (!room.snapshot && message.bootstrapSnapshot) {
        room.snapshot = message.bootstrapSnapshot;
      }

      send(ws, { kind: 'room.joined', roomId: message.roomId });
      if (room.snapshot) {
        send(ws, {
          kind: 'workspace.snapshot',
          roomId: message.roomId,
          snapshot: room.snapshot,
        });
      }
      return;
    }

    if (message.kind === 'snapshot.request') {
      const room = rooms.get(message.roomId);
      if (!room?.snapshot) return;
      send(ws, {
        kind: 'workspace.snapshot',
        roomId: message.roomId,
        snapshot: room.snapshot,
      });
      return;
    }

    if (message.kind === 'workspace.event') {
      const room = rooms.get(message.roomId);
      if (!room) return;

      if (room.snapshot) {
        room.snapshot = applyEventToSnapshot(room.snapshot, message.event);
      }

      broadcastToRoom(
        message.roomId,
        {
          kind: 'workspace.event',
          roomId: message.roomId,
          event: message.event,
        },
        ws
      );
    }
  });

  ws.on('close', () => {
    const roomId = clientRoom.get(ws);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room) {
      room.clients.delete(ws);
      if (room.clients.size === 0) {
        rooms.delete(roomId);
      }
    }
    clientRoom.delete(ws);
  });
});

console.log(`WebSocket relay listening on ws://0.0.0.0:${PORT}`);
