import type { AssignmentLog, MapNodeData, Message } from '../types';

export type WorkspaceSnapshot = {
  messages: Message[];
  nodes: MapNodeData[];
  assignmentLog: AssignmentLog[];
  unassignedMessageIds: string[];
};

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export type WorkspaceEventType =
  | 'chat.message.created'
  | 'message.assigned'
  | 'node.created'
  | 'node.deleted'
  | 'workspace.reset';

export type ChatMessageCreatedEvent = {
  eventId: string;
  roomId: string;
  timestamp: string;
  userId: string;
  displayName: string;
  type: 'chat.message.created';
  payload: {
    message: Message;
  };
};

export type MessageAssignedEvent = {
  eventId: string;
  roomId: string;
  timestamp: string;
  userId: string;
  displayName: string;
  type: 'message.assigned';
  payload: {
    messageId: string;
    nodeId: string;
    at: string;
  };
};

export type NodeCreatedEvent = {
  eventId: string;
  roomId: string;
  timestamp: string;
  userId: string;
  displayName: string;
  type: 'node.created';
  payload: {
    node: MapNodeData;
    parentId: string;
  };
};

export type NodeDeletedEvent = {
  eventId: string;
  roomId: string;
  timestamp: string;
  userId: string;
  displayName: string;
  type: 'node.deleted';
  payload: {
    nodeId: string;
    generalNodeId: string;
  };
};

export type WorkspaceResetEvent = {
  eventId: string;
  roomId: string;
  timestamp: string;
  userId: string;
  displayName: string;
  type: 'workspace.reset';
  payload: {
    snapshot: WorkspaceSnapshot;
  };
};

export type WorkspaceEvent =
  | ChatMessageCreatedEvent
  | MessageAssignedEvent
  | NodeCreatedEvent
  | NodeDeletedEvent
  | WorkspaceResetEvent;

export type ClientToServerMessage =
  | {
      kind: 'room.join';
      roomId: string;
      userId: string;
      displayName: string;
      bootstrapSnapshot?: WorkspaceSnapshot;
    }
  | {
      kind: 'snapshot.request';
      roomId: string;
    }
  | {
      kind: 'workspace.event';
      roomId: string;
      event: WorkspaceEvent;
    };

export type ServerToClientMessage =
  | {
      kind: 'room.joined';
      roomId: string;
    }
  | {
      kind: 'workspace.snapshot';
      roomId: string;
      snapshot: WorkspaceSnapshot;
    }
  | {
      kind: 'workspace.event';
      roomId: string;
      event: WorkspaceEvent;
    }
  | {
      kind: 'error';
      roomId?: string;
      message: string;
    };

export function isServerToClientMessage(value: unknown): value is ServerToClientMessage {
  if (!value || typeof value !== 'object') return false;
  return 'kind' in value;
}

export function isClientToServerMessage(value: unknown): value is ClientToServerMessage {
  if (!value || typeof value !== 'object') return false;
  return 'kind' in value;
}
