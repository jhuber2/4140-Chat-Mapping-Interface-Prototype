import { useMemo, useState } from 'react';
import { AssignmentLog, MapNodeData, Message } from '../types';
import { CreateTopicColumnPicker } from './CreateTopicColumnPicker';
import { DeleteTopicColumnPicker } from './DeleteTopicColumnPicker';
import { NodeFinderColumns, nodePath, useNodeFinderState } from './nodeFinder';

type OperatorViewProps = {
  messages: Message[];
  unassignedMessages: Message[];
  nodes: MapNodeData[];
  assignmentLog: AssignmentLog[];
  realtimeStatus: 'connecting' | 'connected' | 'disconnected';
  onAssign: (messageId: string, nodeId: string) => void;
  onCreateNode: (title: string, parentId: string, summary: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onResetWorkspace: () => void;
};

export function OperatorView({
  messages,
  unassignedMessages,
  nodes,
  assignmentLog,
  realtimeStatus,
  onAssign,
  onCreateNode,
  onDeleteNode,
  onResetWorkspace,
}: OperatorViewProps) {
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
          <CreateTopicColumnPicker nodes={nodes} nodeById={nodeById} onCreateNode={onCreateNode} />
        </section>

        <section className="operator-view-section">
          <h3>Delete Topic</h3>
          <DeleteTopicColumnPicker nodes={nodes} nodeById={nodeById} onDeleteNode={onDeleteNode} />
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
  const { path, setPath, columns, currentPath, selectedNode } = useNodeFinderState(nodes, nodeById, initialSelectedId);

  return (
    <div className="node-assignment-picker">
      <NodeFinderColumns path={path} setPath={setPath} columns={columns} currentPath={currentPath} nodeById={nodeById} />
      <button type="button" className="node-picker-done" disabled={!selectedNode} onClick={() => selectedNode && onDone(selectedNode.id)}>
        Done
      </button>
    </div>
  );
}
