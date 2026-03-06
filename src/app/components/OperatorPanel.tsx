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
              <select onChange={(event) => onAssign(message.id, event.target.value)} defaultValue="">
                <option value="" disabled>
                  Assign to node
                </option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title}
                  </option>
                ))}
              </select>
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
              <select onChange={(event) => onAssign(message.id, event.target.value)} defaultValue="">
                <option value="" disabled>
                  Assign to node
                </option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title}
                  </option>
                ))}
              </select>
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
