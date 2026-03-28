import { useMemo, useState } from 'react';
import { MapNodeData, Message } from '../types';
import { CreateTopicColumnPicker } from './CreateTopicColumnPicker';
import { NodeFinderColumns, nodePath, useNodeFinderState } from './nodeFinder';

type OperatorPanelProps = {
  isOpen: boolean;
  recentMessages: Message[];
  unassignedMessages: Message[];
  nodes: MapNodeData[];
  onClose: () => void;
  onAssign: (messageId: string, nodeId: string) => void;
  onCreateNode: (title: string, parentId: string, summary: string) => void;
  onResetWorkspace: () => void;
};

export function OperatorPanel({
  isOpen,
  recentMessages,
  unassignedMessages,
  nodes,
  onClose,
  onAssign,
  onCreateNode,
  onResetWorkspace,
}: OperatorPanelProps) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const [activePickerMessageId, setActivePickerMessageId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <aside className="operator-panel">
      <div className="operator-header">
        <h3>Facilitator tools</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <section>
        <h4>Recent Messages</h4>
        <div className="operator-list">
          {recentMessages.map((message) => (
            <div key={message.id} className="operator-item">
              <p>
                <strong>{message.sender}</strong> - {message.timestamp}
              </p>
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
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4>Unassigned Messages</h4>
        <div className="operator-list">
          {unassignedMessages.length === 0 ? <p className="muted">No unassigned messages.</p> : null}
          {unassignedMessages.map((message) => (
            <div key={message.id} className="operator-item">
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
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4>Create Topic</h4>
        <CreateTopicColumnPicker nodes={nodes} nodeById={nodeById} onCreateNode={onCreateNode} />
      </section>

      <section>
        <button type="button" className="assignment-open-button" onClick={onResetWorkspace}>
          Reset workspace
        </button>
      </section>
    </aside>
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
