import { useMemo, useState } from 'react';
import { AssignmentLog, MapNodeData, Message } from '../types';

type OperatorViewProps = {
  messages: Message[];
  unassignedMessages: Message[];
  nodes: MapNodeData[];
  assignmentLog: AssignmentLog[];
  realtimeStatus: 'connecting' | 'connected' | 'disconnected';
  onAssign: (messageId: string, nodeId: string) => void;
  onCreateNode: (title: string, parentId: string) => void;
  onResetWorkspace: () => void;
};

export function OperatorView({ messages, unassignedMessages, nodes, assignmentLog, realtimeStatus, onAssign, onCreateNode, onResetWorkspace }: OperatorViewProps) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const rootNodes = useMemo(() => nodes.filter((node) => !node.parentId), [nodes]);
  const [activePickerMessageId, setActivePickerMessageId] = useState<string | null>(null);
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const connectionLabel = realtimeStatus === 'connected' ? 'Connected' : realtimeStatus === 'connecting' ? 'Connecting' : 'Disconnected';

  return (
    <section className="operator-view-layout">
      <div className="operator-view-main">
        <header className="operator-view-header">
          <h2>Facilitator</h2>
          <p>Review incoming messages and route each one to the right topic.</p>
          <div className={`operator-connection-status ${realtimeStatus}`}>
            <span className="operator-status-dot" aria-hidden="true" />
            {connectionLabel}
          </div>
        </header>

        <section className="operator-view-section">
          <h3>Incoming Messages</h3>
          <p className="muted">{messages.length} total messages</p>
          <div className="operator-view-list">
            {orderedMessages.map((message) => (
              <article key={message.id} className="operator-view-item">
                <div className="operator-view-item-header">
                  <p>
                    <strong>{message.sender}</strong> - {message.timestamp}
                  </p>
                  <p className="muted">{statusLabel(message, unassignedMessages)}</p>
                </div>
                <p>{message.text}</p>
                <MessageAssignmentControl
                  message={message}
                  nodes={nodes}
                  nodeById={nodeById}
                  isActive={activePickerMessageId === message.id}
                  onActivate={() => setActivePickerMessageId(message.id)}
                  onDone={(nodeId) => {
                    onAssign(message.id, nodeId);
                    setActivePickerMessageId(null);
                  }}
                />
              </article>
            ))}
          </div>
        </section>
      </div>

      <aside className="operator-view-side">
        <section className="operator-view-section">
          <h3>Topic Reference</h3>
          <div className="operator-topic-tree">
            {rootNodes.map((root) => (
              <TopicTree key={root.id} node={root} nodeById={nodeById} depth={0} />
            ))}
          </div>
        </section>

        <section className="operator-view-section">
          <h3>Create Topic</h3>
          <OperatorCreateForm nodes={nodes} onCreateNode={onCreateNode} />
        </section>

        <section className="operator-view-section">
          <h3>Recent Assignment Activity</h3>
          <div className="operator-view-activity">
            {assignmentLog.length === 0 ? <p className="muted">No assignment activity yet.</p> : null}
            {assignmentLog.slice(0, 8).map((log) => {
              const nodeTitle = log.nodeId ? nodeById.get(log.nodeId)?.title ?? 'Unknown Topic' : 'Unassigned';
              return (
                <p key={`${log.messageId}-${log.at}`}>
                  <strong>{log.mode}</strong>: {nodeTitle}
                </p>
              );
            })}
          </div>
        </section>

        <section className="operator-view-section">
          <button type="button" className="assignment-open-button" onClick={onResetWorkspace}>
            Reset workspace
          </button>
        </section>
      </aside>
    </section>
  );
}

function statusLabel(message: Message, unassignedMessages: Message[]) {
  if (unassignedMessages.some((current) => current.id === message.id)) return 'Unassigned';
  if (message.assignedManually) return 'Manually assigned';
  if (message.autoMapped) return 'Auto-routed';
  return 'Needs review';
}

function TopicTree({ node, nodeById, depth }: { node: MapNodeData; nodeById: Map<string, MapNodeData>; depth: number }) {
  return (
    <div className="operator-topic-item" style={{ marginLeft: depth * 12 }}>
      <p>{node.title}</p>
      {node.childrenIds.map((childId) => {
        const child = nodeById.get(childId);
        if (!child) return null;
        return <TopicTree key={child.id} node={child} nodeById={nodeById} depth={depth + 1} />;
      })}
    </div>
  );
}

function MessageAssignmentControl({
  message,
  nodes,
  nodeById,
  isActive,
  onActivate,
  onDone,
}: {
  message: Message;
  nodes: MapNodeData[];
  nodeById: Map<string, MapNodeData>;
  isActive: boolean;
  onActivate: () => void;
  onDone: (nodeId: string) => void;
}) {
  const assignedId = message.nodeIds[0] ?? null;
  const assignmentPath = assignedId ? nodePath(assignedId, nodeById) : [];

  return (
    <div className="message-assignment-control">
      {assignedId ? (
        <div className="node-breadcrumb">
          {assignmentPath.map((id) => {
            const node = nodeById.get(id);
            if (!node) return null;
            return (
              <button key={id} type="button" onClick={onActivate}>
                {node.title}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="assignment-unassigned">Unassigned</p>
      )}

      <button type="button" className="assignment-open-button" onClick={onActivate}>
        {assignedId ? 'Change topic' : 'Assign topic'}
      </button>

      {isActive ? <NodeAssignmentPicker nodes={nodes} nodeById={nodeById} initialSelectedId={assignedId} onDone={onDone} /> : null}
    </div>
  );
}

function NodeAssignmentPicker({
  nodes,
  nodeById,
  initialSelectedId,
  onDone,
}: {
  nodes: MapNodeData[];
  nodeById: Map<string, MapNodeData>;
  initialSelectedId: string | null;
  onDone: (nodeId: string) => void;
}) {
  const roots = useMemo(() => nodes.filter((node) => !node.parentId), [nodes]);
  const [path, setPath] = useState<string[]>(() => (initialSelectedId ? nodePath(initialSelectedId, nodeById) : []));
  const selectedId = path[path.length - 1] ?? null;
  const selectedNode = selectedId ? nodeById.get(selectedId) : null;

  const columns = useMemo(() => {
    const result: MapNodeData[][] = [roots];
    for (const id of path) {
      const node = nodeById.get(id);
      if (!node || node.childrenIds.length === 0) break;
      const nextColumn = node.childrenIds.map((childId) => nodeById.get(childId)).filter((node): node is MapNodeData => Boolean(node));
      result.push(nextColumn);
    }
    return result;
  }, [roots, path, nodeById]);

  const currentPath = selectedId ? nodePath(selectedId, nodeById) : [];

  return (
    <div className="node-assignment-picker">
      {currentPath.length > 0 ? (
        <div className="node-breadcrumb">
          {currentPath.map((id, index) => {
            const node = nodeById.get(id);
            if (!node) return null;
            return (
              <button key={id} type="button" onClick={() => setPath(currentPath.slice(0, index + 1))}>
                {node.title}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="node-columns">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="node-column">
            {column.map((node) => (
              <button
                type="button"
                key={node.id}
                className={path[columnIndex] === node.id ? 'selected' : ''}
                onClick={() => setPath([...path.slice(0, columnIndex), node.id])}
              >
                {node.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button type="button" className="node-picker-done" disabled={!selectedNode} onClick={() => selectedNode && onDone(selectedNode.id)}>
        Done
      </button>
    </div>
  );
}

function nodePath(nodeId: string, nodeById: Map<string, MapNodeData>) {
  const path: string[] = [];
  let current: string | null = nodeId;
  while (current) {
    const node = nodeById.get(current);
    if (!node) break;
    path.unshift(node.id);
    current = node.parentId;
  }
  return path;
}

function OperatorCreateForm({
  nodes,
  onCreateNode,
}: {
  nodes: MapNodeData[];
  onCreateNode: (title: string, parentId: string) => void;
}) {
  return (
    <form
      className="operator-create"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const title = String(formData.get('title') ?? '').trim();
        const parentId = String(formData.get('parentId') ?? '').trim();
        if (!title || !parentId) return;
        onCreateNode(title, parentId);
        form.reset();
      }}
    >
      <input name="title" placeholder="New topic title" />
      <select name="parentId" defaultValue="topic-general">
        {nodes.map((node) => (
          <option value={node.id} key={node.id}>
            Parent: {node.title}
          </option>
        ))}
      </select>
      <button type="submit">Create</button>
    </form>
  );
}
