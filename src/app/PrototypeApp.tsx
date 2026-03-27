import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { ChatView } from './components/ChatView';
import { MapView } from './components/MapView';
import { OperatorView } from './components/OperatorView';
import { TopNav } from './components/TopNav';
import { deriveNodesWithMessageData, getPathToRoot, searchNodeContexts } from './mapUtils';
import { initialExpandedNodeIds, initialMessages, initialNodes } from './mockData';
import { routeMessageToNode } from './routingLogic';
import { AssignmentLog, MapNodeData, Message } from './types';
import type { NodeSearchResult } from './mapUtils';
import type { WorkspaceEvent, WorkspaceSnapshot } from './realtime/protocol';
import { useRealtimeWorkspace } from './realtime/useRealtimeWorkspace';

type WorkspaceState = {
  messages: Message[];
  nodes: MapNodeData[];
  assignmentLog: AssignmentLog[];
  unassignedMessageIds: string[];
};

type WorkspaceAction =
  | { type: 'apply-event'; event: WorkspaceEvent }
  | { type: 'hydrate-snapshot'; snapshot: WorkspaceSnapshot };

function timestampNow() {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${month} ${day}, ${time}`;
}

function cloneSeedNodes() {
  return initialNodes.map((node) => ({ ...node, metadata: { ...node.metadata }, decisions: node.decisions ? [...node.decisions] : undefined, supportingMessageIds: [...node.supportingMessageIds], childrenIds: [...node.childrenIds] }));
}

function cloneSeedMessages() {
  return initialMessages.map((message) => ({ ...message, nodeIds: [...message.nodeIds] }));
}

function createInitialWorkspaceState(): WorkspaceState {
  return {
    messages: cloneSeedMessages(),
    nodes: cloneSeedNodes(),
    assignmentLog: [],
    unassignedMessageIds: [],
  };
}

function workspaceSnapshotFromState(state: WorkspaceState): WorkspaceSnapshot {
  return {
    messages: state.messages,
    nodes: state.nodes,
    assignmentLog: state.assignmentLog,
    unassignedMessageIds: state.unassignedMessageIds,
  };
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  if (action.type === 'hydrate-snapshot') {
    return {
      messages: action.snapshot.messages.map((message) => ({ ...message, nodeIds: [...message.nodeIds] })),
      nodes: action.snapshot.nodes.map((node) => ({
        ...node,
        metadata: { ...node.metadata },
        decisions: node.decisions ? [...node.decisions] : undefined,
        supportingMessageIds: [...node.supportingMessageIds],
        childrenIds: [...node.childrenIds],
      })),
      assignmentLog: action.snapshot.assignmentLog.map((log) => ({ ...log })),
      unassignedMessageIds: [...action.snapshot.unassignedMessageIds],
    };
  }

  const event = action.event;

  if (event.type === 'chat.message.created') {
    const nextMessage = event.payload.message;
    const autoNode = nextMessage.nodeIds[0] ?? null;
    const isUnassigned = !autoNode;
    return {
      ...state,
      messages: state.messages.concat(nextMessage),
      unassignedMessageIds: isUnassigned ? [nextMessage.id, ...state.unassignedMessageIds] : state.unassignedMessageIds.filter((id) => id !== nextMessage.id),
      assignmentLog: [
        {
          messageId: nextMessage.id,
          nodeId: autoNode,
          mode: isUnassigned ? 'unassigned' : 'auto',
          at: nextMessage.timestamp,
        },
        ...state.assignmentLog,
      ],
    };
  }

  if (event.type === 'message.assigned') {
    return {
      ...state,
      messages: state.messages.map((message) =>
        message.id === event.payload.messageId
          ? {
              ...message,
              nodeIds: [event.payload.nodeId],
              assignedManually: true,
              autoMapped: false,
            }
          : message
      ),
      unassignedMessageIds: state.unassignedMessageIds.filter((id) => id !== event.payload.messageId),
      assignmentLog: [{ messageId: event.payload.messageId, nodeId: event.payload.nodeId, mode: 'manual', at: event.payload.at }, ...state.assignmentLog],
    };
  }

  if (event.type === 'node.created') {
    return {
      ...state,
      nodes: state.nodes.map((node) => (node.id === event.payload.parentId ? { ...node, childrenIds: [...node.childrenIds, event.payload.node.id] } : node)).concat(event.payload.node),
    };
  }

  return workspaceReducer(state, { type: 'hydrate-snapshot', snapshot: event.payload.snapshot });
}

function createEventMeta(userId: string, displayName: string, roomId: string) {
  return {
    eventId: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomId,
    timestamp: new Date().toISOString(),
    userId,
    displayName,
  };
}

export default function PrototypeApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'chat' | 'map' | 'operator'>('chat');
  const [chatEntryIntent, setChatEntryIntent] = useState<'startup' | 'tab' | 'focus' | null>('startup');
  const [workspace, dispatchWorkspace] = useReducer(workspaceReducer, undefined, createInitialWorkspaceState);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(initialExpandedNodeIds));
  const [hasEnteredMapView, setHasEnteredMapView] = useState(false);
  const [hasInteractedWithMap, setHasInteractedWithMap] = useState(false);
  const [detailMessagesEnabled, setDetailMessagesEnabled] = useState(true);
  const [draft, setDraft] = useState('');
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NodeSearchResult[]>([]);
  const selfSenderLabel = useMemo(() => (user?.displayName ? user.displayName.split(' ')[0] : 'You'), [user?.displayName]);
  const roomId = 'demo-room';
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;

  const enrichedNodes = useMemo(() => deriveNodesWithMessageData(workspace.nodes, workspace.messages), [workspace.nodes, workspace.messages]);
  const nodeById = useMemo(() => new Map(enrichedNodes.map((node) => [node.id, node])), [enrichedNodes]);
  const breadcrumbNodeIds = useMemo(() => (selectedNodeId ? getPathToRoot(selectedNodeId, enrichedNodes) : []), [selectedNodeId, enrichedNodes]);
  const highlightedNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const highlightedIds = new Set<string>();
    searchResults.forEach((result) => {
      getPathToRoot(result.nodeId, enrichedNodes).forEach((nodeId) => highlightedIds.add(nodeId));
    });
    return highlightedIds;
  }, [searchQuery, searchResults, enrichedNodes]);

  const senderColorByName = useMemo(() => {
    const palette = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#0ea5e9', '#84cc16', '#f97316', '#06b6d4', '#e11d48'];
    const map = new Map<string, string>();
    workspace.messages.forEach((message) => {
      if (map.has(message.sender)) return;
      map.set(message.sender, palette[map.size % palette.length]);
    });
    return map;
  }, [workspace.messages]);

  const applyWorkspaceEvent = useCallback((event: WorkspaceEvent) => {
    dispatchWorkspace({ type: 'apply-event', event });
  }, []);

  const { status: realtimeStatus, publishEvent } = useRealtimeWorkspace({
    wsUrl,
    roomId,
    userId: user?.userId ?? 'guest',
    displayName: user?.displayName ?? 'Guest',
    bootstrapSnapshot: workspaceSnapshotFromState(workspace),
    onSnapshot: (snapshot) => {
      dispatchWorkspace({ type: 'hydrate-snapshot', snapshot });
    },
    onRemoteEvent: (event) => {
      applyWorkspaceEvent(event);
      if (event.type === 'workspace.reset') {
        setSelectedNodeId(null);
        setExpandedNodeIds(new Set(initialExpandedNodeIds));
        setHasEnteredMapView(false);
        setHasInteractedWithMap(false);
        setFocusMessageId(null);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (event.type === 'node.created') {
        setExpandedNodeIds((current) => new Set(current).add(event.payload.parentId));
      }
    },
  });

  const expandParentPath = (nodeId: string) => {
    setExpandedNodeIds((current) => {
      const next = new Set(current);
      let cursor = nodeId;
      while (cursor) {
        const node = nodeById.get(cursor);
        if (!node?.parentId) break;
        next.add(node.parentId);
        cursor = node.parentId;
      }
      return next;
    });
  };

  const getDescendantIds = (nodeId: string) => {
    const descendants = new Set<string>();
    const stack = [...(nodeById.get(nodeId)?.childrenIds ?? [])];
    while (stack.length > 0) {
      const childId = stack.pop();
      if (!childId || descendants.has(childId)) continue;
      descendants.add(childId);
      const child = nodeById.get(childId);
      if (child) stack.push(...child.childrenIds);
    }
    return descendants;
  };

  const applySelectionState = (nodeId: string, options?: { forceExpandTarget?: boolean }) => {
    const node = nodeById.get(nodeId);
    if (!node) return;
    const ancestorIds = getPathToRoot(nodeId, enrichedNodes).slice(0, -1);

    setExpandedNodeIds((current) => {
      if (options?.forceExpandTarget) {
        const next = new Set<string>(ancestorIds);
        if (node.childrenIds.length > 0) next.add(nodeId);
        return next;
      }

      const next = new Set(current);
      ancestorIds.forEach((ancestorId) => next.add(ancestorId));
      const siblingIds = node.parentId ? nodeById.get(node.parentId)?.childrenIds ?? [] : [];
      siblingIds.forEach((siblingId) => {
        if (siblingId === nodeId) return;
        next.delete(siblingId);
        const siblingDescendants = getDescendantIds(siblingId);
        siblingDescendants.forEach((id) => next.delete(id));
      });

      if (node.childrenIds.length > 0) {
        if (options?.forceExpandTarget) {
          next.add(nodeId);
        } else if (next.has(nodeId)) {
          const descendantIds = getDescendantIds(nodeId);
          next.delete(nodeId);
          descendantIds.forEach((id) => next.delete(id));
        } else {
          next.add(nodeId);
        }
      }
      return next;
    });

    setSelectedNodeId(nodeId);
  };

  const sendWorkspaceEvent = (event: WorkspaceEvent) => {
    applyWorkspaceEvent(event);
    publishEvent(event);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    if (!user) return;

    const now = timestampNow();
    const id = `msg-${Date.now()}`;
    const route = routeMessageToNode(text);
    const autoNode = route.nodeId;
    const senderName = selfSenderLabel;

    const nextMessage: Message = {
      id,
      sender: senderName,
      text,
      timestamp: now,
      nodeIds: autoNode ? [autoNode] : [],
      autoMapped: Boolean(autoNode),
      assignedManually: false,
    };

    const event: WorkspaceEvent = {
      ...createEventMeta(user.userId, user.displayName, roomId),
      type: 'chat.message.created',
      payload: { message: nextMessage },
    };

    sendWorkspaceEvent(event);
    setDraft('');

    if (autoNode) {
      expandParentPath(autoNode);
      setSelectedNodeId(autoNode);
    }
  };

  const handleSelectNode = (nodeId: string) => {
    setHasInteractedWithMap(true);
    applySelectionState(nodeId);
  };

  const manuallyAssignMessage = (messageId: string, nodeId: string) => {
    if (!user) return;
    const now = timestampNow();
    const event: WorkspaceEvent = {
      ...createEventMeta(user.userId, user.displayName, roomId),
      type: 'message.assigned',
      payload: { messageId, nodeId, at: now },
    };
    sendWorkspaceEvent(event);
    setSelectedNodeId(nodeId);
    expandParentPath(nodeId);
  };

  const createNode = (title: string, parentId: string) => {
    if (!user) return;
    const parent = nodeById.get(parentId);
    if (!parent) return;

    const id = `node-${Date.now()}`;
    const newNode: MapNodeData = {
      id,
      title,
      parentId,
      summary: 'Topic added from the facilitator console.',
      metadata: {},
      supportingMessageIds: [],
      childrenIds: [],
      depth: Math.min(parent.depth + 1, 3),
    };

    const event: WorkspaceEvent = {
      ...createEventMeta(user.userId, user.displayName, roomId),
      type: 'node.created',
      payload: {
        node: newNode,
        parentId,
      },
    };

    sendWorkspaceEvent(event);
    setExpandedNodeIds((current) => new Set(current).add(parentId));
  };

  const resetWorkspace = () => {
    if (!user) return;
    const snapshot = workspaceSnapshotFromState(createInitialWorkspaceState());
    const event: WorkspaceEvent = {
      ...createEventMeta(user.userId, user.displayName, roomId),
      type: 'workspace.reset',
      payload: { snapshot },
    };
    sendWorkspaceEvent(event);
    setSelectedNodeId(null);
    setExpandedNodeIds(new Set(initialExpandedNodeIds));
    setHasEnteredMapView(false);
    setHasInteractedWithMap(false);
    setFocusMessageId(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectedNode = nodeById.get(selectedNodeId ?? '') ?? enrichedNodes[0];
  const supportingMessages = workspace.messages.filter((message) => selectedNode?.supportingMessageIds.includes(message.id));
  const unassignedMessages = workspace.messages.filter((message) => workspace.unassignedMessageIds.includes(message.id));

  const handleChangeView = (view: 'chat' | 'map' | 'operator') => {
    if (view === 'chat') setChatEntryIntent('tab');
    if (view === 'map' && !hasEnteredMapView) {
      setSelectedNodeId(null);
      setExpandedNodeIds(new Set(initialExpandedNodeIds));
      setHasEnteredMapView(true);
    }
    setCurrentView(view);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchResults(searchNodeContexts(searchQuery, enrichedNodes, workspace.messages).slice(0, 8));
  }, [searchQuery, enrichedNodes, workspace.messages]);

  return (
    <div className="prototype-shell">
      <TopNav
        currentView={currentView}
        onChangeView={handleChangeView}
        sessionLabel={user?.displayName ?? ''}
        realtimeStatus={wsUrl ? realtimeStatus : 'disconnected'}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentView === 'chat' ? (
          <ChatView
            messages={workspace.messages}
            selfSenderLabel={selfSenderLabel}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            focusMessageId={focusMessageId}
            onFocusHandled={() => {
              setFocusMessageId(null);
              setChatEntryIntent(null);
            }}
            senderColorByName={senderColorByName}
            chatEntryIntent={chatEntryIntent}
            onChatEntryIntentHandled={() => setChatEntryIntent(null)}
          />
        ) : currentView === 'map' ? (
          <MapView
            nodes={enrichedNodes}
            selectedNodeId={selectedNodeId}
            expandedNodeIds={expandedNodeIds}
            inStartupOverview={hasEnteredMapView && !hasInteractedWithMap && !selectedNodeId}
            highlightedNodeIds={highlightedNodeIds}
            breadcrumbNodeIds={breadcrumbNodeIds}
            searchQuery={searchQuery}
            searchResults={searchResults}
            messages={supportingMessages}
            messagesVisible={detailMessagesEnabled && supportingMessages.length > 0}
            senderColorByName={senderColorByName}
            onSelectNode={handleSelectNode}
            onToggleMessages={() => setDetailMessagesEnabled((current) => !current)}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            onResultSelect={(nodeId) => applySelectionState(nodeId, { forceExpandTarget: true })}
            onBreadcrumbSelect={(nodeId) => applySelectionState(nodeId, { forceExpandTarget: true })}
            onViewInChat={(messageId) => {
              setFocusMessageId(messageId);
              setChatEntryIntent('focus');
              setCurrentView('chat');
            }}
          />
        ) : (
          <OperatorView
            messages={workspace.messages}
            unassignedMessages={unassignedMessages}
            nodes={enrichedNodes}
            assignmentLog={workspace.assignmentLog}
            realtimeStatus={wsUrl ? realtimeStatus : 'disconnected'}
            onAssign={manuallyAssignMessage}
            onCreateNode={createNode}
            onResetWorkspace={resetWorkspace}
          />
        )}
      </main>
    </div>
  );
}
