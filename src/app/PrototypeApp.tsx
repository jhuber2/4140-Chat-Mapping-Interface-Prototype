import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { ChatView } from './components/ChatView';
import { MapView } from './components/MapView';
import { OperatorView } from './components/OperatorView';
import { SupportingMessagesModal } from './components/SupportingMessagesModal';
import { TopNav } from './components/TopNav';
import { deriveNodesWithMessageData, getPathToRoot, searchNodeContexts } from './mapUtils';
import { initialExpandedNodeIds, initialMessages, initialNodes } from './mockData';
import { routeMessageToNode } from './routingLogic';
import { AssignmentLog, MapNodeData, Message } from './types';
import type { NodeSearchResult } from './mapUtils';

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

export default function PrototypeApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'chat' | 'map' | 'operator'>('chat');
  const [chatEntryIntent, setChatEntryIntent] = useState<'startup' | 'tab' | 'focus' | null>('startup');
  const [messages, setMessages] = useState<Message[]>(() => cloneSeedMessages());
  const [nodes, setNodes] = useState<MapNodeData[]>(() => cloneSeedNodes());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(initialExpandedNodeIds));
  const [hasEnteredMapView, setHasEnteredMapView] = useState(false);
  const [hasInteractedWithMap, setHasInteractedWithMap] = useState(false);
  const [supportingOpen, setSupportingOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [assignmentLog, setAssignmentLog] = useState<AssignmentLog[]>([]);
  const [unassignedMessageIds, setUnassignedMessageIds] = useState<string[]>([]);
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NodeSearchResult[]>([]);
  const selfSenderLabel = useMemo(() => (user?.displayName ? user.displayName.split(' ')[0] : 'You'), [user?.displayName]);

  const enrichedNodes = useMemo(() => deriveNodesWithMessageData(nodes, messages), [nodes, messages]);
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
    const palette = ['#28a745', '#2f6bff', '#aa5eff', '#d93f7a', '#00a6b2', '#ef4444', '#6d28d9', '#0ea5e9', '#84cc16', '#f59e0b', '#14b8a6', '#e11d48'];
    const map = new Map<string, string>();
    messages.forEach((message) => {
      if (map.has(message.sender)) return;
      map.set(message.sender, palette[map.size % palette.length]);
    });
    return map;
  }, [messages]);

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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchResults(searchNodeContexts(searchQuery, enrichedNodes, messages).slice(0, 8));
  }, [searchQuery, enrichedNodes, messages]);

  const applySelectionState = (nodeId: string, options?: { forceExpandTarget?: boolean }) => {
    const node = nodeById.get(nodeId);
    if (!node) return;

    setExpandedNodeIds((current) => {
      const next = new Set(current);
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

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

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

    setMessages((current) => [...current, nextMessage]);
    setDraft('');

    if (!autoNode) {
      setUnassignedMessageIds((current) => [id, ...current]);
      setAssignmentLog((current) => [{ messageId: id, nodeId: null, mode: 'unassigned', at: now }, ...current]);
      return;
    }

    setUnassignedMessageIds((current) => current.filter((messageId) => messageId !== id));
    expandParentPath(autoNode);
    setSelectedNodeId(autoNode);
    setAssignmentLog((current) => [{ messageId: id, nodeId: autoNode, mode: 'auto', at: now }, ...current]);
  };

  const handleSelectNode = (nodeId: string) => {
    setHasInteractedWithMap(true);
    applySelectionState(nodeId);
  };

  const manuallyAssignMessage = (messageId: string, nodeId: string) => {
    const now = timestampNow();

    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              nodeIds: [nodeId],
              assignedManually: true,
              autoMapped: false,
            }
          : message
      )
    );

    setUnassignedMessageIds((current) => current.filter((id) => id !== messageId));
    setSelectedNodeId(nodeId);
    expandParentPath(nodeId);
    setAssignmentLog((current) => [{ messageId, nodeId, mode: 'manual', at: now }, ...current]);
  };

  const createNode = (title: string, parentId: string) => {
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

    setNodes((current) => current.map((node) => (node.id === parentId ? { ...node, childrenIds: [...node.childrenIds, id] } : node)).concat(newNode));
    setExpandedNodeIds((current) => new Set(current).add(parentId));
  };

  const resetWorkspace = () => {
    setMessages(cloneSeedMessages());
    setNodes(cloneSeedNodes());
    setAssignmentLog([]);
    setUnassignedMessageIds([]);
    setSelectedNodeId(null);
    setExpandedNodeIds(new Set(initialExpandedNodeIds));
    setHasEnteredMapView(false);
    setHasInteractedWithMap(false);
    setSupportingOpen(false);
    setFocusMessageId(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectedNode = nodeById.get(selectedNodeId ?? '') ?? enrichedNodes[0];
  const supportingMessages = messages.filter((message) => selectedNode?.supportingMessageIds.includes(message.id));
  const unassignedMessages = messages.filter((message) => unassignedMessageIds.includes(message.id));

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

  return (
    <div className="prototype-shell">
      <TopNav
        currentView={currentView}
        onChangeView={handleChangeView}
        sessionLabel={user?.displayName ?? ''}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentView === 'chat' ? (
          <ChatView
            messages={messages}
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
            onSelectNode={handleSelectNode}
            onOpenSupporting={() => setSupportingOpen(true)}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            onResultSelect={(nodeId) => applySelectionState(nodeId, { forceExpandTarget: true })}
            onBreadcrumbSelect={(nodeId) => applySelectionState(nodeId, { forceExpandTarget: true })}
          />
        ) : (
          <OperatorView
            messages={messages}
            unassignedMessages={unassignedMessages}
            nodes={enrichedNodes}
            assignmentLog={assignmentLog}
            onAssign={manuallyAssignMessage}
            onCreateNode={createNode}
            onResetWorkspace={resetWorkspace}
          />
        )}
      </main>

      <SupportingMessagesModal
        isOpen={supportingOpen}
        title={selectedNode?.title ?? 'Topic'}
        messages={supportingMessages}
        onClose={() => setSupportingOpen(false)}
        senderColorByName={senderColorByName}
        onViewInChat={(messageId) => {
          setFocusMessageId(messageId);
          setChatEntryIntent('focus');
          setSupportingOpen(false);
          setCurrentView('chat');
        }}
      />
    </div>
  );
}
