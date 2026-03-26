import { useEffect, useRef, useState } from 'react';
import { RealtimeSocketClient } from './socketClient';
import type { RealtimeConnectionStatus, WorkspaceEvent, WorkspaceSnapshot } from './protocol';

type RealtimeWorkspaceParams = {
  wsUrl: string | undefined;
  roomId: string;
  userId: string;
  displayName: string;
  bootstrapSnapshot: WorkspaceSnapshot;
  onSnapshot: (snapshot: WorkspaceSnapshot) => void;
  onRemoteEvent: (event: WorkspaceEvent) => void;
};

export function useRealtimeWorkspace({
  wsUrl,
  roomId,
  userId,
  displayName,
  bootstrapSnapshot,
  onSnapshot,
  onRemoteEvent,
}: RealtimeWorkspaceParams) {
  const [status, setStatus] = useState<RealtimeConnectionStatus>('disconnected');
  const clientRef = useRef<RealtimeSocketClient | null>(null);
  const bootstrapRef = useRef<WorkspaceSnapshot>(bootstrapSnapshot);
  const onSnapshotRef = useRef(onSnapshot);
  const onRemoteEventRef = useRef(onRemoteEvent);

  bootstrapRef.current = bootstrapSnapshot;
  onSnapshotRef.current = onSnapshot;
  onRemoteEventRef.current = onRemoteEvent;

  useEffect(() => {
    if (!wsUrl) {
      setStatus('disconnected');
      return;
    }

    const client = new RealtimeSocketClient(wsUrl);
    clientRef.current = client;
    setStatus('connecting');

    client.setHandlers({
      onOpen: () => {
        setStatus('connected');
        client.send({
          kind: 'room.join',
          roomId,
          userId,
          displayName,
          bootstrapSnapshot: bootstrapRef.current,
        });
        client.send({ kind: 'snapshot.request', roomId });
      },
      onClose: () => {
        setStatus('connecting');
      },
      onError: () => {
        setStatus('disconnected');
      },
      onMessage: (message) => {
        if (message.kind === 'workspace.snapshot' && message.roomId === roomId) {
          onSnapshotRef.current(message.snapshot);
          return;
        }
        if (message.kind === 'workspace.event' && message.roomId === roomId) {
          onRemoteEventRef.current(message.event);
        }
      },
    });

    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
      setStatus('disconnected');
    };
  }, [wsUrl, roomId, userId, displayName]);

  const publishEvent = (event: WorkspaceEvent) => {
    clientRef.current?.send({
      kind: 'workspace.event',
      roomId,
      event,
    });
  };

  return {
    status,
    publishEvent,
  };
}
