import { useEffect, useMemo, useState } from 'react';
import { ChatView } from './components/ChatView';
import { MapView } from './components/MapView';
import { OperatorPanel } from './components/OperatorPanel';
import { SupportingMessagesModal } from './components/SupportingMessagesModal';
import { TopNav } from './components/TopNav';
import { deriveNodesWithMessageData } from './mapUtils';
import { initialExpandedNodeIds, initialMessages, initialNodes } from './mockData';
import { routeMessageToNode } from './routingLogic';
import { AssignmentLog, MapNodeData, Message } from './types';
import './prototype.css';

function timestampNow() {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${month} ${day}, ${time}`;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'map' | 'search' | 'alerts' | 'filter'>('map');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [nodes, setNodes] = useState<MapNodeData[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('topic-auth');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(initialExpandedNodeIds));
  const [supportingOpen, setSupportingOpen] = useState(false);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [assignmentLog, setAssignmentLog] = useState<AssignmentLog[]>([]);
  const [unassignedMessageIds, setUnassignedMessageIds] = useState<string[]>([]);
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);

  const enrichedNodes = useMemo(() => deriveNodesWithMessageData(nodes, messages), [nodes, messages]);
  const nodeById = useMemo(() => new Map(enrichedNodes.map((node) => [node.id, node])), [enrichedNodes]);
  const senderColorByName = useMemo(() => {
    const palette = [
      '#28a745',
      '#2f6bff',
      '#aa5eff',
      '#d93f7a',
      '#00a6b2',
      '#ef4444',
      '#6d28d9',
      '#0ea5e9',
      '#84cc16',
      '#f59e0b',
      '#14b8a6',
      '#e11d48',
    ];
    const map = new Map<string, string>();
    messages.forEach((message) => {
      if (map.has(message.sender)) return;
      map.set(message.sender, palette[map.size % palette.length]);
    });
    return map;
  }, [messages]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'o') {
        setOperatorOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (currentView !== 'chat') {
      setOperatorOpen(false);
    }
  }, [currentView]);

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
      if (child) {
        stack.push(...child.childrenIds);
      }
    }
    return descendants;
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const now = timestampNow();
    const id = `msg-${Date.now()}`;
    const route = routeMessageToNode(text);
    const autoNode = route.nodeId;

    const nextMessage: Message = {
      id,
      sender: 'Jack',
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
        if (next.has(nodeId)) {
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

  const manuallyAssignMessage = (messageId: string, nodeId: string) => {
    const now = timestampNow();

    // Manual operator assignment for unexpected participant responses.
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
      summary: 'Operator-created topic node for live Wizard-of-Oz demo handling.',
      metadata: {},
      supportingMessageIds: [],
      childrenIds: [],
      depth: Math.min(parent.depth + 1, 3),
    };

    setNodes((current) =>
      current.map((node) => (node.id === parentId ? { ...node, childrenIds: [...node.childrenIds, id] } : node)).concat(newNode)
    );
    setExpandedNodeIds((current) => new Set(current).add(parentId));
  };

  const selectedNode = nodeById.get(selectedNodeId ?? '') ?? enrichedNodes[0];
  const supportingMessages = messages.filter((message) => selectedNode?.supportingMessageIds.includes(message.id));
  const unassignedMessages = messages.filter((message) => unassignedMessageIds.includes(message.id));
  const recentMessages = [...messages].slice(-12).reverse();

  return (
    <div className="prototype-shell">
      <TopNav currentView={currentView} onChangeView={setCurrentView} />

      <main className="main-content">
        {currentView === 'chat' ? (
          <ChatView
            messages={messages}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            focusMessageId={focusMessageId}
            onFocusHandled={() => setFocusMessageId(null)}
            senderColorByName={senderColorByName}
          />
        ) : currentView === 'map' ? (
          <MapView
            nodes={enrichedNodes}
            selectedNodeId={selectedNodeId}
            expandedNodeIds={expandedNodeIds}
            onSelectNode={handleSelectNode}
            onOpenSupporting={() => setSupportingOpen(true)}
          />
        ) : currentView === 'search' ? (
          <section className="utility-page">
            <h2>Search</h2>
            <input className="utility-search-input" placeholder="Search messages, people, or topics..." />
          </section>
        ) : currentView === 'alerts' ? (
          <section className="utility-page">
            <h2>Alerts</h2>
          </section>
        ) : (
          <section className="utility-page">
            <h2>Filter</h2>
          </section>
        )}
      </main>

      <SupportingMessagesModal
        isOpen={supportingOpen}
        title={selectedNode?.title ?? 'Node'}
        messages={supportingMessages}
        onClose={() => setSupportingOpen(false)}
        senderColorByName={senderColorByName}
        onViewInChat={(messageId) => {
          setFocusMessageId(messageId);
          setSupportingOpen(false);
          setCurrentView('chat');
        }}
      />

      <OperatorPanel
        isOpen={operatorOpen}
        onClose={() => setOperatorOpen(false)}
        recentMessages={recentMessages}
        unassignedMessages={unassignedMessages}
        nodes={enrichedNodes}
        onAssign={manuallyAssignMessage}
        onCreateNode={createNode}
      />

      <button className="operator-toggle" title={`Routing logs: ${assignmentLog.length}`} onClick={() => setOperatorOpen((open) => !open)}>
        Ops
      </button>
    </div>
  );
}
