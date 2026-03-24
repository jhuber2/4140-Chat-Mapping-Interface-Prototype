import { useMemo, useState } from 'react';
import { MapNodeData, Message } from '../types';

type OperatorPanelProps = {
  isOpen: boolean;
  recentMessages: Message[];
  unassignedMessages: Message[];
  nodes: MapNodeData[];
  onClose: () => void;
  onAssign: (messageId: string, nodeId: string) => void;
  onCreateNode: (title: string, parentId: string) => void;
};

export function OperatorPanel({
  isOpen,
  recentMessages,
  unassignedMessages,
  nodes,
  onClose,
  onAssign,
  onCreateNode,
}: OperatorPanelProps) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  if (!isOpen) return null;

  return (
    <aside className="operator-panel">
      <div className="operator-header">
        <h3>Operator Mode</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <section>
        <h4>Recent Incoming</h4>
        <div className="operator-list">
          {recentMessages.map((message) => (
            <div key={message.id} className="operator-item">
              <p>
                <strong>{message.sender}</strong> · {message.timestamp}
              </p>
              <p>{message.text}</p>
              <NodeAssignmentPicker
                nodes={nodes}
                nodeById={nodeById}
                initialSelectedId={message.nodeIds[0] ?? null}
                onDone={(nodeId) => onAssign(message.id, nodeId)}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4>Unassigned</h4>
        <div className="operator-list">
          {unassignedMessages.length === 0 ? <p className="muted">No unassigned messages.</p> : null}
          {unassignedMessages.map((message) => (
            <div key={message.id} className="operator-item">
              <p>{message.text}</p>
              <NodeAssignmentPicker nodes={nodes} nodeById={nodeById} initialSelectedId={null} onDone={(nodeId) => onAssign(message.id, nodeId)} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4>Create Node</h4>
        <OperatorCreateForm nodes={nodes} onCreateNode={onCreateNode} />
      </section>
    </aside>
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
      <input name="title" placeholder="New node title" />
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
